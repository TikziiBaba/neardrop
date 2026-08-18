use crate::networking::protocol::{FileMetadata, Frame, FrameCodec, DEFAULT_CHUNK_SIZE};
use crate::storage::models::TransferHistoryItem;
use crate::storage::LocalStorage;
use crate::transfer::chunker::FileChunker;
use crate::transfer::hasher::StreamHasher;
use crate::transfer::progress::{ProgressTracker, TransferStatus};
use futures_util::{SinkExt, StreamExt};
use std::fs;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tauri::{AppHandle, Emitter};
use tokio::net::TcpStream;
use tokio_util::codec::Framed;

pub struct TransferClient;

impl TransferClient {
    /// Connects to receiver device and streams files
    pub async fn send_files(
        app: AppHandle,
        transfer_id: String,
        target_ip: String,
        target_port: u16,
        target_device_id: String,
        target_device_name: String,
        sender_device_id: String,
        sender_device_name: String,
        sender_public_key: String,
        file_paths: Vec<PathBuf>,
        storage: Arc<LocalStorage>,
        cancel_token: Arc<AtomicBool>,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let addr = format!("{}:{}", target_ip, target_port);
        let stream = TcpStream::connect(&addr).await?;
        let mut framed = Framed::new(stream, FrameCodec::new());

        // 1. Prepare File Metadatas & total size
        let mut metadatas = Vec::new();
        let mut total_size = 0u64;

        for (idx, path) in file_paths.iter().enumerate() {
            let metadata = fs::metadata(path)?;
            let size = metadata.len();
            total_size += size;

            let filename = path
                .file_name()
                .map(|n| n.to_string_lossy().to_string())
                .unwrap_or_else(|| format!("file_{}", idx));

            // Fast streaming hash computation for metadata header
            let checksum = StreamHasher::compute_file_sha256(path).unwrap_or_default();

            metadatas.push(FileMetadata {
                file_index: idx,
                filename,
                relative_path: "".into(),
                size,
                checksum,
            });
        }

        let mut tracker = ProgressTracker::new(
            transfer_id.clone(),
            "send".into(),
            target_device_id.clone(),
            target_device_name.clone(),
            file_paths.len(),
            total_size,
        );
        tracker.status = TransferStatus::WaitingForAcceptance;
        let _ = app.emit("neardrop://transfer-progress", tracker.snapshot());

        // 2. Send Handshake Request
        let handshake_frame = Frame::HandshakeRequest {
            transfer_id: transfer_id.clone(),
            sender_device_id,
            sender_device_name,
            sender_public_key,
            files: metadatas.clone(),
            total_size,
        };

        framed.send(handshake_frame).await?;

        // 3. Await Handshake Response
        let response_frame = match framed.next().await {
            Some(Ok(f)) => f,
            Some(Err(e)) => return Err(e.into()),
            None => {
                tracker.status = TransferStatus::Failed;
                tracker.error_message = Some("Connection closed by peer".into());
                let _ = app.emit("neardrop://transfer-progress", tracker.snapshot());
                return Ok(());
            }
        };

        match response_frame {
            Frame::HandshakeResponse { accepted, reason, .. } => {
                if !accepted {
                    tracker.status = TransferStatus::Rejected;
                    tracker.error_message = reason;
                    let _ = app.emit("neardrop://transfer-progress", tracker.snapshot());
                    return Ok(());
                }
            }
            _ => {
                tracker.status = TransferStatus::Failed;
                tracker.error_message = Some("Unexpected response frame from peer".into());
                let _ = app.emit("neardrop://transfer-progress", tracker.snapshot());
                return Ok(());
            }
        }

        // 4. Stream Files
        tracker.status = TransferStatus::Transferring;
        let _ = app.emit("neardrop://transfer-progress", tracker.snapshot());

        let mut completed_file_names = Vec::new();

        for (idx, path) in file_paths.iter().enumerate() {
            if cancel_token.load(Ordering::Relaxed) {
                let _ = framed
                    .send(Frame::TransferCancelled {
                        transfer_id: transfer_id.clone(),
                        reason: "Cancelled by sender".into(),
                    })
                    .await;
                tracker.status = TransferStatus::Cancelled;
                let _ = app.emit("neardrop://transfer-progress", tracker.snapshot());
                return Ok(());
            }

            let meta = &metadatas[idx];
            tracker.set_file(idx, meta.filename.clone());
            completed_file_names.push(meta.filename.clone());
            let _ = app.emit("neardrop://transfer-progress", tracker.snapshot());

            // Send File Header
            framed
                .send(Frame::FileHeader {
                    transfer_id: transfer_id.clone(),
                    file_index: idx,
                    filename: meta.filename.clone(),
                    relative_path: meta.relative_path.clone(),
                    size: meta.size,
                    checksum: meta.checksum.clone(),
                })
                .await?;

            // Stream chunks
            let mut offset = 0u64;
            loop {
                if cancel_token.load(Ordering::Relaxed) {
                    let _ = framed
                        .send(Frame::TransferCancelled {
                            transfer_id: transfer_id.clone(),
                            reason: "Cancelled by sender".into(),
                        })
                        .await;
                    tracker.status = TransferStatus::Cancelled;
                    let _ = app.emit("neardrop://transfer-progress", tracker.snapshot());
                    return Ok(());
                }

                let (chunk_data, bytes_read, is_eof) =
                    FileChunker::read_chunk(path, offset, DEFAULT_CHUNK_SIZE)?;

                if bytes_read > 0 {
                    framed
                        .send(Frame::Chunk {
                            transfer_id: transfer_id.clone(),
                            file_index: idx,
                            chunk_offset: offset,
                            data: chunk_data,
                        })
                        .await?;

                    offset += bytes_read as u64;
                    tracker.update_bytes(bytes_read as u64);
                    let _ = app.emit("neardrop://transfer-progress", tracker.snapshot());
                }

                if is_eof {
                    break;
                }
            }

            // Send File Finished Frame
            framed
                .send(Frame::FileFinished {
                    transfer_id: transfer_id.clone(),
                    file_index: idx,
                    received_checksum: meta.checksum.clone(),
                })
                .await?;
        }

        // 5. Send Transfer Complete Frame
        framed
            .send(Frame::TransferComplete {
                transfer_id: transfer_id.clone(),
                success: true,
                message: "Transfer completed successfully".into(),
            })
            .await?;

        tracker.status = TransferStatus::Completed;
        let _ = app.emit("neardrop://transfer-progress", tracker.snapshot());

        // Save history item
        let history_item = TransferHistoryItem {
            id: transfer_id,
            direction: "send".into(),
            mode: "lan".into(),
            peer_device_id: target_device_id,
            peer_device_name: target_device_name,
            total_bytes: total_size,
            files_count: file_paths.len(),
            file_names: completed_file_names,
            status: "completed".into(),
            started_at: chrono::Utc::now().timestamp(),
            completed_at: Some(chrono::Utc::now().timestamp()),
        };
        let _ = storage.add_history_item(history_item);

        Ok(())
    }
}

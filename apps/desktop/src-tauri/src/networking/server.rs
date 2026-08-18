use crate::networking::protocol::{Frame, FrameCodec};
use crate::security::sanitizer::PathSanitizer;
use crate::storage::models::TransferHistoryItem;
use crate::storage::LocalStorage;
use crate::transfer::hasher::StreamHasher;
use crate::transfer::progress::{ProgressTracker, TransferStatus};
use futures_util::{SinkExt, StreamExt};
use parking_lot::RwLock;
use std::collections::HashMap;
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::net::SocketAddr;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tauri::{AppHandle, Emitter};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::oneshot;
use tokio_util::codec::Framed;

pub type PendingApprovalMap = Arc<RwLock<HashMap<String, oneshot::Sender<bool>>>>;

pub struct TransferServer;

impl TransferServer {
    /// Starts background TCP receiver server for incoming file transfers
    pub fn start(
        app_handle: AppHandle,
        port: u16,
        download_path: Arc<RwLock<PathBuf>>,
        auto_accept: Arc<RwLock<bool>>,
        trusted_keys: Arc<RwLock<Vec<String>>>,
        pending_approvals: PendingApprovalMap,
        storage: Arc<LocalStorage>,
        shutdown: Arc<AtomicBool>,
    ) {
        tokio::spawn(async move {
            let addr = format!("0.0.0.0:{}", port);
            let listener = match TcpListener::bind(&addr).await {
                Ok(l) => l,
                Err(e) => {
                    log::error!("Failed to bind TCP transfer server on {}: {}", addr, e);
                    return;
                }
            };

            log::info!("TCP Transfer Server listening on {}", addr);

            while !shutdown.load(Ordering::Relaxed) {
                match listener.accept().await {
                    Ok((socket, peer_addr)) => {
                        let app = app_handle.clone();
                        let dl_path = download_path.read().clone();
                        let auto_acc = *auto_accept.read();
                        let tr_keys = trusted_keys.clone();
                        let pendings = pending_approvals.clone();
                        let stor = storage.clone();

                        tokio::spawn(async move {
                            if let Err(e) = Self::handle_incoming_connection(
                                socket, peer_addr, app, dl_path, auto_acc, tr_keys, pendings, stor,
                            )
                            .await
                            {
                                log::error!("Transfer connection error: {}", e);
                            }
                        });
                    }
                    Err(e) => {
                        log::warn!("TCP accept error: {}", e);
                    }
                }
            }

            log::info!("TCP Transfer Server stopped");
        });
    }

    async fn handle_incoming_connection(
        stream: TcpStream,
        _peer_addr: SocketAddr,
        app: AppHandle,
        download_dir: PathBuf,
        auto_accept_trusted: bool,
        trusted_keys: Arc<RwLock<Vec<String>>>,
        pending_approvals: PendingApprovalMap,
        storage: Arc<LocalStorage>,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let mut framed = Framed::new(stream, FrameCodec::new());

        // 1. Await Handshake Request
        let first_frame = match framed.next().await {
            Some(Ok(f)) => f,
            Some(Err(e)) => return Err(e.into()),
            None => return Ok(()),
        };

        let (transfer_id, sender_id, sender_name, sender_key, files, total_size) = match first_frame {
            Frame::HandshakeRequest {
                transfer_id,
                sender_device_id,
                sender_device_name,
                sender_public_key,
                files,
                total_size,
            } => (transfer_id, sender_device_id, sender_device_name, sender_public_key, files, total_size),
            _ => {
                let _ = framed
                    .send(Frame::HandshakeResponse {
                        transfer_id: "".into(),
                        accepted: false,
                        reason: Some("Expected HandshakeRequest".into()),
                    })
                    .await;
                return Ok(());
            }
        };

        // 2. Check Trust / Auto-Accept
        let is_trusted = {
            let keys = trusted_keys.read();
            keys.contains(&sender_key)
        };

        let should_accept = if is_trusted && auto_accept_trusted {
            true
        } else {
            // Request user approval via UI event
            let (tx, rx) = oneshot::channel::<bool>();
            {
                let mut map = pending_approvals.write();
                map.insert(transfer_id.clone(), tx);
            }

            // Emit approval request event to frontend
            let req_payload = serde_json::json!({
                "transfer_id": transfer_id,
                "sender_device_id": sender_id,
                "sender_device_name": sender_name,
                "files_count": files.len(),
                "total_size": total_size,
                "file_names": files.iter().map(|f| f.filename.clone()).collect::<Vec<_>>(),
                "is_trusted": is_trusted
            });
            let _ = app.emit("neardrop://incoming-transfer-request", req_payload);

            // Await user decision (timeout after 60s)
            match tokio::time::timeout(std::time::Duration::from_secs(60), rx).await {
                Ok(Ok(decision)) => decision,
                _ => false,
            }
        };

        if !should_accept {
            let _ = framed
                .send(Frame::HandshakeResponse {
                    transfer_id: transfer_id.clone(),
                    accepted: false,
                    reason: Some("Transfer rejected by receiver".into()),
                })
                .await;

            let mut tracker = ProgressTracker::new(
                transfer_id.clone(),
                "receive".into(),
                sender_id.clone(),
                sender_name.clone(),
                files.len(),
                total_size,
            );
            tracker.status = TransferStatus::Rejected;
            let _ = app.emit("neardrop://transfer-progress", tracker.snapshot());
            return Ok(());
        }

        // Send Acceptance Response
        framed
            .send(Frame::HandshakeResponse {
                transfer_id: transfer_id.clone(),
                accepted: true,
                reason: None,
            })
            .await?;

        // 3. Receive Files Stream
        let mut tracker = ProgressTracker::new(
            transfer_id.clone(),
            "receive".into(),
            sender_id.clone(),
            sender_name.clone(),
            files.len(),
            total_size,
        );
        tracker.status = TransferStatus::Transferring;
        let _ = app.emit("neardrop://transfer-progress", tracker.snapshot());

        let mut current_file_handle: Option<fs::File> = None;
        let mut current_hasher: Option<crate::transfer::hasher::IncrementalHasher> = None;
        let mut current_target_path: Option<PathBuf> = None;
        let mut current_expected_hash = String::new();
        let mut completed_file_names = Vec::new();

        let _ = fs::create_dir_all(&download_dir);

        while let Some(frame_res) = framed.next().await {
            match frame_res? {
                Frame::FileHeader {
                    file_index,
                    filename,
                    relative_path,
                    size: _,
                    checksum,
                    ..
                } => {
                    let rel_clean = if relative_path.is_empty() {
                        filename.clone()
                    } else {
                        relative_path.clone()
                    };

                    let target_path = PathSanitizer::sanitize_and_resolve(&download_dir, &rel_clean)
                        .map_err(|e| std::io::Error::new(std::io::ErrorKind::PermissionDenied, e.to_string()))?;

                    if let Some(parent) = target_path.parent() {
                        let _ = fs::create_dir_all(parent);
                    }

                    let file = OpenOptions::new()
                        .create(true)
                        .write(true)
                        .truncate(true)
                        .open(&target_path)?;

                    current_file_handle = Some(file);
                    current_hasher = Some(StreamHasher::new_incremental());
                    current_target_path = Some(target_path);
                    current_expected_hash = checksum;

                    tracker.set_file(file_index, filename.clone());
                    completed_file_names.push(filename);
                    let _ = app.emit("neardrop://transfer-progress", tracker.snapshot());
                }

                Frame::Chunk { data, .. } => {
                    if let Some(ref mut handle) = current_file_handle {
                        handle.write_all(&data)?;
                    }
                    if let Some(ref mut hasher) = current_hasher {
                        hasher.update(&data);
                    }
                    tracker.update_bytes(data.len() as u64);
                    let _ = app.emit("neardrop://transfer-progress", tracker.snapshot());
                }

                Frame::FileFinished { received_checksum, .. } => {
                    if let Some(mut handle) = current_file_handle.take() {
                        handle.flush()?;
                    }

                    if let Some(hasher) = current_hasher.take() {
                        let calculated_hash = hasher.finalize();
                        if !calculated_hash.eq_ignore_ascii_case(&received_checksum)
                            && !current_expected_hash.is_empty()
                            && !calculated_hash.eq_ignore_ascii_case(&current_expected_hash)
                        {
                            // Integrity mismatch
                            if let Some(p) = current_target_path.take() {
                                let _ = fs::remove_file(p);
                            }
                            tracker.status = TransferStatus::Failed;
                            tracker.error_message = Some("Cryptographic checksum mismatch. File removed.".into());
                            let _ = app.emit("neardrop://transfer-progress", tracker.snapshot());
                            let _ = framed
                                .send(Frame::TransferComplete {
                                    transfer_id: transfer_id.clone(),
                                    success: false,
                                    message: "Checksum mismatch".into(),
                                })
                                .await;
                            return Ok(());
                        }
                    }
                }

                Frame::TransferComplete { .. } => {
                    tracker.status = TransferStatus::Completed;
                    let _ = app.emit("neardrop://transfer-progress", tracker.snapshot());

                    // Save to history
                    let history_item = TransferHistoryItem {
                        id: transfer_id.clone(),
                        direction: "receive".into(),
                        mode: "lan".into(),
                        peer_device_id: sender_id.clone(),
                        peer_device_name: sender_name.clone(),
                        total_bytes: total_size,
                        files_count: files.len(),
                        file_names: completed_file_names.clone(),
                        status: "completed".into(),
                        started_at: chrono::Utc::now().timestamp(),
                        completed_at: Some(chrono::Utc::now().timestamp()),
                    };
                    let _ = storage.add_history_item(history_item);
                    break;
                }

                Frame::TransferCancelled { reason, .. } => {
                    tracker.status = TransferStatus::Cancelled;
                    tracker.error_message = Some(reason);
                    let _ = app.emit("neardrop://transfer-progress", tracker.snapshot());
                    break;
                }

                _ => {}
            }
        }

        Ok(())
    }
}

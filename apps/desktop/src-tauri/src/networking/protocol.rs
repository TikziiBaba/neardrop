use bytes::{Buf, BufMut, BytesMut};
use serde::{Deserialize, Serialize};
use std::io;
use tokio_util::codec::{Decoder, Encoder};

pub const DEFAULT_CHUNK_SIZE: usize = 64 * 1024; // 64 KB per chunk for high throughput & low latency

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileMetadata {
    pub file_index: usize,
    pub filename: String,
    pub relative_path: String,
    pub size: u64,
    pub checksum: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum Frame {
    HandshakeRequest {
        transfer_id: String,
        sender_device_id: String,
        sender_device_name: String,
        sender_public_key: String,
        files: Vec<FileMetadata>,
        total_size: u64,
    },
    HandshakeResponse {
        transfer_id: String,
        accepted: bool,
        reason: Option<String>,
    },
    FileHeader {
        transfer_id: String,
        file_index: usize,
        filename: String,
        relative_path: String,
        size: u64,
        checksum: String,
    },
    Chunk {
        transfer_id: String,
        file_index: usize,
        chunk_offset: u64,
        #[serde(with = "serde_bytes_base64")]
        data: Vec<u8>,
    },
    FileFinished {
        transfer_id: String,
        file_index: usize,
        received_checksum: String,
    },
    TransferComplete {
        transfer_id: String,
        success: bool,
        message: String,
    },
    TransferCancelled {
        transfer_id: String,
        reason: String,
    },
    Ping,
    Pong,
}

mod serde_bytes_base64 {
    use base64::{engine::general_purpose::STANDARD, Engine};
    use serde::{Deserialize, Deserializer, Serializer};

    pub fn serialize<S>(bytes: &[u8], serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&STANDARD.encode(bytes))
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<Vec<u8>, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        STANDARD.decode(s).map_err(serde::de::Error::custom)
    }
}

/// Length-prefixed frame codec for Tokio framing (4-byte Big-Endian length header + JSON frame)
pub struct FrameCodec;

impl FrameCodec {
    pub fn new() -> Self {
        FrameCodec
    }
}

impl Decoder for FrameCodec {
    type Item = Frame;
    type Error = io::Error;

    fn decode(&mut self, src: &mut BytesMut) -> Result<Option<Self::Item>, Self::Error> {
        if src.len() < 4 {
            return Ok(None);
        }

        let length = u32::from_be_bytes([src[0], src[1], src[2], src[3]]) as usize;
        if length > 32 * 1024 * 1024 {
            return Err(io::Error::new(io::ErrorKind::InvalidData, "Frame payload exceeds maximum 32MB"));
        }

        if src.len() < 4 + length {
            src.reserve(4 + length - src.len());
            return Ok(None);
        }

        src.advance(4);
        let data = src.split_to(length);
        let frame: Frame = serde_json::from_slice(&data)
            .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, format!("Failed to parse frame JSON: {}", e)))?;

        Ok(Some(frame))
    }
}

impl Encoder<Frame> for FrameCodec {
    type Error = io::Error;

    fn encode(&mut self, item: Frame, dst: &mut BytesMut) -> Result<(), Self::Error> {
        let json_bytes = serde_json::to_vec(&item)
            .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, format!("Failed to serialize frame: {}", e)))?;

        let len = json_bytes.len() as u32;
        dst.reserve(4 + json_bytes.len());
        dst.put_u32(len);
        dst.put_slice(&json_bytes);
        Ok(())
    }
}

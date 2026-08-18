use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use std::time::Instant;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TransferStatus {
    Pending,
    WaitingForAcceptance,
    Accepted,
    Transferring,
    Paused,
    Completed,
    Cancelled,
    Failed,
    Rejected,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransferProgress {
    pub transfer_id: String,
    pub direction: String, // "send" | "receive"
    pub peer_device_id: String,
    pub peer_device_name: String,
    pub current_file_index: usize,
    pub current_file_name: String,
    pub total_files: usize,
    pub total_bytes: u64,
    pub transferred_bytes: u64,
    pub speed_bytes_per_sec: u64,
    pub eta_seconds: u64,
    pub status: TransferStatus,
    pub error_message: Option<String>,
}

pub struct ProgressTracker {
    pub transfer_id: String,
    pub direction: String,
    pub peer_device_id: String,
    pub peer_device_name: String,
    pub current_file_index: usize,
    pub current_file_name: String,
    pub total_files: usize,
    pub total_bytes: u64,
    pub transferred_bytes: u64,
    pub status: TransferStatus,
    pub error_message: Option<String>,
    history: VecDeque<(Instant, u64)>,
}

impl ProgressTracker {
    pub fn new(
        transfer_id: String,
        direction: String,
        peer_device_id: String,
        peer_device_name: String,
        total_files: usize,
        total_bytes: u64,
    ) -> Self {
        let mut history = VecDeque::with_capacity(12);
        history.push_back((Instant::now(), 0));

        ProgressTracker {
            transfer_id,
            direction,
            peer_device_id,
            peer_device_name,
            current_file_index: 0,
            current_file_name: String::new(),
            total_files,
            total_bytes,
            transferred_bytes: 0,
            status: TransferStatus::Pending,
            error_message: None,
            history,
        }
    }

    pub fn update_bytes(&mut self, added_bytes: u64) {
        self.transferred_bytes = self.transferred_bytes.saturating_add(added_bytes);
        let now = Instant::now();
        self.history.push_back((now, self.transferred_bytes));

        // Keep last 10 samples (rolling window ~ 2-5 seconds)
        while self.history.len() > 10 {
            self.history.pop_front();
        }
    }

    pub fn set_file(&mut self, file_index: usize, file_name: String) {
        self.current_file_index = file_index;
        self.current_file_name = file_name;
    }

    pub fn calculate_speed(&self) -> u64 {
        if self.history.len() < 2 {
            return 0;
        }

        let (first_time, first_bytes) = self.history.front().unwrap();
        let (last_time, last_bytes) = self.history.back().unwrap();

        let elapsed = last_time.duration_since(*first_time).as_secs_f64();
        if elapsed < 0.05 {
            return 0;
        }

        let delta_bytes = last_bytes.saturating_sub(*first_bytes);
        (delta_bytes as f64 / elapsed) as u64
    }

    pub fn calculate_eta(&self, speed: u64) -> u64 {
        if speed == 0 || self.transferred_bytes >= self.total_bytes {
            return 0;
        }
        let remaining = self.total_bytes.saturating_sub(self.transferred_bytes);
        remaining / speed
    }

    pub fn snapshot(&self) -> TransferProgress {
        let speed = self.calculate_speed();
        let eta = self.calculate_eta(speed);

        TransferProgress {
            transfer_id: self.transfer_id.clone(),
            direction: self.direction.clone(),
            peer_device_id: self.peer_device_id.clone(),
            peer_device_name: self.peer_device_name.clone(),
            current_file_index: self.current_file_index,
            current_file_name: self.current_file_name.clone(),
            total_files: self.total_files,
            total_bytes: self.total_bytes,
            transferred_bytes: self.transferred_bytes,
            speed_bytes_per_sec: speed,
            eta_seconds: eta,
            status: self.status.clone(),
            error_message: self.error_message.clone(),
        }
    }
}

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserSettings {
    pub download_path: String,
    pub auto_accept_trusted: bool,
    pub max_concurrent_transfers: usize,
    pub transfer_port: u16,
    pub theme: String,       // "dark" | "light" | "system"
    pub language: String,    // "en" | "tr" | "de"
    pub preferred_interface: Option<String>,
    pub start_with_system: bool,
    pub minimize_to_tray: bool,
}

impl Default for UserSettings {
    fn default() -> Self {
        let default_download = dirs::download_dir()
            .map(|p| p.join("NearDrop"))
            .unwrap_or_else(|| std::path::PathBuf::from("NearDrop_Downloads"))
            .to_string_lossy()
            .to_string();

        UserSettings {
            download_path: default_download,
            auto_accept_trusted: false,
            max_concurrent_transfers: 3,
            transfer_port: 45454,
            theme: "system".to_string(),
            language: "en".to_string(),
            preferred_interface: None,
            start_with_system: false,
            minimize_to_tray: true,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransferHistoryItem {
    pub id: String,
    pub direction: String, // "send" | "receive"
    pub mode: String,      // "lan" | "cloud"
    pub peer_device_id: String,
    pub peer_device_name: String,
    pub total_bytes: u64,
    pub files_count: usize,
    pub file_names: Vec<String>,
    pub status: String,
    pub started_at: i64,
    pub completed_at: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrustedDeviceItem {
    pub device_id: String,
    pub device_name: String,
    pub public_key: String,
    pub trusted_at: i64,
}

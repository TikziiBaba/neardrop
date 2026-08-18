use super::models::{TransferHistoryItem, TrustedDeviceItem, UserSettings};
use std::fs;
use std::path::{Path, PathBuf};

pub struct LocalStorage {
    base_dir: PathBuf,
}

impl LocalStorage {
    pub fn new() -> Self {
        let base_dir = dirs::data_local_dir()
            .map(|p| p.join("NearDrop"))
            .unwrap_or_else(|| PathBuf::from("neardrop_data"));

        let _ = fs::create_dir_all(&base_dir);
        LocalStorage { base_dir }
    }

    pub fn settings_path(&self) -> PathBuf {
        self.base_dir.join("settings.json")
    }

    pub fn identity_path(&self) -> PathBuf {
        self.base_dir.join("identity.json")
    }

    pub fn history_path(&self) -> PathBuf {
        self.base_dir.join("history.json")
    }

    pub fn trusted_path(&self) -> PathBuf {
        self.base_dir.join("trusted.json")
    }

    // --- Settings ---
    pub fn load_settings(&self) -> UserSettings {
        let path = self.settings_path();
        if path.exists() {
            if let Ok(content) = fs::read_to_string(&path) {
                if let Ok(settings) = serde_json::from_str::<UserSettings>(&content) {
                    return settings;
                }
            }
        }
        let default_settings = UserSettings::default();
        let _ = self.save_settings(&default_settings);
        default_settings
    }

    pub fn save_settings(&self, settings: &UserSettings) -> std::io::Result<()> {
        let json = serde_json::to_string_pretty(settings)
            .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e.to_string()))?;
        fs::write(self.settings_path(), json)
    }

    // --- History ---
    pub fn load_history(&self) -> Vec<TransferHistoryItem> {
        let path = self.history_path();
        if path.exists() {
            if let Ok(content) = fs::read_to_string(&path) {
                if let Ok(history) = serde_json::from_str::<Vec<TransferHistoryItem>>(&content) {
                    return history;
                }
            }
        }
        Vec::new()
    }

    pub fn save_history(&self, history: &[TransferHistoryItem]) -> std::io::Result<()> {
        let json = serde_json::to_string_pretty(history)
            .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e.to_string()))?;
        fs::write(self.history_path(), json)
    }

    pub fn add_history_item(&self, item: TransferHistoryItem) -> std::io::Result<()> {
        let mut history = self.load_history();
        // Insert at beginning (newest first) and limit to 500 items
        history.insert(0, item);
        if history.len() > 500 {
            history.truncate(500);
        }
        self.save_history(&history)
    }

    pub fn clear_history(&self) -> std::io::Result<()> {
        self.save_history(&[])
    }

    // --- Trusted Devices ---
    pub fn load_trusted_devices(&self) -> Vec<TrustedDeviceItem> {
        let path = self.trusted_path();
        if path.exists() {
            if let Ok(content) = fs::read_to_string(&path) {
                if let Ok(devices) = serde_json::from_str::<Vec<TrustedDeviceItem>>(&content) {
                    return devices;
                }
            }
        }
        Vec::new()
    }

    pub fn save_trusted_devices(&self, devices: &[TrustedDeviceItem]) -> std::io::Result<()> {
        let json = serde_json::to_string_pretty(devices)
            .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e.to_string()))?;
        fs::write(self.trusted_path(), json)
    }

    pub fn add_trusted_device(&self, device: TrustedDeviceItem) -> std::io::Result<()> {
        let mut devices = self.load_trusted_devices();
        devices.retain(|d| d.device_id != device.device_id);
        devices.push(device);
        self.save_trusted_devices(&devices)
    }

    pub fn remove_trusted_device(&self, device_id: &str) -> std::io::Result<()> {
        let mut devices = self.load_trusted_devices();
        devices.retain(|d| d.device_id != device_id);
        self.save_trusted_devices(&devices)
    }
}

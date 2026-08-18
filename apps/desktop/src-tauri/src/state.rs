use crate::discovery::listener::DeviceMap;
use crate::networking::server::PendingApprovalMap;
use crate::security::DeviceIdentity;
use crate::storage::models::{TrustedDeviceItem, UserSettings};
use crate::storage::LocalStorage;
use parking_lot::RwLock;
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::atomic::AtomicBool;
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub identity: Arc<RwLock<DeviceIdentity>>,
    pub devices: DeviceMap,
    pub settings: Arc<RwLock<UserSettings>>,
    pub trusted_devices: Arc<RwLock<Vec<TrustedDeviceItem>>>,
    pub trusted_public_keys: Arc<RwLock<Vec<String>>>,
    pub download_path: Arc<RwLock<PathBuf>>,
    pub auto_accept: Arc<RwLock<bool>>,
    pub pending_approvals: PendingApprovalMap,
    pub cancel_tokens: Arc<RwLock<HashMap<String, Arc<AtomicBool>>>>,
    pub storage: Arc<LocalStorage>,
    pub shutdown: Arc<AtomicBool>,
}

impl AppState {
    pub fn new() -> Self {
        let storage = Arc::new(LocalStorage::new());
        let settings_val = storage.load_settings();
        let identity_val = DeviceIdentity::load_or_create(storage.identity_path());
        let trusted_list = storage.load_trusted_devices();

        let trusted_keys: Vec<String> = trusted_list.iter().map(|d| d.public_key.clone()).collect();
        let download_path_val = PathBuf::from(&settings_val.download_path);
        let auto_accept_val = settings_val.auto_accept_trusted;

        AppState {
            identity: Arc::new(RwLock::new(identity_val)),
            devices: Arc::new(RwLock::new(HashMap::new())),
            settings: Arc::new(RwLock::new(settings_val)),
            trusted_devices: Arc::new(RwLock::new(trusted_list)),
            trusted_public_keys: Arc::new(RwLock::new(trusted_keys)),
            download_path: Arc::new(RwLock::new(download_path_val)),
            auto_accept: Arc::new(RwLock::new(auto_accept_val)),
            pending_approvals: Arc::new(RwLock::new(HashMap::new())),
            cancel_tokens: Arc::new(RwLock::new(HashMap::new())),
            storage,
            shutdown: Arc::new(AtomicBool::new(false)),
        }
    }
}

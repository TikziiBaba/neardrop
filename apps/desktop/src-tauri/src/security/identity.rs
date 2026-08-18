use ed25519_dalek::{SigningKey, VerifyingKey};
use rand::rngs::OsRng;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceIdentity {
    pub device_id: String,
    pub device_name: String,
    pub device_type: String, // desktop, laptop, mobile
    pub platform: String,    // windows, macos, linux
    pub public_key_base64: String,
    #[serde(skip_serializing)]
    pub private_key_base64: String,
    pub created_at: i64,
}

impl DeviceIdentity {
    /// Generates a brand new device identity with Ed25519 keypair
    pub fn generate(custom_name: Option<String>) -> Self {
        let mut csprng = OsRng;
        let signing_key = SigningKey::generate(&mut csprng);
        let verifying_key: VerifyingKey = signing_key.verifying_key();

        let device_id = Uuid::new_v4().to_string();
        let default_name = custom_name.unwrap_or_else(|| {
            let user = std::env::var("USERNAME")
                .or_else(|_| std::env::var("USER"))
                .unwrap_or_else(|_| "User".to_string());
            format!("{}'s PC", user)
        });

        let platform = if cfg!(target_os = "windows") {
            "windows".to_string()
        } else if cfg!(target_os = "macos") {
            "macos".to_string()
        } else if cfg!(target_os = "linux") {
            "linux".to_string()
        } else {
            "unknown".to_string()
        };

        DeviceIdentity {
            device_id,
            device_name: default_name,
            device_type: "desktop".to_string(),
            platform,
            public_key_base64: base64::Engine::encode(&base64::engine::general_purpose::STANDARD, verifying_key.as_bytes()),
            private_key_base64: base64::Engine::encode(&base64::engine::general_purpose::STANDARD, signing_key.to_bytes()),
            created_at: chrono::Utc::now().timestamp(),
        }
    }

    /// Loads identity from a JSON file, or generates and saves one if not found
    pub fn load_or_create<P: AsRef<Path>>(path: P) -> Self {
        let path = path.as_ref();
        if path.exists() {
            if let Ok(content) = fs::read_to_string(path) {
                if let Ok(identity) = serde_json::from_str::<DeviceIdentity>(&content) {
                    return identity;
                }
            }
        }

        let identity = Self::generate(None);
        if let Some(parent) = path.parent() {
            let _ = fs::create_dir_all(parent);
        }
        if let Ok(json) = serde_json::to_string_pretty(&identity) {
            let _ = fs::write(path, json);
        }
        identity
    }

    /// Updates the device name and persists
    pub fn update_name<P: AsRef<Path>>(&mut self, new_name: String, path: P) -> Result<(), std::io::Error> {
        self.device_name = new_name;
        let json = serde_json::to_string_pretty(&self)
            .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e.to_string()))?;
        fs::write(path, json)?;
        Ok(())
    }
}

use super::beacon::{DiscoveryPacket, DISCOVERY_PORT, PROTOCOL_NAME};
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::Duration;
use tokio::net::UdpSocket;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscoveredDevice {
    pub device_id: String,
    pub device_name: String,
    pub device_type: String,
    pub platform: String,
    pub address: String,
    pub port: u16,
    pub public_key: String,
    pub last_seen: i64,
    pub is_trusted: bool,
}

pub type DeviceMap = Arc<RwLock<HashMap<String, DiscoveredDevice>>>;

pub struct DiscoveryListener;

impl DiscoveryListener {
    /// Starts background UDP listener to collect beacons from other devices
    pub fn start(
        local_device_id: String,
        devices: DeviceMap,
        trusted_keys: Arc<RwLock<Vec<String>>>,
        shutdown: Arc<AtomicBool>,
        on_device_change: Option<Arc<dyn Fn() + Send + Sync>>,
    ) {
        tokio::spawn(async move {
            let socket = match UdpSocket::bind(format!("0.0.0.0:{}", DISCOVERY_PORT)).await {
                Ok(s) => {
                    let _ = s.set_broadcast(true);
                    s
                }
                Err(e) => {
                    log::warn!("Could not bind port {}: {}. Retrying in shared mode...", DISCOVERY_PORT, e);
                    // On some Windows/Linux setups with multiple processes, bind might need retry or port reuse
                    return;
                }
            };

            log::info!("UDP Discovery Listener active on port {}", DISCOVERY_PORT);
            let mut buf = [0u8; 4096];

            let prune_shutdown = shutdown.clone();
            let prune_devices = devices.clone();
            let prune_notify = on_device_change.clone();

            // Background task to prune stale devices (older than 6 seconds)
            tokio::spawn(async move {
                while !prune_shutdown.load(Ordering::Relaxed) {
                    tokio::time::sleep(Duration::from_secs(3)).await;
                    let now = chrono::Utc::now().timestamp();
                    let mut map = prune_devices.write();
                    let before_len = map.len();
                    map.retain(|_, dev| now - dev.last_seen < 7);
                    if map.len() != before_len {
                        if let Some(ref notify) = prune_notify {
                            notify();
                        }
                    }
                }
            });

            while !shutdown.load(Ordering::Relaxed) {
                match socket.recv_from(&mut buf).await {
                    Ok((len, src)) => {
                        if let Ok(packet) = serde_json::from_slice::<DiscoveryPacket>(&buf[..len]) {
                            if packet.protocol == PROTOCOL_NAME && packet.device_id != local_device_id {
                                let is_trusted = {
                                    let keys = trusted_keys.read();
                                    keys.contains(&packet.public_key)
                                };

                                let src_ip = match src {
                                    SocketAddr::V4(v4) => v4.ip().to_string(),
                                    SocketAddr::V6(v6) => v6.ip().to_string(),
                                };

                                let device = DiscoveredDevice {
                                    device_id: packet.device_id.clone(),
                                    device_name: packet.device_name,
                                    device_type: packet.device_type,
                                    platform: packet.platform,
                                    address: src_ip,
                                    port: packet.port,
                                    public_key: packet.public_key,
                                    last_seen: chrono::Utc::now().timestamp(),
                                    is_trusted,
                                };

                                {
                                    let mut map = devices.write();
                                    let is_new_or_updated = match map.get(&packet.device_id) {
                                        Some(existing) => existing.device_name != device.device_name || existing.address != device.address,
                                        None => true,
                                    };
                                    map.insert(packet.device_id.clone(), device);

                                    if is_new_or_updated {
                                        if let Some(ref notify) = on_device_change {
                                            notify();
                                        }
                                    }
                                }
                            }
                        }
                    }
                    Err(e) => {
                        log::debug!("UDP receive error: {}", e);
                    }
                }
            }

            log::info!("UDP Discovery Listener stopped");
        });
    }
}

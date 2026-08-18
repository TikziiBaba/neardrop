use crate::discovery::network_interfaces::InterfaceScanner;
use serde::{Deserialize, Serialize};
use std::net::SocketAddrV4;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::Duration;
use tokio::net::UdpSocket;

pub const DISCOVERY_PORT: u16 = 45455;
pub const PROTOCOL_NAME: &str = "neardrop";
pub const PROTOCOL_VERSION: u32 = 1;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscoveryPacket {
    pub protocol: String,
    pub version: u32,
    pub device_id: String,
    pub device_name: String,
    pub device_type: String,
    pub platform: String,
    pub port: u16,
    pub public_key: String,
    pub timestamp: i64,
}

pub struct BeaconBroadcaster;

impl BeaconBroadcaster {
    /// Starts background UDP beacon broadcaster
    pub fn start(
        device_id: String,
        device_name: Arc<parking_lot::RwLock<String>>,
        device_type: String,
        platform: String,
        transfer_port: u16,
        public_key: String,
        shutdown: Arc<AtomicBool>,
    ) {
        tokio::spawn(async move {
            let socket = match UdpSocket::bind("0.0.0.0:0").await {
                Ok(s) => {
                    let _ = s.set_broadcast(true);
                    s
                }
                Err(e) => {
                    log::error!("Failed to bind UDP broadcaster socket: {}", e);
                    return;
                }
            };

            log::info!("UDP Beacon Broadcaster started on port {}", DISCOVERY_PORT);

            while !shutdown.load(Ordering::Relaxed) {
                let current_name = device_name.read().clone();
                let packet = DiscoveryPacket {
                    protocol: PROTOCOL_NAME.to_string(),
                    version: PROTOCOL_VERSION,
                    device_id: device_id.clone(),
                    device_name: current_name,
                    device_type: device_type.clone(),
                    platform: platform.clone(),
                    port: transfer_port,
                    public_key: public_key.clone(),
                    timestamp: chrono::Utc::now().timestamp(),
                };

                if let Ok(payload) = serde_json::to_vec(&packet) {
                    let broadcast_addrs = InterfaceScanner::get_broadcast_addresses();
                    for bcast_ip in broadcast_addrs {
                        let target = SocketAddrV4::new(bcast_ip, DISCOVERY_PORT);
                        let _ = socket.send_to(&payload, target).await;
                    }
                }

                // Broadcast interval: 2 seconds
                tokio::time::sleep(Duration::from_secs(2)).await;
            }

            log::info!("UDP Beacon Broadcaster stopped");
        });
    }
}

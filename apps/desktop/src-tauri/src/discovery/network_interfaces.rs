use network_interface::{NetworkInterface, NetworkInterfaceConfig};
use serde::{Deserialize, Serialize};
use std::net::{IpAddr, Ipv4Addr};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkInterfaceInfo {
    pub name: String,
    pub ip: String,
    pub broadcast_ip: Option<String>,
    pub is_loopback: bool,
}

pub struct InterfaceScanner;

impl InterfaceScanner {
    /// Discovers active IPv4 network interfaces suitable for NearDrop broadcast
    pub fn get_active_interfaces() -> Vec<NetworkInterfaceInfo> {
        let mut results = Vec::new();
        if let Ok(interfaces) = NetworkInterface::show() {
            for iface in interfaces {
                for addr in iface.addr {
                    if let IpAddr::V4(ipv4) = addr.ip() {
                        let is_loopback = ipv4.is_loopback();
                        // Ignore APIPA / link-local 169.254.x.x unless nothing else
                        let is_link_local = ipv4.is_link_local();
                        if !is_loopback && !is_link_local {
                            let broadcast_str = addr.broadcast().map(|b| b.to_string());
                            results.push(NetworkInterfaceInfo {
                                name: iface.name.clone(),
                                ip: ipv4.to_string(),
                                broadcast_ip: broadcast_str,
                                is_loopback,
                            });
                        }
                    }
                }
            }
        }
        results
    }

    /// Finds primary broadcast address (defaults to 255.255.255.255 if none detected)
    pub fn get_broadcast_addresses() -> Vec<Ipv4Addr> {
        let mut addresses = Vec::new();
        let ifaces = Self::get_active_interfaces();
        for iface in ifaces {
            if let Some(bcast) = iface.broadcast_ip {
                if let Ok(parsed) = bcast.parse::<Ipv4Addr>() {
                    if !addresses.contains(&parsed) {
                        addresses.push(parsed);
                    }
                }
            }
        }
        if addresses.is_empty() {
            addresses.push(Ipv4Addr::new(255, 255, 255, 255));
        }
        addresses
    }
}

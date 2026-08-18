use crate::discovery::{DiscoveredDevice, InterfaceScanner, NetworkInterfaceInfo};
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub fn get_discovered_devices(state: State<'_, AppState>) -> Vec<DiscoveredDevice> {
    let map = state.devices.read();
    map.values().cloned().collect()
}

#[tauri::command]
pub fn get_network_interfaces() -> Vec<NetworkInterfaceInfo> {
    InterfaceScanner::get_active_interfaces()
}

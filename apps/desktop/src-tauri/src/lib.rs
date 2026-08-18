pub mod commands;
pub mod discovery;
pub mod networking;
pub mod notifications;
pub mod security;
pub mod state;
pub mod storage;
pub mod transfer;
pub mod tray;

use discovery::{BeaconBroadcaster, DiscoveryListener};
use networking::TransferServer;
use state::AppState;
use std::sync::Arc;
use tauri::{Emitter, Manager};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let state = AppState::new();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_fs::init())
        .manage(state.clone())
        .setup({
            let state = state.clone();
            move |app| {
                let app_handle = app.handle().clone();

                // Setup Tray
                if let Err(e) = tray::setup_tray(&app_handle) {
                    log::warn!("Could not initialize system tray: {}", e);
                }

                let identity = state.identity.read().clone();
                let port = state.settings.read().transfer_port;

                // 1. Start UDP Discovery Broadcaster
                let device_name_ref = Arc::new(parking_lot::RwLock::new(identity.device_name.clone()));
                BeaconBroadcaster::start(
                    identity.device_id.clone(),
                    device_name_ref,
                    identity.device_type.clone(),
                    identity.platform.clone(),
                    port,
                    identity.public_key_base64.clone(),
                    state.shutdown.clone(),
                );

                // 2. Start UDP Discovery Listener
                let app_for_devices = app_handle.clone();
                let on_device_change = Arc::new(move || {
                    let _ = app_for_devices.emit("neardrop://devices-changed", ());
                });

                DiscoveryListener::start(
                    identity.device_id.clone(),
                    state.devices.clone(),
                    state.trusted_public_keys.clone(),
                    state.shutdown.clone(),
                    Some(on_device_change),
                );

                // 3. Start TCP Transfer Server (Receiver)
                TransferServer::start(
                    app_handle.clone(),
                    port,
                    state.download_path.clone(),
                    state.auto_accept.clone(),
                    state.trusted_public_keys.clone(),
                    state.pending_approvals.clone(),
                    state.storage.clone(),
                    state.shutdown.clone(),
                );

                Ok(())
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::discovery::get_discovered_devices,
            commands::discovery::get_network_interfaces,
            commands::device::get_device_identity,
            commands::device::set_device_name,
            commands::transfer::send_files_lan,
            commands::transfer::respond_transfer_request,
            commands::transfer::cancel_transfer,
            commands::settings::get_settings,
            commands::settings::update_settings,
            commands::history::get_transfer_history,
            commands::history::clear_transfer_history,
            commands::history::open_download_folder,
            commands::security::get_trusted_devices,
            commands::security::add_trusted_device,
            commands::security::remove_trusted_device,
            commands::security::generate_pairing_qr,
        ])
        .run(tauri::generate_context!())
        .expect("error while running NearDrop application");
}

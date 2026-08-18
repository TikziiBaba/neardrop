use crate::security::{PairingManager, PairingPayload};
use crate::storage::models::TrustedDeviceItem;
use crate::state::AppState;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct QrPairingResult {
    pub payload: PairingPayload,
    pub qr_svg: String,
}

#[tauri::command]
pub fn get_trusted_devices(state: State<'_, AppState>) -> Vec<TrustedDeviceItem> {
    state.trusted_devices.read().clone()
}

#[tauri::command]
pub fn add_trusted_device(device: TrustedDeviceItem, state: State<'_, AppState>) -> Result<(), String> {
    state.storage
        .add_trusted_device(device.clone())
        .map_err(|e| e.to_string())?;

    let updated = state.storage.load_trusted_devices();
    let keys: Vec<String> = updated.iter().map(|d| d.public_key.clone()).collect();

    *state.trusted_devices.write() = updated;
    *state.trusted_public_keys.write() = keys;

    Ok(())
}

#[tauri::command]
pub fn remove_trusted_device(device_id: String, state: State<'_, AppState>) -> Result<(), String> {
    state.storage
        .remove_trusted_device(&device_id)
        .map_err(|e| e.to_string())?;

    let updated = state.storage.load_trusted_devices();
    let keys: Vec<String> = updated.iter().map(|d| d.public_key.clone()).collect();

    *state.trusted_devices.write() = updated;
    *state.trusted_public_keys.write() = keys;

    Ok(())
}

#[tauri::command]
pub fn generate_pairing_qr(state: State<'_, AppState>) -> QrPairingResult {
    let identity = state.identity.read();
    let (payload, qr_svg) = PairingManager::generate_pairing_session(
        &identity.device_id,
        &identity.device_name,
        &identity.public_key_base64,
    );

    QrPairingResult { payload, qr_svg }
}

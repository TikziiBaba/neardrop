use crate::security::DeviceIdentity;
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub fn get_device_identity(state: State<'_, AppState>) -> DeviceIdentity {
    state.identity.read().clone()
}

#[tauri::command]
pub fn set_device_name(new_name: String, state: State<'_, AppState>) -> Result<(), String> {
    let mut identity = state.identity.write();
    let path = state.storage.identity_path();
    identity
        .update_name(new_name, path)
        .map_err(|e| e.to_string())
}

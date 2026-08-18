use crate::storage::models::UserSettings;
use crate::state::AppState;
use std::path::PathBuf;
use tauri::State;

#[tauri::command]
pub fn get_settings(state: State<'_, AppState>) -> UserSettings {
    state.settings.read().clone()
}

#[tauri::command]
pub fn update_settings(new_settings: UserSettings, state: State<'_, AppState>) -> Result<(), String> {
    state.storage
        .save_settings(&new_settings)
        .map_err(|e| e.to_string())?;

    *state.download_path.write() = PathBuf::from(&new_settings.download_path);
    *state.auto_accept.write() = new_settings.auto_accept_trusted;
    *state.settings.write() = new_settings;

    Ok(())
}

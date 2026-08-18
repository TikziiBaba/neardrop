use crate::storage::models::TransferHistoryItem;
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub fn get_transfer_history(state: State<'_, AppState>) -> Vec<TransferHistoryItem> {
    state.storage.load_history()
}

#[tauri::command]
pub fn clear_transfer_history(state: State<'_, AppState>) -> Result<(), String> {
    state.storage.clear_history().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn open_download_folder(state: State<'_, AppState>) -> Result<(), String> {
    let path = state.download_path.read().clone();
    if !path.exists() {
        let _ = std::fs::create_dir_all(&path);
    }

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}

use crate::networking::TransferClient;
use crate::state::AppState;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tauri::{AppHandle, State};
use uuid::Uuid;

#[tauri::command]
pub async fn send_files_lan(
    app: AppHandle,
    target_ip: String,
    target_port: u16,
    target_device_id: String,
    target_device_name: String,
    file_paths: Vec<String>,
    state: State<'_, AppState>,
) -> Result<String, String> {
    let transfer_id = Uuid::new_v4().to_string();
    let cancel_token = Arc::new(AtomicBool::new(false));

    {
        let mut tokens = state.cancel_tokens.write();
        tokens.insert(transfer_id.clone(), cancel_token.clone());
    }

    let identity = state.identity.read().clone();
    let storage = state.storage.clone();
    let paths: Vec<PathBuf> = file_paths.into_iter().map(PathBuf::from).collect();

    let t_id = transfer_id.clone();
    tokio::spawn(async move {
        if let Err(e) = TransferClient::send_files(
            app,
            t_id,
            target_ip,
            target_port,
            target_device_id,
            target_device_name,
            identity.device_id,
            identity.device_name,
            identity.public_key_base64,
            paths,
            storage,
            cancel_token,
        )
        .await
        {
            log::error!("Error during file sending: {}", e);
        }
    });

    Ok(transfer_id)
}

#[tauri::command]
pub fn respond_transfer_request(
    transfer_id: String,
    accept: bool,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let mut map = state.pending_approvals.write();
    if let Some(tx) = map.remove(&transfer_id) {
        let _ = tx.send(accept);
        Ok(())
    } else {
        Err("Transfer approval request not found or already responded".into())
    }
}

#[tauri::command]
pub fn cancel_transfer(transfer_id: String, state: State<'_, AppState>) -> Result<(), String> {
    let map = state.cancel_tokens.read();
    if let Some(token) = map.get(&transfer_id) {
        token.store(true, Ordering::Relaxed);
        Ok(())
    } else {
        Err("Active transfer token not found".into())
    }
}

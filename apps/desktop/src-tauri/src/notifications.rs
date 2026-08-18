use tauri::AppHandle;
use tauri_plugin_notification::NotificationExt;

pub struct NotificationService;

impl NotificationService {
    pub fn show_notification(app: &AppHandle, title: &str, body: &str) {
        let _ = app
            .notification()
            .builder()
            .title(title)
            .body(body)
            .show();
    }
}

// fix: 设置相关命令
use crate::commands::book::get_data_dir;
use crate::AppState;
use serde::{Deserialize, Serialize};
use std::fs;
use tauri::State;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    pub theme: String,
    pub device_role: String,
    pub sync_enabled: bool,
    pub ai_provider: String,
    pub ollama_url: String,
    pub ollama_model: String,
    pub online_api_key: String,
    pub online_api_url: String,
    pub auto_save_interval: i32,
    pub max_backups: i32,
    pub font_size: i32,
    pub first_launch: bool,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            theme: "light".to_string(),
            device_role: "standalone".to_string(),
            sync_enabled: false,
            ai_provider: "ollama".to_string(),
            ollama_url: "http://localhost:11434".to_string(),
            ollama_model: "qwen2.5:7b".to_string(),
            online_api_key: "".to_string(),
            online_api_url: "".to_string(),
            auto_save_interval: 500,
            max_backups: 10,
            font_size: 16,
            first_launch: true,
        }
    }
}

#[tauri::command]
pub async fn get_settings(state: State<'_, AppState>) -> Result<Settings, String> {
    let row: Option<(String,)> = sqlx::query_as(
        "SELECT value FROM settings WHERE key = 'global'"
    )
    .fetch_optional(&*state.db.lock().unwrap())
    .await
    .map_err(|e| e.to_string())?;

    match row {
        Some((value,)) => serde_json::from_str(&value).map_err(|e| e.to_string()),
        None => Ok(Settings::default()),
    }
}

#[tauri::command]
pub async fn update_settings(
    state: State<'_, AppState>,
    settings: Settings,
) -> Result<(), String> {
    let value = serde_json::to_string(&settings).map_err(|e| e.to_string())?;

    sqlx::query("INSERT OR REPLACE INTO settings (key, value) VALUES ('global', ?)")
        .bind(&value)
        .execute(&*state.db.lock().unwrap())
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn export_data(
    book_id: Option<String>,
) -> Result<String, String> {
    use std::io::Write;
    use zip::write::FileOptions;
    use zip::ZipWriter;

    let data_path = get_data_dir();
    let export_path = data_path.join("export").join("data_export.json");
    fs::create_dir_all(export_path.parent().unwrap()).map_err(|e| e.to_string())?;

    // 这里简化处理，实际应该导出完整数据
    let export_data = serde_json::json!({
        "version": "2.0.0",
        "exported_at": chrono::Utc::now().to_rfc3339(),
        "book_id": book_id
    });

    let file = fs::File::create(&export_path).map_err(|e| e.to_string())?;
    let mut zip = ZipWriter::new(file);
    let options = FileOptions::default().compression_method(zip::CompressionMethod::Deflated);

    zip.start_file("data.json", options).map_err(|e| e.to_string())?;
    zip.write_all(serde_json::to_string_pretty(&export_data).unwrap().as_bytes())
        .map_err(|e| e.to_string())?;

    zip.finish().map_err(|e| e.to_string())?;

    Ok(export_path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn import_data(
    import_path: String,
) -> Result<(), String> {
    // 简化处理，实际应该解析 zip 并导入数据
    let content = fs::read_to_string(&import_path).map_err(|e| e.to_string())?;
    let _data: serde_json::Value = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    Ok(())
}

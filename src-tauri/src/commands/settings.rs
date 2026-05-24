// 设置管理命令
use serde::{Deserialize, Serialize};
use tauri::command;
use crate::db::get_db_path;
use rusqlite::{params, Connection};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppSettings {
    // 设备与同步
    pub device_role: String,
    pub sync_mode: String,
    pub auto_clear_pairing: bool,
    pub auto_clear_data: bool,
    
    // AI设置
    pub ai_provider: String,
    pub ollama_url: String,
    pub ollama_model: String,
    pub api_key: String,
    pub api_endpoint: String,
    
    // 通用设置
    pub dark_mode: bool,
    pub font_size: i32,
    pub language: String,
    pub usb_mode: bool,
    pub usb_path: String,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            device_role: "hub".to_string(),
            sync_mode: "manual".to_string(),
            auto_clear_pairing: false,
            auto_clear_data: false,
            ai_provider: "ollama".to_string(),
            ollama_url: "http://localhost:11434".to_string(),
            ollama_model: "qwen2.5:7b".to_string(),
            api_key: String::new(),
            api_endpoint: String::new(),
            dark_mode: false,
            font_size: 16,
            language: "zh-CN".to_string(),
            usb_mode: false,
            usb_path: String::new(),
        }
    }
}

impl AppSettings {
    fn to_key_values(&self) -> Vec<(&'static str, String)> {
        vec![
            ("device_role", self.device_role.clone()),
            ("sync_mode", self.sync_mode.clone()),
            ("auto_clear_pairing", self.auto_clear_pairing.to_string()),
            ("auto_clear_data", self.auto_clear_data.to_string()),
            ("ai_provider", self.ai_provider.clone()),
            ("ollama_url", self.ollama_url.clone()),
            ("ollama_model", self.ollama_model.clone()),
            ("api_key", self.api_key.clone()),
            ("api_endpoint", self.api_endpoint.clone()),
            ("dark_mode", self.dark_mode.to_string()),
            ("font_size", self.font_size.to_string()),
            ("language", self.language.clone()),
            ("usb_mode", self.usb_mode.to_string()),
            ("usb_path", self.usb_path.clone()),
        ]
    }
    
    fn from_key_values(values: &std::collections::HashMap<String, String>) -> Self {
        let mut settings = AppSettings::default();
        
        if let Some(v) = values.get("device_role") {
            settings.device_role = v.clone();
        }
        if let Some(v) = values.get("sync_mode") {
            settings.sync_mode = v.clone();
        }
        if let Some(v) = values.get("auto_clear_pairing") {
            settings.auto_clear_pairing = v.parse().unwrap_or(false);
        }
        if let Some(v) = values.get("auto_clear_data") {
            settings.auto_clear_data = v.parse().unwrap_or(false);
        }
        if let Some(v) = values.get("ai_provider") {
            settings.ai_provider = v.clone();
        }
        if let Some(v) = values.get("ollama_url") {
            settings.ollama_url = v.clone();
        }
        if let Some(v) = values.get("ollama_model") {
            settings.ollama_model = v.clone();
        }
        if let Some(v) = values.get("api_key") {
            settings.api_key = v.clone();
        }
        if let Some(v) = values.get("api_endpoint") {
            settings.api_endpoint = v.clone();
        }
        if let Some(v) = values.get("dark_mode") {
            settings.dark_mode = v.parse().unwrap_or(false);
        }
        if let Some(v) = values.get("font_size") {
            settings.font_size = v.parse().unwrap_or(16);
        }
        if let Some(v) = values.get("language") {
            settings.language = v.clone();
        }
        if let Some(v) = values.get("usb_mode") {
            settings.usb_mode = v.parse().unwrap_or(false);
        }
        if let Some(v) = values.get("usb_path") {
            settings.usb_path = v.clone();
        }
        
        settings
    }
}

fn load_settings_from_db() -> std::collections::HashMap<String, String> {
    let conn = Connection::open(get_db_path()).ok();
    if conn.is_none() {
        return std::collections::HashMap::new();
    }
    let conn = conn.unwrap();
    
    let mut map = std::collections::HashMap::new();
    let mut stmt = conn.prepare("SELECT key, value FROM settings").ok();
    if stmt.is_none() {
        return map;
    }
    let stmt = stmt.unwrap();
    
    let rows = stmt.query_map([], |row| {
        Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
    });
    
    if let Ok(rows) = rows {
        for row in rows.flatten() {
            map.insert(row.0, row.1);
        }
    }
    
    map
}

fn save_setting_to_db(key: &str, value: &str) -> Result<(), String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT OR REPLACE INTO settings (key, value) VALUES (?1, ?2)",
        params![key, value],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
pub fn get_settings() -> Result<AppSettings, String> {
    let values = load_settings_from_db();
    Ok(AppSettings::from_key_values(&values))
}

#[command]
pub fn update_settings(settings: AppSettings) -> Result<AppSettings, String> {
    for (key, value) in settings.to_key_values() {
        save_setting_to_db(key, &value)?;
    }
    Ok(settings)
}

#[command]
pub fn get_setting(key: String) -> Result<String, String> {
    let values = load_settings_from_db();
    values
        .get(&key)
        .cloned()
        .ok_or_else(|| format!("设置项 '{}' 不存在", key))
}

#[command]
pub fn set_setting(key: String, value: String) -> Result<(), String> {
    save_setting_to_db(&key, &value)
}

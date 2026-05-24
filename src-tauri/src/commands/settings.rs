// 设置管理命令
use serde::{Deserialize, Serialize};
use tauri::command;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppSettings {
    // 设备与同步
    pub device_role: String, // "hub" | "leaf"
    pub sync_mode: String,    // "manual" | "auto_30s"
    pub auto_clear_pairing: bool,
    pub auto_clear_data: bool,
    
    // AI设置
    pub ai_provider: String,  // "ollama" | "openai" | "deepseek" | "custom"
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

#[command]
pub fn get_settings() -> Result<AppSettings, String> {
    todo!("实现获取设置")
}

#[command]
pub fn update_settings(settings: AppSettings) -> Result<AppSettings, String> {
    todo!("实现更新设置")
}

#[command]
pub fn get_setting(key: String) -> Result<String, String> {
    todo!("实现获取单个设置项")
}

#[command]
pub fn set_setting(key: String, value: String) -> Result<(), String> {
    todo!("实现设置单个设置项")
}

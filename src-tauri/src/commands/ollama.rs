// Ollama 检测和安装命令
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OllamaStatus {
    pub installed: bool,
    pub running: bool,
    pub version: Option<String>,
    pub models: Vec<OllamaModel>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OllamaModel {
    pub name: String,
    pub size: u64,
    pub modified_at: String,
}

#[tauri::command]
pub async fn check_ollama_status() -> Result<OllamaStatus, String> {
    let client = reqwest::Client::new();
    let result = client
        .get("http://localhost:11434/api/version")
        .timeout(std::time::Duration::from_secs(2))
        .send()
        .await;

    match result {
        Ok(resp) if resp.status().is_success() => {
            let version = resp.json::<serde_json::Value>().await.ok()
                .and_then(|v| v.get("version").cloned())
                .and_then(|v| v.as_str().map(String::from));

            let models = get_models_from_ollama().await.unwrap_or_default();

            Ok(OllamaStatus { installed: true, running: true, version, models })
        }
        _ => {
            let installed = is_ollama_installed();
            Ok(OllamaStatus { installed, running: false, version: None, models: vec![] })
        }
    }
}

/// 跨平台检测 Ollama 是否安装
fn is_ollama_installed() -> bool {
    let cmd = if cfg!(target_os = "windows") { "where" } else { "which" };
    std::process::Command::new(cmd)
        .arg("ollama")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

async fn get_models_from_ollama() -> Result<Vec<OllamaModel>, String> {
    let client = reqwest::Client::new();
    let resp = client
        .get("http://localhost:11434/api/tags")
        .timeout(std::time::Duration::from_secs(5))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let data: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;
    let models = data.get("models")
        .and_then(|m| m.as_array())
        .map(|arr| {
            arr.iter().filter_map(|m| {
                Some(OllamaModel {
                    name: m.get("name")?.as_str()?.to_string(),
                    size: m.get("size")?.as_u64()?,
                    modified_at: m.get("modified_at")?.as_str()?.to_string(),
                })
            }).collect()
        })
        .unwrap_or_default();

    Ok(models)
}

#[tauri::command]
pub async fn install_ollama() -> Result<String, String> {
    #[cfg(target_os = "macos")]
    return Ok("请访问 https://ollama.com/download 下载并安装 Ollama".to_string());

    #[cfg(target_os = "linux")]
    return Ok("运行: curl -fsSL https://ollama.com/install.sh | sh".to_string());

    #[cfg(target_os = "windows")]
    return Ok("请访问 https://ollama.com/download 下载 Windows 版本".to_string());

    #[cfg(not(any(target_os = "macos", target_os = "linux", target_os = "windows")))]
    return Ok("请访问 https://ollama.com/download 下载适合您系统的版本".to_string());
}

#[tauri::command]
pub async fn pull_model(model: String) -> Result<String, String> {
    let client = reqwest::Client::new();
    client.post("http://localhost:11434/api/pull")
        .json(&serde_json::json!({ "name": model }))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    Ok(format!("开始下载模型: {}", model))
}

#[tauri::command]
pub async fn get_models() -> Result<Vec<OllamaModel>, String> {
    get_models_from_ollama().await
}

// Ollama自动安装和管理命令
use serde::{Deserialize, Serialize};
use std::io::Write;
use std::path::PathBuf;
use std::process::Command;
use tauri::{command, AppHandle, Emitter};
use futures_util::StreamExt;
use crate::db::get_db_path;
use rusqlite::Connection;

const DEFAULT_MODEL: &str = "qwen2.5:7b";
const OLLAMA_API_URL: &str = "http://localhost:11434";

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OllamaStatus {
    pub installed: bool,
    pub running: bool,
    pub version: Option<String>,
    pub models: Vec<String>,
    pub default_model_installed: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InstallProgress {
    pub stage: String,
    pub downloaded: u64,
    pub total: u64,
    pub percent: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PullProgress {
    pub status: String,
    pub digest: Option<String>,
    pub total: Option<u64>,
    pub completed: Option<u64>,
}

/// 检测Ollama是否已安装
fn is_ollama_installed() -> bool {
    // 方法1: 尝试执行 ollama --version
    if let Ok(output) = Command::new("ollama")
        .arg("--version")
        .output()
    {
        if output.status.success() {
            return true;
        }
    }
    
    // 方法2: Windows检查安装路径
    if cfg!(target_os = "windows") {
        if let Ok(local_app_data) = std::env::var("LOCALAPPDATA") {
            let ollama_path: PathBuf = [
                &local_app_data,
                "Programs",
                "Ollama",
                "ollama.exe",
            ].iter().collect();
            if ollama_path.exists() {
                return true;
            }
        }
        // 也检查 Program Files
        if let Ok(program_files) = std::env::var("ProgramFiles") {
            let ollama_path: PathBuf = [
                &program_files,
                "Ollama",
                "ollama.exe",
            ].iter().collect();
            if ollama_path.exists() {
                return true;
            }
        }
    }
    
    false
}

/// 获取Ollama版本
fn get_ollama_version() -> Option<String> {
    if let Ok(output) = Command::new("ollama")
        .arg("--version")
        .output()
    {
        if output.status.success() {
            let version = String::from_utf8_lossy(&output.stdout).trim().to_string();
            return Some(version);
        }
    }
    None
}

/// 检测Ollama服务是否在运行
fn is_ollama_running() -> bool {
    if let Ok(response) = reqwest::blocking::Client::new()
        .get(&format!("{}/api/tags", OLLAMA_API_URL))
        .timeout(std::time::Duration::from_secs(3))
        .send()
    {
        return response.status().is_success();
    }
    false
}

/// 获取已安装的模型列表
fn get_installed_models() -> Vec<String> {
    if let Ok(response) = reqwest::blocking::Client::new()
        .get(&format!("{}/api/tags", OLLAMA_API_URL))
        .timeout(std::time::Duration::from_secs(5))
        .send()
    {
        if let Ok(json) = response.json::<serde_json::Value>() {
            if let Some(models) = json.get("models").and_then(|m| m.as_array()) {
                return models
                    .iter()
                    .filter_map(|m| m.get("name").and_then(|n| n.as_str()))
                    .map(|s| s.to_string())
                    .collect();
            }
        }
    }
    vec![]
}

/// 检查Ollama安装和运行状态
#[command]
pub async fn check_ollama_status() -> Result<OllamaStatus, String> {
    let installed = is_ollama_installed();
    let running = if installed { is_ollama_running() } else { false };
    let version = if installed { get_ollama_version() } else { None };
    let models = if running { get_installed_models() } else { vec![] };
    let default_model_installed = models.iter().any(|m| m.starts_with("qwen2.5"));

    Ok(OllamaStatus {
        installed,
        running,
        version,
        models,
        default_model_installed,
    })
}

/// 获取Ollama安装程序路径（Windows）
fn get_ollama_installer_path() -> PathBuf {
    std::env::temp_dir().join("OllamaSetup.exe")
}

/// 下载Ollama安装包
async fn download_ollama(app: &AppHandle) -> Result<PathBuf, String> {
    let url = "https://ollama.com/download/OllamaSetup.exe";
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(600))
        .build()
        .map_err(|e| e.to_string())?;
    
    let response = client.get(url).send().await.map_err(|e| e.to_string())?;
    
    if !response.status().is_success() {
        return Err(format!("下载失败，状态码: {}", response.status()));
    }
    
    let total_size = response.content_length().unwrap_or(0);
    let file_path = get_ollama_installer_path();
    let mut file = std::fs::File::create(&file_path).map_err(|e| e.to_string())?;
    
    let mut downloaded: u64 = 0;
    let mut stream = response.bytes_stream();
    
    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| e.to_string())?;
        file.write_all(&chunk).map_err(|e| e.to_string())?;
        downloaded += chunk.len() as u64;
        
        // 发送下载进度
        let percent = if total_size > 0 {
            (downloaded as f64 / total_size as f64 * 100.0) as u32
        } else {
            0
        };
        
        let progress = InstallProgress {
            stage: "downloading".to_string(),
            downloaded,
            total: total_size,
            percent,
        };
        
        app.emit("ollama-install-progress", &progress).ok();
    }
    
    // 验证文件
    if !file_path.exists() || file_path.metadata().map(|m| m.len()).unwrap_or(0) == 0 {
        return Err("下载的文件无效".to_string());
    }
    
    Ok(file_path)
}

/// 运行Ollama安装程序
fn run_installer(installer_path: &PathBuf, app: &AppHandle) -> Result<(), String> {
    app.emit("ollama-install-progress", &InstallProgress {
        stage: "installing".to_string(),
        downloaded: 0,
        total: 0,
        percent: 0,
    }).ok();
    
    // Windows静默安装
    let output = Command::new(installer_path)
        .arg("/S")
        .arg("/VERYSILENT")
        .arg("/NORESTART")
        .spawn()
        .map_err(|e| format!("无法启动安装程序: {}", e))?;
    
    // 等待安装完成（最多等待120秒）
    let timeout = std::time::Duration::from_secs(120);
    let start = std::time::Instant::now();
    
    while start.elapsed() < timeout {
        match output.try_wait() {
            Ok(Some(status)) => {
                if status.success() {
                    return Ok(());
                } else {
                    return Err(format!("安装失败，退出码: {:?}", status.code()));
                }
            }
            Ok(None) => {
                std::thread::sleep(std::time::Duration::from_millis(500));
            }
            Err(e) => {
                return Err(format!("等待安装程序出错: {}", e));
            }
        }
    }
    
    // 超时但安装可能仍在进行
    Err("安装超时，请检查安装程序是否完成".to_string())
}

/// 下载并安装Ollama
#[command]
pub async fn install_ollama(app: AppHandle) -> Result<(), String> {
    // 1. 下载安装包
    let installer_path = download_ollama(&app).await?;
    
    // 2. 运行安装程序
    run_installer(&installer_path, &app)?;
    
    // 3. 清理安装包
    let _ = std::fs::remove_file(&installer_path);
    
    // 4. 完成
    app.emit("ollama-install-progress", &InstallProgress {
        stage: "complete".to_string(),
        downloaded: 0,
        total: 0,
        percent: 100,
    }).ok();
    
    Ok(())
}

/// 启动Ollama服务
#[command]
pub async fn start_ollama() -> Result<(), String> {
    if cfg!(target_os = "windows") {
        // Windows: 尝试启动Ollama应用
        // 先检查是否已在运行
        if is_ollama_running() {
            return Ok(());
        }
        
        // 尝试通过命令启动
        let _ = Command::new("ollama")
            .arg("serve")
            .spawn();
        
        // 等待服务启动
        for _ in 0..30 {
            std::thread::sleep(std::time::Duration::from_secs(1));
            if is_ollama_running() {
                return Ok(());
            }
        }
        
        // 如果命令行启动失败，尝试启动GUI应用
        if let Ok(local_app_data) = std::env::var("LOCALAPPDATA") {
            let ollama_gui_path: PathBuf = [
                &local_app_data,
                "Programs",
                "Ollama",
                "ollama.exe",
            ].iter().collect();
            
            if ollama_gui_path.exists() {
                let _ = Command::new(&ollama_gui_path).spawn();
                
                // 等待服务启动
                for _ in 0..30 {
                    std::thread::sleep(std::time::Duration::from_secs(1));
                    if is_ollama_running() {
                        return Ok(());
                    }
                }
            }
        }
        
        Err("无法启动Ollama服务，请手动启动Ollama应用".to_string())
    } else {
        // macOS/Linux
        if is_ollama_running() {
            return Ok(());
        }
        
        let _ = Command::new("ollama")
            .arg("serve")
            .spawn();
        
        // 等待服务启动
        for _ in 0..30 {
            std::thread::sleep(std::time::Duration::from_secs(1));
            if is_ollama_running() {
                return Ok(());
            }
        }
        
        Err("无法启动Ollama服务".to_string())
    }
}

/// 拉取默认模型（带进度）
#[command]
pub async fn pull_default_model(app: AppHandle) -> Result<(), String> {
    pull_model_with_progress(&app, DEFAULT_MODEL).await
}

/// 拉取指定模型（带进度）
async fn pull_model_with_progress(app: &AppHandle, model: &str) -> Result<(), String> {
    let url = format!("{}/api/pull", OLLAMA_API_URL);
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(3600)) // 1小时超时
        .build()
        .map_err(|e| e.to_string())?;
    
    let response = client
        .post(&url)
        .json(&serde_json::json!({ "name": model, "stream": true }))
        .send()
        .await
        .map_err(|e| format!("请求失败: {}", e))?;
    
    if !response.status().is_success() {
        return Err(format!("拉取模型失败，状态码: {}", response.status()));
    }
    
    // Ollama的pull API返回NDJSON流
    let mut last_progress = PullProgress {
        status: "waiting".to_string(),
        digest: None,
        total: None,
        completed: None,
    };
    
    let body = response.text().await.map_err(|e| e.to_string())?;
    
    for line in body.lines() {
        if let Ok(json) = serde_json::from_str::<serde_json::Value>(line) {
            let status = json.get("status")
                .and_then(|s| s.as_str())
                .unwrap_or("unknown")
                .to_string();
            
            let digest = json.get("digest").and_then(|d| d.as_str()).map(|s| s.to_string());
            let total = json.get("total").and_then(|t| t.as_u64());
            let completed = json.get("completed").and_then(|c| c.as_u64());
            
            last_progress = PullProgress {
                status,
                digest,
                total,
                completed,
            };
            
            app.emit("ollama-pull-progress", &last_progress).ok();
        }
    }
    
    // 检查是否成功完成
    if last_progress.status.contains("success") || last_progress.status.contains("ready") {
        Ok(())
    } else if last_progress.status.contains("error") {
        Err(format!("拉取模型失败: {}", last_progress.status))
    } else {
        Ok(())
    }
}

/// 跳过AI安装（无AI模式）
#[command]
pub fn skip_ai_install() -> Result<(), String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT OR REPLACE INTO settings (key, value) VALUES ('ai_skipped', 'true')",
        [],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

/// 检查是否已跳过AI安装
#[command]
pub fn is_ai_skipped() -> Result<bool, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT value FROM settings WHERE key = 'ai_skipped'")
        .map_err(|e| e.to_string())?;
    let result: Option<String> = stmt.query_row([], |row| row.get(0)).ok();
    Ok(result == Some("true".to_string()))
}

/// 检查是否是首次启动
#[command]
pub fn is_first_launch() -> Result<bool, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT value FROM settings WHERE key = 'first_launch_done'")
        .map_err(|e| e.to_string())?;
    let result: Option<String> = stmt.query_row([], |row| row.get(0)).ok();
    Ok(result != Some("true".to_string()))
}

/// 标记首次启动完成
#[command]
pub fn complete_first_launch() -> Result<(), String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT OR REPLACE INTO settings (key, value) VALUES ('first_launch_done', 'true')",
        [],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

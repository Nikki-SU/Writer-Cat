// 远程同步命令 - 支持局域网和 Tailscale/远程模式
use crate::AppState;
use crate::commands::book::get_data_dir;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::net::{Ipv4Addr, SocketAddr, SocketAddrV4};
use std::sync::{Arc, Mutex};
use tauri::State;
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::broadcast;
use walkdir::WalkDir;
use zip::{write::FileOptions, ZipWriter};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum SyncMode {
    Lan,      // 局域网模式
    Remote,   // 远程模式（Tailscale/自定义 VPN）
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RemoteDeviceInfo {
    pub device_id: String,
    pub device_name: String,
    pub tailnet_address: Option<String>,
    pub public_address: Option<String>,
    pub port: u16,
    pub online: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RemoteSyncStatus {
    pub mode: SyncMode,
    pub is_server_running: bool,
    pub server_port: u16,
    pub tailnet_ip: Option<String>,
    pub connected_peers: Vec<RemoteDeviceInfo>,
    pub last_sync: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncRequest {
    pub book_id: String,
    pub target_device_id: String,
    pub target_address: String,
    pub target_port: u16,
}

pub struct RemoteSyncManager {
    pub status: Mutex<RemoteSyncStatus>,
    pub tx: broadcast::Sender<String>,
}

impl RemoteSyncManager {
    pub fn new() -> Self {
        let (tx, _) = broadcast::channel(100);
        Self {
            status: Mutex::new(RemoteSyncStatus {
                mode: SyncMode::Lan,
                is_server_running: false,
                server_port: 0,
                tailnet_ip: None,
                connected_peers: Vec::new(),
                last_sync: None,
            }),
            tx,
        }
    }
}

#[tauri::command]
pub async fn start_remote_sync_server(
    sync_manager: tauri::State<'_, Arc<RemoteSyncManager>>,
    device_name: String,
    mode: SyncMode,
) -> Result<RemoteSyncStatus, String> {
    let device_id = uuid::Uuid::new_v4().to_string();
    
    let port = if mode == SyncMode::Lan { 8090 } else { 8091 };
    
    let (listener, actual_port) = match TcpListener::bind(SocketAddr::V4(
        SocketAddrV4::new(Ipv4Addr::new(0, 0, 0, 0), port)
    )).await {
        Ok(l) => (Some(l), port),
        Err(_) => {
            let alt_port = port + 10;
            let l = TcpListener::bind(SocketAddr::V4(
                SocketAddrV4::new(Ipv4Addr::new(0, 0, 0, 0), alt_port)
            )).await?;
            (Some(l), alt_port)
        }
    };

    let tailnet_ip = if mode == SyncMode::Remote {
        get_tailscale_ip().await.ok()
    } else {
        None
    };

    {
        let mut status = sync_manager.status.lock().unwrap();
        status.mode = mode.clone();
        status.is_server_running = true;
        status.server_port = actual_port;
        status.tailnet_ip = tailnet_ip.clone();
    }

    if let Some(listener) = listener {
        let sync_manager_clone = sync_manager.clone();
        tauri::async_runtime::spawn(async move {
            run_remote_server(listener, sync_manager_clone).await;
        });
    }

    Ok(sync_manager.status.lock().unwrap().clone())
}

async fn get_tailscale_ip() -> Result<String, String> {
    let output = tokio::process::Command::new("tailscale")
        .args(["ip", "-4"])
        .output()
        .await
        .map_err(|e| e.to_string())?;
    
    if output.status.success() {
        let ip = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if !ip.is_empty() && ip.contains('.') {
            return Ok(ip);
        }
    }
    
    Err("Tailscale not running or not configured".to_string())
}

async fn run_remote_server(
    listener: TcpListener,
    sync_manager: Arc<RemoteSyncManager>,
) {
    loop {
        match listener.accept().await {
            Ok((stream, addr)) => {
                let sync_manager_clone = sync_manager.clone();
                tauri::async_runtime::spawn(async move {
                    handle_remote_connection(stream, addr, sync_manager_clone).await;
                });
            }
            Err(e) => {
                eprintln!("Accept error: {}", e);
            }
        }
    }
}

async fn handle_remote_connection(
    stream: TcpStream,
    addr: std::net::SocketAddr,
    sync_manager: Arc<RemoteSyncManager>,
) {
    let mut buffer = vec![0u8; 1024 * 1024];
    
    match tokio::io::read(&stream, &mut buffer).await {
        Ok(n) if n > 0 => {
            if let Ok(request) = serde_json::from_slice::<SyncRequest>(&buffer[..n]) {
                if let Err(e) = process_sync_request(request).await {
                    eprintln!("Sync error: {}", e);
                }
            }
        }
        _ => {}
    }
}

async fn process_sync_request(request: SyncRequest) -> Result<(), String> {
    let address = format!("{}:{}", request.target_address, request.target_port);
    
    let mut stream = TcpStream::connect(&address)
        .await
        .map_err(|e| format!("Connection failed: {}", e))?;
    
    let book_data = package_book_for_sync(&request.book_id).await?;
    
    let len_bytes = (book_data.len() as u32).to_be_bytes();
    tokio::io::write_all(&mut stream, &len_bytes).await?;
    tokio::io::write_all(&mut stream, &book_data).await?;
    
    Ok(())
}

async fn package_book_for_sync(book_id: &str) -> Result<Vec<u8>, String> {
    let data_dir = get_data_dir();
    let book_dir = data_dir.join("books").join(book_id);
    
    let mut buffer = Vec::new();
    let mut zip = ZipWriter::new(std::io::Cursor::new(&mut buffer));
    let options = FileOptions::default().compression_method(zip::CompressionMethod::Deflated);

    if book_dir.exists() {
        for entry in WalkDir::new(&book_dir) {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();
            
            if path.is_file() {
                let relative_path = path.strip_prefix(&book_dir).unwrap();
                zip.start_file(relative_path.to_string_lossy(), options)?;
                
                let content = std::fs::read(path)?;
                zip.write_all(&content)?;
            }
        }
    }

    zip.finish().map_err(|e| e.to_string())?;
    Ok(buffer)
}

#[tauri::command]
pub async fn stop_remote_sync_server(
    sync_manager: tauri::State<'_, Arc<RemoteSyncManager>>,
) -> Result<(), String> {
    let mut status = sync_manager.status.lock().unwrap();
    status.is_server_running = false;
    status.connected_peers.clear();
    Ok(())
}

#[tauri::command]
pub async fn get_remote_sync_status(
    sync_manager: tauri::State<'_, Arc<RemoteSyncManager>>,
) -> Result<RemoteSyncStatus, String> {
    Ok(sync_manager.status.lock().unwrap().clone())
}

#[tauri::command]
pub async fn check_tailscale_status() -> Result<Option<String>, String> {
    match get_tailscale_ip().await {
        Ok(ip) => Ok(Some(ip)),
        Err(_) => Ok(None),
    }
}

#[tauri::command]
pub async fn connect_to_peer(
    target_address: String,
    target_port: u16,
    book_id: String,
) -> Result<String, String> {
    let request = SyncRequest {
        book_id,
        target_device_id: String::new(),
        target_address,
        target_port,
    };
    
    process_sync_request(request).await?;
    Ok("Sync completed".to_string())
}

#[tauri::command]
pub async fn register_peer(
    sync_manager: tauri::State<'_, Arc<RemoteSyncManager>>,
    device_name: String,
    device_id: String,
    tailnet_address: Option<String>,
) -> Result<(), String> {
    let peer = RemoteDeviceInfo {
        device_id,
        device_name,
        tailnet_address,
        public_address: None,
        port: sync_manager.status.lock().unwrap().server_port,
        online: true,
    };
    
    let mut status = sync_manager.status.lock().unwrap();
    status.connected_peers.push(peer);
    
    Ok(())
}

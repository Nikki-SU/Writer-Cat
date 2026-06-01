// 本地局域网同步命令 - 点对点 mDNS 发现 + TCP 传输
use crate::AppState;
use crate::commands::book::get_data_dir;
use async_trait::async_trait;
use chrono::Utc;
use futures::{SinkExt, StreamExt};
use mdns_sd::{ServiceDaemon, ServiceInfo};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::net::{Ipv4Addr, SocketAddr, SocketAddrV4};
use std::sync::{Arc, Mutex};
use tauri::State;
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::broadcast;
use tokio_serde::formats::Json;
use tokio_util::codec::{Framed, LengthDelimitedCodec};
use walkdir::WalkDir;
use zip::{write::FileOptions, ZipWriter};
use std::io::Write;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceInfo {
    pub device_id: String,
    pub device_name: String,
    pub ip_address: String,
    pub port: u16,
    pub is_sync_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SyncMessage {
    Hello { device_info: DeviceInfo },
    RequestSync { from_device: String, book_id: String },
    OfferSync { from_device: String, data: Vec<u8>, timestamp: String },
    AcceptSync { from_device: String },
    RejectSync { from_device: String },
    Heartbeat,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncStatus {
    pub is_server_running: bool,
    pub server_port: u16,
    pub connected_devices: Vec<DeviceInfo>,
    pub last_sync: Option<String>,
}

// 全局同步状态
pub struct SyncManager {
    pub status: Mutex<SyncStatus>,
    pub tx: broadcast::Sender<SyncMessage>,
}

impl SyncManager {
    pub fn new() -> Self {
        let (tx, _) = broadcast::channel(100);
        Self {
            status: Mutex::new(SyncStatus {
                is_server_running: false,
                server_port: 0,
                connected_devices: Vec::new(),
                last_sync: None,
            }),
            tx,
        }
    }
}

#[tauri::command]
pub async fn start_sync_server(
    state: State<'_, AppState>,
    sync_manager: tauri::State<'_, Arc<SyncManager>>,
    device_name: String,
) -> Result<SyncStatus, String> {
    let device_id = uuid::Uuid::new_v4().to_string();
    
    let (listener, port) = find_available_port().await?;
    
    {
        let mut status = sync_manager.status.lock().unwrap();
        status.is_server_running = true;
        status.server_port = port;
    }

    start_mdns_service(device_name.clone(), port)?;

    tauri::async_runtime::spawn(async move {
        if let Err(e) = run_sync_server(listener, device_name, device_id, sync_manager.clone()).await {
            eprintln!("Sync server error: {}", e);
        }
    });

    Ok(sync_manager.status.lock().unwrap().clone())
}

async fn find_available_port() -> Result<(TcpListener, u16), String> {
    for port in 8080..8100 {
        let addr = SocketAddr::V4(SocketAddrV4::new(Ipv4Addr::new(0, 0, 0, 0), port));
        if let Ok(listener) = TcpListener::bind(addr).await {
            return Ok((listener, port));
        }
    }
    Err("No available port found".to_string())
}

fn start_mdns_service(device_name: String, port: u16) -> Result<(), String> {
    let mdns = ServiceDaemon::new()?;
    let service_name = format!("{}-{}", device_name, uuid::Uuid::new_v4().to_string()[..8].to_string());
    
    let service_info = ServiceInfo::new(
        "_writercat._tcp.local.",
        &service_name,
        &device_name,
        "",
        port,
        &[("device", "writer-cat")][..],
    )?;

    mdns.register(service_info)?;
    Ok(())
}

async fn run_sync_server(
    listener: TcpListener,
    device_name: String,
    device_id: String,
    sync_manager: Arc<SyncManager>,
) -> Result<(), String> {
    loop {
        if let Ok((stream, addr)) = listener.accept().await {
            let device_info = DeviceInfo {
                device_id: device_id.clone(),
                device_name: device_name.clone(),
                ip_address: addr.ip().to_string(),
                port: addr.port(),
                is_sync_active: true,
            };

            let sync_manager_clone = sync_manager.clone();
            tauri::async_runtime::spawn(async move {
                handle_connection(stream, device_info, sync_manager_clone).await;
            });
        }
    }
}

async fn handle_connection(
    stream: TcpStream,
    device_info: DeviceInfo,
    sync_manager: Arc<SyncManager>,
) {
    let length_delimited = LengthDelimitedCodec::new();
    let framed = Framed::new(stream, length_delimited);
    let (mut writer, mut reader) = framed.split::<SyncMessage>();

    writer.send(SyncMessage::Hello { device_info: device_info.clone() }).await.ok();

    {
        let mut status = sync_manager.status.lock().unwrap();
        status.connected_devices.push(device_info);
    }

    while let Some(Ok(msg)) = reader.next().await {
        match msg {
            SyncMessage::RequestSync { from_device, book_id } => {
                let data = package_book_data(&book_id).await.ok().unwrap_or_default();
                let offer = SyncMessage::OfferSync {
                    from_device: device_info.device_id.clone(),
                    data,
                    timestamp: Utc::now().to_rfc3339(),
                };
                writer.send(offer).await.ok();
            }
            SyncMessage::Heartbeat => {}
            _ => {}
        }
    }
}

async fn package_book_data(book_id: &str) -> Result<Vec<u8>, String> {
    let data_dir = get_data_dir();
    let book_dir = data_dir.join("books").join(book_id);
    
    let mut buffer = Vec::new();
    let mut zip = ZipWriter::new(std::io::Cursor::new(&mut buffer));
    let options = FileOptions::default().compression_method(zip::CompressionMethod::Deflated);

    if book_dir.exists() {
        for entry in WalkDir::new(&book_dir) {
            let entry = entry?;
            let path = entry.path();
            
            if path.is_file() {
                let relative_path = path.strip_prefix(&book_dir)?;
                zip.start_file(relative_path.to_string_lossy(), options)?;
                
                let content = std::fs::read(path)?;
                zip.write_all(&content)?;
            }
        }
    }

    zip.finish()?;
    Ok(buffer)
}

#[tauri::command]
pub async fn stop_sync_server(
    sync_manager: tauri::State<'_, Arc<SyncManager>>,
) -> Result<(), String> {
    let mut status = sync_manager.status.lock().unwrap();
    status.is_server_running = false;
    status.connected_devices.clear();
    Ok(())
}

#[tauri::command]
pub async fn get_sync_status(
    sync_manager: tauri::State<'_, Arc<SyncManager>>,
) -> Result<SyncStatus, String> {
    Ok(sync_manager.status.lock().unwrap().clone())
}

#[tauri::command]
pub async fn discover_devices() -> Result<Vec<DeviceInfo>, String> {
    let mdns = ServiceDaemon::new()?;
    let mut receiver = mdns.browse("_writercat._tcp.local.")?;
    
    let mut devices = Vec::new();
    let duration = std::time::Duration::from_secs(3);
    
    tokio::select! {
        _ = tokio::time::sleep(duration) => {}
        Some(result) = receiver.recv() => {
            if let Ok(service_event) = result {
                if let mdns_sd::ServiceEvent::ServiceFound(_, _) = service_event {
                    // 设备发现处理
                }
            }
        }
    }
    
    Ok(devices)
}

#[tauri::command]
pub async fn request_sync_from_device(
    state: State<'_, AppState>,
    sync_manager: tauri::State<'_, Arc<SyncManager>>,
    device_id: String,
    book_id: String,
) -> Result<String, String> {
    // 实现实际的同步连接逻辑
    Ok("Sync initiated".to_string())
}

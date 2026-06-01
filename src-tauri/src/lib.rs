// Writer-Cat 库入口 - Tauri 应用设置
mod commands;
mod db;
mod models;

use std::sync::Arc;
use tauri::Manager;

/// 应用状态 - SqlitePool 本身是 Clone + Send + Sync，无需 Mutex
pub struct AppState {
    pub db: sqlx::SqlitePool,
}

/// 同步管理器包装器
#[derive(Clone)]
pub struct SyncState(pub Arc<commands::sync::SyncManager>);

/// 远程同步管理器包装器
#[derive(Clone)]
pub struct RemoteSyncState(pub Arc<commands::remote_sync::RemoteSyncManager>);

pub fn run() {
    let db_path = dirs::data_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("."))
        .join("writer-cat")
        .join("data")
        .join("writer_cat.db");

    // 确保目录存在
    if let Some(parent) = db_path.parent() {
        std::fs::create_dir_all(parent).ok();
    }

    let db_url = format!("sqlite:{}?mode=rwc", db_path.display());
    let pool = tokio::runtime::Runtime::new()
        .unwrap()
        .block_on(async {
            sqlx::sqlite::SqlitePoolOptions::new()
                .max_connections(5)
                .connect(&db_url)
                .await
                .expect("数据库连接失败")
        });

    // 初始化数据库表
    tokio::runtime::Runtime::new()
        .unwrap()
        .block_on(async {
            db::init_db(&pool).await.expect("数据库初始化失败");
        });

    let sync_manager = Arc::new(commands::sync::SyncManager::new());
    let remote_sync_manager = Arc::new(commands::remote_sync::RemoteSyncManager::new());

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(AppState { db: pool })
        .manage(SyncState(sync_manager))
        .manage(RemoteSyncState(remote_sync_manager))
        .invoke_handler(tauri::generate_handler![
            // 书籍相关
            commands::book::create_book,
            commands::book::get_books,
            commands::book::get_book,
            commands::book::update_book,
            commands::book::delete_book,
            commands::book::get_data_path,
            // 章节相关
            commands::chapter::create_chapter,
            commands::chapter::get_chapters,
            commands::chapter::get_chapter,
            commands::chapter::update_chapter,
            commands::chapter::delete_chapter,
            commands::chapter::reorder_chapters,
            commands::chapter::read_chapter_content,
            commands::chapter::write_chapter_content,
            commands::chapter::get_backups,
            commands::chapter::restore_backup,
            commands::chapter::export_chapter,
            commands::chapter::export_book,
            // 人物相关
            commands::character::get_characters,
            commands::character::create_character,
            commands::character::update_character,
            commands::character::delete_character,
            commands::character::get_relationships,
            commands::character::add_relationship,
            commands::character::remove_relationship,
            commands::character::get_timeline_events,
            commands::character::add_timeline_event,
            commands::character::update_timeline_event,
            commands::character::delete_timeline_event,
            // 情节相关
            commands::plot::get_plots,
            commands::plot::create_plot,
            commands::plot::update_plot,
            commands::plot::delete_plot,
            commands::plot::update_emotion,
            commands::plot::get_emotions,
            // 伏笔/世界观相关
            commands::structure::get_structures,
            commands::structure::create_foreshadow,
            commands::structure::update_foreshadow,
            commands::structure::delete_foreshadow,
            commands::structure::resolve_foreshadow,
            commands::structure::create_worldview,
            commands::structure::update_worldview,
            commands::structure::delete_worldview,
            commands::structure::mount_worldview,
            commands::structure::unmount_worldview,
            // 线索相关
            commands::thread::get_threads,
            commands::thread::create_thread,
            commands::thread::update_thread,
            commands::thread::delete_thread,
            commands::thread::add_thread_node,
            commands::thread::update_thread_node,
            commands::thread::delete_thread_node,
            // AI 相关
            commands::ai::check_text,
            commands::ai::extract_entities,
            commands::ai::generate_text,
            // Ollama 相关
            commands::ollama::check_ollama_status,
            commands::ollama::install_ollama,
            commands::ollama::pull_model,
            commands::ollama::get_models,
            // 设置相关
            commands::settings::get_settings,
            commands::settings::update_settings,
            commands::settings::export_data,
            commands::settings::import_data,
            // 同步相关
            commands::sync::start_sync_server,
            commands::sync::stop_sync_server,
            commands::sync::get_sync_status,
            commands::sync::discover_devices,
            commands::sync::request_sync_from_device,
            // 远程同步相关
            commands::remote_sync::start_remote_sync_server,
            commands::remote_sync::stop_remote_sync_server,
            commands::remote_sync::get_remote_sync_status,
            commands::remote_sync::check_tailscale_status,
            commands::remote_sync::connect_to_peer,
            commands::remote_sync::register_peer,
        ])
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            window.set_title("网文猫 - 本地网文写作工具").ok();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("应用启动失败");
}

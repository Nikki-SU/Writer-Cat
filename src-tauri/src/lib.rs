// 库入口文件
mod commands;
mod db;
mod models;

use tauri::Manager;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // 初始化数据库
            let app_data_dir = app.path().app_data_dir().expect("Failed to get app data dir");
            std::fs::create_dir_all(&app_data_dir).expect("Failed to create app data dir");
            
            let db_path = app_data_dir.join("writer_cat.db");
            db::init_database(&db_path).expect("Failed to initialize database");
            
            println!("网文猫启动成功，数据目录: {:?}", app_data_dir);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // 书籍相关命令
            commands::book::create_book,
            commands::book::get_books,
            commands::book::get_book,
            commands::book::update_book,
            commands::book::delete_book,
            // 章节相关命令
            commands::chapter::create_chapter,
            commands::chapter::get_chapters,
            commands::chapter::get_chapter,
            commands::chapter::update_chapter,
            commands::chapter::delete_chapter,
            // 人物相关命令
            commands::character::create_character,
            commands::character::get_characters,
            commands::character::get_character,
            commands::character::update_character,
            commands::character::delete_character,
            // 人物关系命令
            commands::character::create_relation,
            commands::character::get_relations,
            commands::character::update_relation,
            commands::character::delete_relation,
            // 人物时间线命令
            commands::character::create_timeline_event,
            commands::character::get_timeline,
            commands::character::update_timeline_event,
            commands::character::delete_timeline_event,
            // 情节相关命令
            commands::plot::create_plot_item,
            commands::plot::get_plot_items,
            commands::plot::get_all_plot_items,
            commands::plot::update_plot_item,
            commands::plot::delete_plot_item,
            commands::plot::reorder_plot_items,
            // 结构相关命令（伏笔+世界观）
            commands::structure::create_foreshadow,
            commands::structure::get_foreshadows,
            commands::structure::update_foreshadow,
            commands::structure::delete_foreshadow,
            commands::structure::create_worldview,
            commands::structure::get_worldviews,
            commands::structure::get_worldview,
            commands::structure::update_worldview,
            commands::structure::delete_worldview,
            commands::structure::attach_worldview_to_chapter,
            commands::structure::detach_worldview_from_chapter,
            commands::structure::get_worldview_chapters,
            commands::structure::get_chapter_worldviews,
            // 线索相关命令
            commands::thread::create_thread,
            commands::thread::get_threads,
            commands::thread::get_thread,
            commands::thread::update_thread,
            commands::thread::delete_thread,
            commands::thread::create_thread_node,
            commands::thread::get_thread_nodes,
            commands::thread::update_thread_node,
            commands::thread::delete_thread_node,
            commands::thread::reorder_thread_nodes,
            // AI相关命令
            commands::ai::check_spelling,
            commands::ai::detect_characters,
            commands::ai::summarize_text,
            commands::ai::generate_timeline,
            commands::ai::check_worldview_conflict,
            commands::ai::check_character_conflict,
            // 设置相关命令
            commands::settings::get_settings,
            commands::settings::update_settings,
            commands::settings::get_setting,
            commands::settings::set_setting,
        ])
        .run(tauri::generate_context!())
        .expect("Error while running tauri application");
}

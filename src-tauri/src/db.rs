// SQLite数据库初始化
use rusqlite::{Connection, Result};
use std::path::Path;

pub fn init_database(path: &Path) -> Result<()> {
    let conn = Connection::open(path)?;
    
    // 创建书籍表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS books (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            total_words INTEGER DEFAULT 0,
            target_words INTEGER DEFAULT 3000
        )",
        [],
    )?;
    
    // 创建章节表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS chapters (
            id TEXT PRIMARY KEY,
            book_id TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT DEFAULT '',
            order_index INTEGER NOT NULL,
            word_count INTEGER DEFAULT 0,
            target_word_count INTEGER DEFAULT 3000,
            expected_emotion TEXT DEFAULT '[]',
            actual_emotion TEXT DEFAULT '[]',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
        )",
        [],
    )?;
    
    // 创建人物表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS characters (
            id TEXT PRIMARY KEY,
            book_id TEXT NOT NULL,
            name TEXT NOT NULL,
            avatar TEXT DEFAULT '',
            gender TEXT DEFAULT '',
            age INTEGER DEFAULT 0,
            intro TEXT DEFAULT '',
            personality TEXT DEFAULT '',
            appearance TEXT DEFAULT '',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
        )",
        [],
    )?;
    
    // 创建人物关系表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS character_relations (
            id TEXT PRIMARY KEY,
            book_id TEXT NOT NULL,
            character_id TEXT NOT NULL,
            target_character_id TEXT NOT NULL,
            relation_type TEXT NOT NULL,
            start_chapter INTEGER DEFAULT 1,
            end_chapter INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
            FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
            FOREIGN KEY (target_character_id) REFERENCES characters(id) ON DELETE CASCADE
        )",
        [],
    )?;
    
    // 创建人物时间线表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS character_timelines (
            id TEXT PRIMARY KEY,
            character_id TEXT NOT NULL,
            chapter_id TEXT NOT NULL,
            chapter_title TEXT NOT NULL,
            event TEXT NOT NULL,
            personality_change TEXT DEFAULT '',
            created_at TEXT NOT NULL,
            FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
            FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
        )",
        [],
    )?;
    
    // 创建情节表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS plot_items (
            id TEXT PRIMARY KEY,
            chapter_id TEXT NOT NULL,
            book_id TEXT NOT NULL,
            content TEXT NOT NULL,
            completed INTEGER DEFAULT 0,
            order_index INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
        )",
        [],
    )?;
    
    // 创建伏笔表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS foreshadows (
            id TEXT PRIMARY KEY,
            book_id TEXT NOT NULL,
            name TEXT NOT NULL,
            bury_chapter_id TEXT,
            bury_chapter_title TEXT,
            bury_content TEXT DEFAULT '',
            reveal_chapter_id TEXT,
            reveal_chapter_title TEXT,
            reveal_content TEXT DEFAULT '',
            completed INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
        )",
        [],
    )?;
    
    // 创建世界观表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS worldviews (
            id TEXT PRIMARY KEY,
            book_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT DEFAULT '',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
        )",
        [],
    )?;
    
    // 创建世界观-章节关联表（带position字段）
    // 注意：worldview_chapters表需要特殊处理，因为原有表可能没有position字段
    // 先尝试DROP再重建（如果表存在的话）
    conn.execute("DROP TABLE IF EXISTS worldview_chapters", [])?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS worldview_chapters (
            worldview_id TEXT NOT NULL,
            chapter_id TEXT NOT NULL,
            position TEXT DEFAULT '',
            PRIMARY KEY (worldview_id, chapter_id),
            FOREIGN KEY (worldview_id) REFERENCES worldviews(id) ON DELETE CASCADE,
            FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
        )",
        [],
    )?;
    
    // 创建设置表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )",
        [],
    )?;
    
    // 创建线索表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS threads (
            id TEXT PRIMARY KEY,
            book_id TEXT NOT NULL,
            name TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT '线索',
            resolved INTEGER DEFAULT 0,
            resolved_chapter_id TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
        )",
        [],
    )?;
    
    // 创建线索节点表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS thread_nodes (
            id TEXT PRIMARY KEY,
            thread_id TEXT NOT NULL,
            chapter_id TEXT,
            chapter_title TEXT,
            content TEXT NOT NULL,
            branch_label TEXT DEFAULT '',
            order_index INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
        )",
        [],
    )?;
    
    println!("数据库初始化完成");
    Ok(())
}

// 获取数据库连接的辅助函数（用于命令模块）
pub fn get_db_path() -> std::path::PathBuf {
    let app_data = dirs::data_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("."))
        .join("writer-cat");
    std::fs::create_dir_all(&app_data).ok();
    app_data.join("writer_cat.db")
}

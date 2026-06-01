// 分离数据库初始化模块
use sqlx::SqlitePool;

// 数据库初始化和迁移
pub async fn init_db(pool: &SqlitePool) -> Result<(), String> {
    // 创建书籍表
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS books (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        "#,
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    // 创建章节表
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS chapters (
            id TEXT PRIMARY KEY,
            book_id TEXT NOT NULL,
            title TEXT NOT NULL,
            order_index INTEGER NOT NULL,
            word_count INTEGER DEFAULT 0,
            status TEXT DEFAULT 'draft',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
        )
        "#,
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    // 创建人物表
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS characters (
            id TEXT PRIMARY KEY,
            book_id TEXT NOT NULL,
            name TEXT NOT NULL,
            nickname TEXT,
            gender TEXT,
            age TEXT,
            appearance TEXT,
            personality TEXT,
            background TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
        )
        "#,
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    // 创建人物关系表
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS relationships (
            id TEXT PRIMARY KEY,
            book_id TEXT NOT NULL,
            char1_id TEXT NOT NULL,
            char2_id TEXT NOT NULL,
            relation_type TEXT NOT NULL,
            description TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
            FOREIGN KEY (char1_id) REFERENCES characters(id) ON DELETE CASCADE,
            FOREIGN KEY (char2_id) REFERENCES characters(id) ON DELETE CASCADE
        )
        "#,
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    // 创建人物时间线表
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS timeline_events (
            id TEXT PRIMARY KEY,
            character_id TEXT NOT NULL,
            chapter_id TEXT,
            event TEXT NOT NULL,
            event_time TEXT,
            order_index INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
            FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL
        )
        "#,
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    // 创建情节表
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS plots (
            id TEXT PRIMARY KEY,
            book_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'active',
            target_word_count INTEGER DEFAULT 3000,
            actual_word_count INTEGER DEFAULT 0,
            chapter_id TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
            FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL
        )
        "#,
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    // 创建情绪标记表
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS emotion_marks (
            id TEXT PRIMARY KEY,
            plot_id TEXT NOT NULL,
            emotion_level INTEGER NOT NULL,
            expected_emotion INTEGER NOT NULL,
            actual_emotion INTEGER NOT NULL,
            position INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (plot_id) REFERENCES plots(id) ON DELETE CASCADE
        )
        "#,
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    // 创建伏笔表
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS foreshadows (
            id TEXT PRIMARY KEY,
            book_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            buried_chapter_id TEXT,
            resolved_chapter_id TEXT,
            status TEXT DEFAULT 'active',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
            FOREIGN KEY (buried_chapter_id) REFERENCES chapters(id) ON DELETE SET NULL,
            FOREIGN KEY (resolved_chapter_id) REFERENCES chapters(id) ON DELETE SET NULL
        )
        "#,
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    // 创建世界观表
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS worldviews (
            id TEXT PRIMARY KEY,
            book_id TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT,
            category TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
        )
        "#,
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    // 创建世界观挂载表
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS worldview_mounts (
            id TEXT PRIMARY KEY,
            worldview_id TEXT NOT NULL,
            chapter_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (worldview_id) REFERENCES worldviews(id) ON DELETE CASCADE,
            FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
        )
        "#,
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    // 创建线索表
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS threads (
            id TEXT PRIMARY KEY,
            book_id TEXT NOT NULL,
            title TEXT NOT NULL,
            thread_type TEXT DEFAULT 'linear',
            status TEXT DEFAULT 'active',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
        )
        "#,
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    // 创建线索节点表
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS thread_nodes (
            id TEXT PRIMARY KEY,
            thread_id TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT,
            chapter_id TEXT,
            parent_node_id TEXT,
            node_type TEXT DEFAULT 'normal',
            order_index INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
            FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL,
            FOREIGN KEY (parent_node_id) REFERENCES thread_nodes(id) ON DELETE SET NULL
        )
        "#,
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    // 创建设置表
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
        "#,
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    // 插入默认设置
    let default_settings = serde_json::json!({
        "theme": "light",
        "device_role": "standalone",
        "sync_enabled": false,
        "ai_provider": "ollama",
        "ollama_url": "http://localhost:11434",
        "ollama_model": "qwen2.5:7b",
        "online_api_key": "",
        "online_api_url": "",
        "auto_save_interval": 500,
        "max_backups": 10,
        "font_size": 16,
        "first_launch": true
    });

    sqlx::query(
        "INSERT OR IGNORE INTO settings (key, value) VALUES ('global', ?)",
    )
    .bind(default_settings.to_string())
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

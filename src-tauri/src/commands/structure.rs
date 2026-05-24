// 结构管理命令（伏笔+世界观）
use crate::db::get_db_path;
use crate::models::structure::{Foreshadow, Worldview};
use rusqlite::{params, Connection};
use tauri::command;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorldviewChapter {
    pub worldview_id: String,
    pub chapter_id: String,
    pub position: String,
}

#[command]
pub fn create_foreshadow(
    book_id: String,
    name: String,
    bury_chapter_id: Option<String>,
    bury_chapter_title: Option<String>,
    bury_content: Option<String>,
) -> Result<Foreshadow, String> {
    let mut foreshadow = Foreshadow::new(book_id, name);
    if let Some(bci) = bury_chapter_id {
        foreshadow.bury_chapter_id = Some(bci);
    }
    if let Some(bct) = bury_chapter_title {
        foreshadow.bury_chapter_title = Some(bct);
    }
    if let Some(bc) = bury_content {
        foreshadow.bury_content = bc;
    }
    
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO foreshadows (id, book_id, name, bury_chapter_id, bury_chapter_title, bury_content, reveal_chapter_id, reveal_chapter_title, reveal_content, completed, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
        params![
            foreshadow.id,
            foreshadow.book_id,
            foreshadow.name,
            foreshadow.bury_chapter_id,
            foreshadow.bury_chapter_title,
            foreshadow.bury_content,
            foreshadow.reveal_chapter_id,
            foreshadow.reveal_chapter_title,
            foreshadow.reveal_content,
            foreshadow.completed as i32,
            foreshadow.created_at,
            foreshadow.updated_at
        ],
    ).map_err(|e| e.to_string())?;
    
    Ok(foreshadow)
}

#[command]
pub fn get_foreshadows(book_id: String) -> Result<Vec<Foreshadow>, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, book_id, name, bury_chapter_id, bury_chapter_title, bury_content, reveal_chapter_id, reveal_chapter_title, reveal_content, completed, created_at, updated_at FROM foreshadows WHERE book_id = ?1 ORDER BY created_at")
        .map_err(|e| e.to_string())?;
    
    let foreshadows = stmt
        .query_map(params![book_id], |row| {
            let completed: i32 = row.get(9)?;
            Ok(Foreshadow {
                id: row.get(0)?,
                book_id: row.get(1)?,
                name: row.get(2)?,
                bury_chapter_id: row.get(3)?,
                bury_chapter_title: row.get(4)?,
                bury_content: row.get(5)?,
                reveal_chapter_id: row.get(6)?,
                reveal_chapter_title: row.get(7)?,
                reveal_content: row.get(8)?,
                completed: completed != 0,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    
    Ok(foreshadows)
}

#[command]
pub fn update_foreshadow(
    id: String,
    name: Option<String>,
    reveal_chapter_id: Option<String>,
    reveal_chapter_title: Option<String>,
    reveal_content: Option<String>,
    completed: Option<bool>,
) -> Result<Foreshadow, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();
    
    // 先获取现有伏笔
    let mut stmt = conn
        .prepare("SELECT id, book_id, name, bury_chapter_id, bury_chapter_title, bury_content, reveal_chapter_id, reveal_chapter_title, reveal_content, completed, created_at, updated_at FROM foreshadows WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    
    let mut foreshadow: Foreshadow = stmt.query_row(params![id], |row| {
        let completed_int: i32 = row.get(9)?;
        Ok(Foreshadow {
            id: row.get(0)?,
            book_id: row.get(1)?,
            name: row.get(2)?,
            bury_chapter_id: row.get(3)?,
            bury_chapter_title: row.get(4)?,
            bury_content: row.get(5)?,
            reveal_chapter_id: row.get(6)?,
            reveal_chapter_title: row.get(7)?,
            reveal_content: row.get(8)?,
            completed: completed_int != 0,
            created_at: row.get(10)?,
            updated_at: row.get(11)?,
        })
    })
    .map_err(|e| e.to_string())?;
    
    // 更新字段
    if let Some(n) = name {
        foreshadow.name = n;
    }
    if let Some(rc) = reveal_chapter_id {
        foreshadow.reveal_chapter_id = Some(rc);
    }
    if let Some(rt) = reveal_chapter_title {
        foreshadow.reveal_chapter_title = Some(rt);
    }
    if let Some(rc) = reveal_content {
        foreshadow.reveal_content = rc;
    }
    if let Some(c) = completed {
        foreshadow.completed = c;
    }
    foreshadow.updated_at = now;
    
    conn.execute(
        "UPDATE foreshadows SET name = ?1, reveal_chapter_id = ?2, reveal_chapter_title = ?3, reveal_content = ?4, completed = ?5, updated_at = ?6 WHERE id = ?7",
        params![
            foreshadow.name,
            foreshadow.reveal_chapter_id,
            foreshadow.reveal_chapter_title,
            foreshadow.reveal_content,
            foreshadow.completed as i32,
            foreshadow.updated_at,
            foreshadow.id
        ],
    )
    .map_err(|e| e.to_string())?;
    
    Ok(foreshadow)
}

#[command]
pub fn delete_foreshadow(id: String) -> Result<(), String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM foreshadows WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// 世界观管理命令
#[command]
pub fn create_worldview(
    book_id: String,
    name: String,
    description: Option<String>,
) -> Result<Worldview, String> {
    let mut worldview = Worldview::new(book_id, name);
    if let Some(d) = description {
        worldview.description = d;
    }
    
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO worldviews (id, book_id, name, description, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![
            worldview.id,
            worldview.book_id,
            worldview.name,
            worldview.description,
            worldview.created_at,
            worldview.updated_at
        ],
    ).map_err(|e| e.to_string())?;
    
    Ok(worldview)
}

#[command]
pub fn get_worldviews(book_id: String) -> Result<Vec<Worldview>, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, book_id, name, description, created_at, updated_at FROM worldviews WHERE book_id = ?1 ORDER BY created_at")
        .map_err(|e| e.to_string())?;
    
    let worldviews = stmt
        .query_map(params![book_id], |row| {
            Ok(Worldview {
                id: row.get(0)?,
                book_id: row.get(1)?,
                name: row.get(2)?,
                description: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    
    Ok(worldviews)
}

#[command]
pub fn get_worldview(id: String) -> Result<Worldview, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, book_id, name, description, created_at, updated_at FROM worldviews WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    
    stmt.query_row(params![id], |row| {
        Ok(Worldview {
            id: row.get(0)?,
            book_id: row.get(1)?,
            name: row.get(2)?,
            description: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    })
    .map_err(|e| e.to_string())
}

#[command]
pub fn update_worldview(
    id: String,
    name: Option<String>,
    description: Option<String>,
) -> Result<Worldview, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();
    
    // 先获取现有世界观
    let mut stmt = conn
        .prepare("SELECT id, book_id, name, description, created_at, updated_at FROM worldviews WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    
    let mut worldview: Worldview = stmt.query_row(params![id], |row| {
        Ok(Worldview {
            id: row.get(0)?,
            book_id: row.get(1)?,
            name: row.get(2)?,
            description: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    })
    .map_err(|e| e.to_string())?;
    
    // 更新字段
    if let Some(n) = name {
        worldview.name = n;
    }
    if let Some(d) = description {
        worldview.description = d;
    }
    worldview.updated_at = now;
    
    conn.execute(
        "UPDATE worldviews SET name = ?1, description = ?2, updated_at = ?3 WHERE id = ?4",
        params![worldview.name, worldview.description, worldview.updated_at, worldview.id],
    )
    .map_err(|e| e.to_string())?;
    
    Ok(worldview)
}

#[command]
pub fn delete_worldview(id: String) -> Result<(), String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM worldviews WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// 世界观-章节关联
#[command]
pub fn attach_worldview_to_chapter(worldview_id: String, chapter_id: String, position: Option<String>) -> Result<(), String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let pos = position.unwrap_or_default();
    
    conn.execute(
        "INSERT OR REPLACE INTO worldview_chapters (worldview_id, chapter_id, position) VALUES (?1, ?2, ?3)",
        params![worldview_id, chapter_id, pos],
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[command]
pub fn detach_worldview_from_chapter(worldview_id: String, chapter_id: String) -> Result<(), String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    conn.execute(
        "DELETE FROM worldview_chapters WHERE worldview_id = ?1 AND chapter_id = ?2",
        params![worldview_id, chapter_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
pub fn get_worldview_chapters(worldview_id: String) -> Result<Vec<WorldviewChapter>, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT worldview_id, chapter_id, position FROM worldview_chapters WHERE worldview_id = ?1")
        .map_err(|e| e.to_string())?;
    
    let chapters = stmt
        .query_map(params![worldview_id], |row| {
            Ok(WorldviewChapter {
                worldview_id: row.get(0)?,
                chapter_id: row.get(1)?,
                position: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    
    Ok(chapters)
}

#[command]
pub fn get_chapter_worldviews(chapter_id: String) -> Result<Vec<Worldview>, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT w.id, w.book_id, w.name, w.description, w.created_at, w.updated_at FROM worldviews w INNER JOIN worldview_chapters wc ON w.id = wc.worldview_id WHERE wc.chapter_id = ?1 ORDER BY w.created_at")
        .map_err(|e| e.to_string())?;
    
    let worldviews = stmt
        .query_map(params![chapter_id], |row| {
            Ok(Worldview {
                id: row.get(0)?,
                book_id: row.get(1)?,
                name: row.get(2)?,
                description: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    
    Ok(worldviews)
}

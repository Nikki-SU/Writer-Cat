// 章节管理命令
use crate::db::get_db_path;
use crate::models::chapter::Chapter;
use rusqlite::{params, Connection};
use tauri::command;
use serde_json;

fn calculate_word_count(text: &str) -> i32 {
    // 简单按字符计数，中文按字符，英文按空格分词
    text.chars().filter(|c| !c.is_whitespace()).count() as i32
}

fn parse_emotion_json(json_str: &str) -> Vec<String> {
    serde_json::from_str(json_str).unwrap_or_default()
}

fn serialize_emotion_json(emotions: &[String]) -> String {
    serde_json::to_string(emotions).unwrap_or_else(|_| "[]".to_string())
}

#[command]
pub fn create_chapter(book_id: String, title: String, order_index: i32) -> Result<Chapter, String> {
    let mut chapter = Chapter::new(book_id, title, order_index);
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    
    let expected_emotion_json = serialize_emotion_json(&chapter.expected_emotion);
    let actual_emotion_json = serialize_emotion_json(&chapter.actual_emotion);
    
    conn.execute(
        "INSERT INTO chapters (id, book_id, title, content, order_index, word_count, target_word_count, expected_emotion, actual_emotion, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        params![
            chapter.id,
            chapter.book_id,
            chapter.title,
            chapter.content,
            chapter.order_index,
            chapter.word_count,
            chapter.target_word_count,
            expected_emotion_json,
            actual_emotion_json,
            chapter.created_at,
            chapter.updated_at
        ],
    ).map_err(|e| e.to_string())?;
    
    Ok(chapter)
}

#[command]
pub fn get_chapters(book_id: String) -> Result<Vec<Chapter>, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, book_id, title, content, order_index, word_count, target_word_count, expected_emotion, actual_emotion, created_at, updated_at FROM chapters WHERE book_id = ?1 ORDER BY order_index")
        .map_err(|e| e.to_string())?;
    
    let chapters = stmt
        .query_map(params![book_id], |row| {
            let expected_emotion_str: String = row.get(7)?;
            let actual_emotion_str: String = row.get(8)?;
            Ok(Chapter {
                id: row.get(0)?,
                book_id: row.get(1)?,
                title: row.get(2)?,
                content: row.get(3)?,
                order_index: row.get(4)?,
                word_count: row.get(5)?,
                target_word_count: row.get(6)?,
                expected_emotion: parse_emotion_json(&expected_emotion_str),
                actual_emotion: parse_emotion_json(&actual_emotion_str),
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    
    Ok(chapters)
}

#[command]
pub fn get_chapter(id: String) -> Result<Chapter, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, book_id, title, content, order_index, word_count, target_word_count, expected_emotion, actual_emotion, created_at, updated_at FROM chapters WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    
    stmt.query_row(params![id], |row| {
        let expected_emotion_str: String = row.get(7)?;
        let actual_emotion_str: String = row.get(8)?;
        Ok(Chapter {
            id: row.get(0)?,
            book_id: row.get(1)?,
            title: row.get(2)?,
            content: row.get(3)?,
            order_index: row.get(4)?,
            word_count: row.get(5)?,
            target_word_count: row.get(6)?,
            expected_emotion: parse_emotion_json(&expected_emotion_str),
            actual_emotion: parse_emotion_json(&actual_emotion_str),
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    })
    .map_err(|e| e.to_string())
}

#[command]
pub fn update_chapter(
    id: String,
    title: Option<String>,
    content: Option<String>,
    order_index: Option<i32>,
    target_word_count: Option<i32>,
    expected_emotion: Option<Vec<String>>,
    actual_emotion: Option<Vec<String>>,
) -> Result<Chapter, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();
    
    // 先获取现有章节
    let mut stmt = conn
        .prepare("SELECT id, book_id, title, content, order_index, word_count, target_word_count, expected_emotion, actual_emotion, created_at, updated_at FROM chapters WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    
    let mut chapter: Chapter = stmt.query_row(params![id], |row| {
        let expected_emotion_str: String = row.get(7)?;
        let actual_emotion_str: String = row.get(8)?;
        Ok(Chapter {
            id: row.get(0)?,
            book_id: row.get(1)?,
            title: row.get(2)?,
            content: row.get(3)?,
            order_index: row.get(4)?,
            word_count: row.get(5)?,
            target_word_count: row.get(6)?,
            expected_emotion: parse_emotion_json(&expected_emotion_str),
            actual_emotion: parse_emotion_json(&actual_emotion_str),
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    })
    .map_err(|e| e.to_string())?;
    
    // 更新传入的非None字段
    if let Some(t) = title {
        chapter.title = t;
    }
    if let Some(c) = content {
        chapter.word_count = calculate_word_count(&c);
        chapter.content = c;
    }
    if let Some(oi) = order_index {
        chapter.order_index = oi;
    }
    if let Some(twc) = target_word_count {
        chapter.target_word_count = twc;
    }
    if let Some(ee) = expected_emotion {
        chapter.expected_emotion = ee;
    }
    if let Some(ae) = actual_emotion {
        chapter.actual_emotion = ae;
    }
    chapter.updated_at = now;
    
    let expected_emotion_json = serialize_emotion_json(&chapter.expected_emotion);
    let actual_emotion_json = serialize_emotion_json(&chapter.actual_emotion);
    
    conn.execute(
        "UPDATE chapters SET title = ?1, content = ?2, order_index = ?3, word_count = ?4, target_word_count = ?5, expected_emotion = ?6, actual_emotion = ?7, updated_at = ?8 WHERE id = ?9",
        params![
            chapter.title,
            chapter.content,
            chapter.order_index,
            chapter.word_count,
            chapter.target_word_count,
            expected_emotion_json,
            actual_emotion_json,
            chapter.updated_at,
            chapter.id
        ],
    )
    .map_err(|e| e.to_string())?;
    
    Ok(chapter)
}

#[command]
pub fn delete_chapter(id: String) -> Result<(), String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM chapters WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// 线索/长伏笔管理命令
use crate::db::get_db_path;
use crate::models::thread::{Thread, ThreadNode};
use rusqlite::{params, Connection};
use tauri::command;

#[command]
pub fn create_thread(book_id: String, name: String, thread_type: String) -> Result<Thread, String> {
    let thread = Thread::new(book_id, name, thread_type);
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO threads (id, book_id, name, type, resolved, resolved_chapter_id, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![
            thread.id,
            thread.book_id,
            thread.name,
            thread.thread_type,
            thread.resolved as i32,
            thread.resolved_chapter_id,
            thread.created_at,
            thread.updated_at
        ],
    ).map_err(|e| e.to_string())?;
    
    Ok(thread)
}

#[command]
pub fn get_threads(book_id: String) -> Result<Vec<Thread>, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, book_id, name, type, resolved, resolved_chapter_id, created_at, updated_at FROM threads WHERE book_id = ?1 ORDER BY created_at")
        .map_err(|e| e.to_string())?;
    
    let threads = stmt
        .query_map(params![book_id], |row| {
            let resolved: i32 = row.get(4)?;
            Ok(Thread {
                id: row.get(0)?,
                book_id: row.get(1)?,
                name: row.get(2)?,
                thread_type: row.get(3)?,
                resolved: resolved != 0,
                resolved_chapter_id: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    
    Ok(threads)
}

#[command]
pub fn get_thread(id: String) -> Result<Thread, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, book_id, name, type, resolved, resolved_chapter_id, created_at, updated_at FROM threads WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    
    stmt.query_row(params![id], |row| {
        let resolved: i32 = row.get(4)?;
        Ok(Thread {
            id: row.get(0)?,
            book_id: row.get(1)?,
            name: row.get(2)?,
            thread_type: row.get(3)?,
            resolved: resolved != 0,
            resolved_chapter_id: row.get(5)?,
            created_at: row.get(6)?,
            updated_at: row.get(7)?,
        })
    })
    .map_err(|e| e.to_string())
}

#[command]
pub fn update_thread(
    id: String,
    name: Option<String>,
    thread_type: Option<String>,
    resolved: Option<bool>,
    resolved_chapter_id: Option<String>,
) -> Result<Thread, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();
    
    // 先获取现有线索
    let mut stmt = conn
        .prepare("SELECT id, book_id, name, type, resolved, resolved_chapter_id, created_at, updated_at FROM threads WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    
    let mut thread: Thread = stmt.query_row(params![id], |row| {
        let resolved_int: i32 = row.get(4)?;
        Ok(Thread {
            id: row.get(0)?,
            book_id: row.get(1)?,
            name: row.get(2)?,
            thread_type: row.get(3)?,
            resolved: resolved_int != 0,
            resolved_chapter_id: row.get(5)?,
            created_at: row.get(6)?,
            updated_at: row.get(7)?,
        })
    })
    .map_err(|e| e.to_string())?;
    
    // 更新字段
    if let Some(n) = name {
        thread.name = n;
    }
    if let Some(tt) = thread_type {
        thread.thread_type = tt;
    }
    if let Some(r) = resolved {
        thread.resolved = r;
    }
    if let Some(rc) = resolved_chapter_id {
        thread.resolved_chapter_id = Some(rc);
    }
    thread.updated_at = now;
    
    conn.execute(
        "UPDATE threads SET name = ?1, type = ?2, resolved = ?3, resolved_chapter_id = ?4, updated_at = ?5 WHERE id = ?6",
        params![
            thread.name,
            thread.thread_type,
            thread.resolved as i32,
            thread.resolved_chapter_id,
            thread.updated_at,
            thread.id
        ],
    )
    .map_err(|e| e.to_string())?;
    
    Ok(thread)
}

#[command]
pub fn delete_thread(id: String) -> Result<(), String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    // 由于使用了ON DELETE CASCADE，关联的节点会自动删除
    conn.execute("DELETE FROM threads WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// 线索节点命令
#[command]
pub fn create_thread_node(thread_id: String, content: String, order_index: i32) -> Result<ThreadNode, String> {
    let mut node = ThreadNode::new(thread_id, content, order_index);
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO thread_nodes (id, thread_id, chapter_id, chapter_title, content, branch_label, order_index, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![
            node.id,
            node.thread_id,
            node.chapter_id,
            node.chapter_title,
            node.content,
            node.branch_label,
            node.order_index,
            node.created_at
        ],
    ).map_err(|e| e.to_string())?;
    
    Ok(node)
}

#[command]
pub fn get_thread_nodes(thread_id: String) -> Result<Vec<ThreadNode>, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, thread_id, chapter_id, chapter_title, content, branch_label, order_index, created_at FROM thread_nodes WHERE thread_id = ?1 ORDER BY order_index")
        .map_err(|e| e.to_string())?;
    
    let nodes = stmt
        .query_map(params![thread_id], |row| {
            Ok(ThreadNode {
                id: row.get(0)?,
                thread_id: row.get(1)?,
                chapter_id: row.get(2)?,
                chapter_title: row.get(3)?,
                content: row.get(4)?,
                branch_label: row.get(5)?,
                order_index: row.get(6)?,
                created_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    
    Ok(nodes)
}

#[command]
pub fn update_thread_node(
    id: String,
    content: Option<String>,
    chapter_id: Option<String>,
    chapter_title: Option<String>,
    branch_label: Option<String>,
) -> Result<ThreadNode, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    
    // 先获取现有节点
    let mut stmt = conn
        .prepare("SELECT id, thread_id, chapter_id, chapter_title, content, branch_label, order_index, created_at FROM thread_nodes WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    
    let mut node: ThreadNode = stmt.query_row(params![id], |row| {
        Ok(ThreadNode {
            id: row.get(0)?,
            thread_id: row.get(1)?,
            chapter_id: row.get(2)?,
            chapter_title: row.get(3)?,
            content: row.get(4)?,
            branch_label: row.get(5)?,
            order_index: row.get(6)?,
            created_at: row.get(7)?,
        })
    })
    .map_err(|e| e.to_string())?;
    
    // 更新字段
    if let Some(c) = content {
        node.content = c;
    }
    if let Some(ci) = chapter_id {
        node.chapter_id = Some(ci);
    }
    if let Some(ct) = chapter_title {
        node.chapter_title = Some(ct);
    }
    if let Some(bl) = branch_label {
        node.branch_label = bl;
    }
    
    conn.execute(
        "UPDATE thread_nodes SET content = ?1, chapter_id = ?2, chapter_title = ?3, branch_label = ?4 WHERE id = ?5",
        params![node.content, node.chapter_id, node.chapter_title, node.branch_label, node.id],
    )
    .map_err(|e| e.to_string())?;
    
    Ok(node)
}

#[command]
pub fn delete_thread_node(id: String) -> Result<(), String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM thread_nodes WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
pub fn reorder_thread_nodes(thread_id: String, node_ids: Vec<String>) -> Result<(), String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    
    for (index, node_id) in node_ids.iter().enumerate() {
        conn.execute(
            "UPDATE thread_nodes SET order_index = ?1 WHERE id = ?2 AND thread_id = ?3",
            params![index as i32, node_id, thread_id],
        )
        .map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

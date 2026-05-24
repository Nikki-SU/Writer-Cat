// 情节管理命令
use crate::db::get_db_path;
use crate::models::plot::PlotItem;
use rusqlite::{params, Connection};
use tauri::command;

#[command]
pub fn create_plot_item(
    chapter_id: String,
    book_id: String,
    content: String,
    order_index: i32,
) -> Result<PlotItem, String> {
    let plot_item = PlotItem::new(chapter_id, book_id, content, order_index);
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO plot_items (id, chapter_id, book_id, content, completed, order_index, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![
            plot_item.id,
            plot_item.chapter_id,
            plot_item.book_id,
            plot_item.content,
            plot_item.completed as i32,
            plot_item.order_index,
            plot_item.created_at
        ],
    ).map_err(|e| e.to_string())?;
    
    Ok(plot_item)
}

#[command]
pub fn get_plot_items(chapter_id: String) -> Result<Vec<PlotItem>, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, chapter_id, book_id, content, completed, order_index, created_at FROM plot_items WHERE chapter_id = ?1 ORDER BY order_index")
        .map_err(|e| e.to_string())?;
    
    let plot_items = stmt
        .query_map(params![chapter_id], |row| {
            let completed: i32 = row.get(4)?;
            Ok(PlotItem {
                id: row.get(0)?,
                chapter_id: row.get(1)?,
                book_id: row.get(2)?,
                content: row.get(3)?,
                completed: completed != 0,
                order_index: row.get(5)?,
                created_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    
    Ok(plot_items)
}

#[command]
pub fn get_all_plot_items(book_id: String) -> Result<Vec<PlotItem>, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, chapter_id, book_id, content, completed, order_index, created_at FROM plot_items WHERE book_id = ?1 ORDER BY chapter_id, order_index")
        .map_err(|e| e.to_string())?;
    
    let plot_items = stmt
        .query_map(params![book_id], |row| {
            let completed: i32 = row.get(4)?;
            Ok(PlotItem {
                id: row.get(0)?,
                chapter_id: row.get(1)?,
                book_id: row.get(2)?,
                content: row.get(3)?,
                completed: completed != 0,
                order_index: row.get(5)?,
                created_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    
    Ok(plot_items)
}

#[command]
pub fn update_plot_item(id: String, content: String, completed: Option<bool>) -> Result<PlotItem, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    
    // 先获取现有情节
    let mut stmt = conn
        .prepare("SELECT id, chapter_id, book_id, content, completed, order_index, created_at FROM plot_items WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    
    let mut plot_item: PlotItem = stmt.query_row(params![id], |row| {
        let completed_int: i32 = row.get(4)?;
        Ok(PlotItem {
            id: row.get(0)?,
            chapter_id: row.get(1)?,
            book_id: row.get(2)?,
            content: row.get(3)?,
            completed: completed_int != 0,
            order_index: row.get(5)?,
            created_at: row.get(6)?,
        })
    })
    .map_err(|e| e.to_string())?;
    
    // 更新字段
    plot_item.content = content;
    if let Some(c) = completed {
        plot_item.completed = c;
    }
    
    conn.execute(
        "UPDATE plot_items SET content = ?1, completed = ?2 WHERE id = ?3",
        params![plot_item.content, plot_item.completed as i32, plot_item.id],
    )
    .map_err(|e| e.to_string())?;
    
    Ok(plot_item)
}

#[command]
pub fn delete_plot_item(id: String) -> Result<(), String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM plot_items WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
pub fn reorder_plot_items(chapter_id: String, item_ids: Vec<String>) -> Result<(), String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    
    for (index, item_id) in item_ids.iter().enumerate() {
        conn.execute(
            "UPDATE plot_items SET order_index = ?1 WHERE id = ?2 AND chapter_id = ?3",
            params![index as i32, item_id, chapter_id],
        )
        .map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

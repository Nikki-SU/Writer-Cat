// 书籍管理命令
use crate::db::get_db_path;
use crate::models::book::Book;
use rusqlite::{params, Connection};
use tauri::command;

#[command]
pub fn create_book(name: String) -> Result<Book, String> {
    let book = Book::new(name);
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO books (id, name, created_at, updated_at, total_words, target_words) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![book.id, book.name, book.created_at, book.updated_at, book.total_words, book.target_words],
    ).map_err(|e| e.to_string())?;
    Ok(book)
}

#[command]
pub fn get_books() -> Result<Vec<Book>, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name, created_at, updated_at, total_words, target_words FROM books ORDER BY updated_at DESC")
        .map_err(|e| e.to_string())?;
    
    let books = stmt
        .query_map([], |row| {
            Ok(Book {
                id: row.get(0)?,
                name: row.get(1)?,
                created_at: row.get(2)?,
                updated_at: row.get(3)?,
                total_words: row.get(4)?,
                target_words: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    
    Ok(books)
}

#[command]
pub fn get_book(id: String) -> Result<Book, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name, created_at, updated_at, total_words, target_words FROM books WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    
    stmt.query_row(params![id], |row| {
        Ok(Book {
            id: row.get(0)?,
            name: row.get(1)?,
            created_at: row.get(2)?,
            updated_at: row.get(3)?,
            total_words: row.get(4)?,
            target_words: row.get(5)?,
        })
    })
    .map_err(|e| e.to_string())
}

#[command]
pub fn update_book(id: String, name: String, total_words: Option<i32>, target_words: Option<i32>) -> Result<Book, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();
    
    // 先获取现有书籍
    let mut stmt = conn
        .prepare("SELECT id, name, created_at, updated_at, total_words, target_words FROM books WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    
    let mut book: Book = stmt.query_row(params![id], |row| {
        Ok(Book {
            id: row.get(0)?,
            name: row.get(1)?,
            created_at: row.get(2)?,
            updated_at: row.get(3)?,
            total_words: row.get(4)?,
            target_words: row.get(5)?,
        })
    })
    .map_err(|e| e.to_string())?;
    
    // 更新字段
    book.name = name;
    if let Some(tw) = total_words {
        book.total_words = tw;
    }
    if let Some(tw) = target_words {
        book.target_words = tw;
    }
    book.updated_at = now;
    
    // 保存更新
    conn.execute(
        "UPDATE books SET name = ?1, total_words = ?2, target_words = ?3, updated_at = ?4 WHERE id = ?5",
        params![book.name, book.total_words, book.target_words, book.updated_at, book.id],
    )
    .map_err(|e| e.to_string())?;
    
    Ok(book)
}

#[command]
pub fn delete_book(id: String) -> Result<(), String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    // 由于使用了ON DELETE CASCADE，外键关联会自动删除
    conn.execute("DELETE FROM books WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

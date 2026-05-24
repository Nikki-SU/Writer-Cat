// 书籍管理命令
use crate::db::get_db_path;
use crate::models::book::Book;
use rusqlite::params;
use tauri::command;
use uuid::Uuid;
use chrono::Utc;

#[command]
pub fn create_book(name: String) -> Result<Book, String> {
    todo!("实现创建书籍")
}

#[command]
pub fn get_books() -> Result<Vec<Book>, String> {
    todo!("实现获取书籍列表")
}

#[command]
pub fn get_book(id: String) -> Result<Book, String> {
    todo!("实现获取单个书籍")
}

#[command]
pub fn update_book(id: String, name: String) -> Result<Book, String> {
    todo!("实现更新书籍")
}

#[command]
pub fn delete_book(id: String) -> Result<(), String> {
    todo!("实现删除书籍")
}

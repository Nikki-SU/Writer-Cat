// 章节管理命令
use crate::models::chapter::Chapter;
use tauri::command;

#[command]
pub fn create_chapter(book_id: String, title: String, order_index: i32) -> Result<Chapter, String> {
    todo!("实现创建章节")
}

#[command]
pub fn get_chapters(book_id: String) -> Result<Vec<Chapter>, String> {
    todo!("实现获取章节列表")
}

#[command]
pub fn get_chapter(id: String) -> Result<Chapter, String> {
    todo!("实现获取单个章节")
}

#[command]
pub fn update_chapter(
    id: String,
    title: Option<String>,
    content: Option<String>,
    word_count: Option<i32>,
) -> Result<Chapter, String> {
    todo!("实现更新章节")
}

#[command]
pub fn delete_chapter(id: String) -> Result<(), String> {
    todo!("实现删除章节")
}

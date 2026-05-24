// 结构管理命令（伏笔+世界观）
use crate::models::structure::{Foreshadow, Worldview};
use tauri::command;

#[command]
pub fn create_foreshadow(
    book_id: String,
    name: String,
    bury_chapter_id: Option<String>,
    bury_chapter_title: Option<String>,
    bury_content: Option<String>,
) -> Result<Foreshadow, String> {
    todo!("实现创建伏笔")
}

#[command]
pub fn get_foreshadows(book_id: String) -> Result<Vec<Foreshadow>, String> {
    todo!("实现获取伏笔列表")
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
    todo!("实现更新伏笔")
}

#[command]
pub fn delete_foreshadow(id: String) -> Result<(), String> {
    todo!("实现删除伏笔")
}

// 世界观管理命令
#[command]
pub fn create_worldview(
    book_id: String,
    name: String,
    description: Option<String>,
) -> Result<Worldview, String> {
    todo!("实现创建世界观条目")
}

#[command]
pub fn get_worldviews(book_id: String) -> Result<Vec<Worldview>, String> {
    todo!("实现获取世界观列表")
}

#[command]
pub fn get_worldview(id: String) -> Result<Worldview, String> {
    todo!("实现获取单个世界观")
}

#[command]
pub fn update_worldview(
    id: String,
    name: Option<String>,
    description: Option<String>,
) -> Result<Worldview, String> {
    todo!("实现更新世界观")
}

#[command]
pub fn delete_worldview(id: String) -> Result<(), String> {
    todo!("实现删除世界观")
}

// 世界观-章节关联
#[command]
pub fn attach_worldview_to_chapter(worldview_id: String, chapter_id: String) -> Result<(), String> {
    todo!("实现世界观挂载到章节")
}

#[command]
pub fn detach_worldview_from_chapter(worldview_id: String, chapter_id: String) -> Result<(), String> {
    todo!("实现从章节卸载世界观")
}

#[command]
pub fn get_worldview_chapters(worldview_id: String) -> Result<Vec<String>, String> {
    todo!("实现获取世界观挂载的章节列表")
}

#[command]
pub fn get_chapter_worldviews(chapter_id: String) -> Result<Vec<Worldview>, String> {
    todo!("实现获取章节挂载的世界观列表")
}

// 情节管理命令
use crate::models::plot::PlotItem;
use tauri::command;

#[command]
pub fn create_plot_item(
    chapter_id: String,
    book_id: String,
    content: String,
    order_index: i32,
) -> Result<PlotItem, String> {
    todo!("实现创建情节")
}

#[command]
pub fn get_plot_items(chapter_id: String) -> Result<Vec<PlotItem>, String> {
    todo!("实现获取章节情节列表")
}

#[command]
pub fn get_all_plot_items(book_id: String) -> Result<Vec<PlotItem>, String> {
    todo!("实现获取书籍所有情节")
}

#[command]
pub fn update_plot_item(id: String, content: String, completed: Option<bool>) -> Result<PlotItem, String> {
    todo!("实现更新情节")
}

#[command]
pub fn delete_plot_item(id: String) -> Result<(), String> {
    todo!("实现删除情节")
}

#[command]
pub fn reorder_plot_items(chapter_id: String, item_ids: Vec<String>) -> Result<(), String> {
    todo!("实现重排情节顺序")
}

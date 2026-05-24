// 情节数据模型
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlotItem {
    pub id: String,
    pub chapter_id: String,
    pub book_id: String,
    pub content: String,
    pub completed: bool,
    pub order_index: i32,
    pub created_at: String,
}

impl PlotItem {
    pub fn new(
        chapter_id: String,
        book_id: String,
        content: String,
        order_index: i32,
    ) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            chapter_id,
            book_id,
            content,
            completed: false,
            order_index,
            created_at: chrono::Utc::now().to_rfc3339(),
        }
    }
}

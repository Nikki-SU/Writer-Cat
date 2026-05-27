// 章节模型
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Chapter {
    pub id: String,
    pub book_id: String,
    pub title: String,
    pub order_index: i32,
    pub word_count: i32,
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateChapter {
    pub book_id: String,
    pub title: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateChapter {
    pub title: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReorderChapters {
    pub book_id: String,
    pub chapter_orders: Vec<ChapterOrder>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChapterOrder {
    pub id: String,
    pub order_index: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Backup {
    pub path: String,
    pub created_at: String,
    pub size: u64,
}

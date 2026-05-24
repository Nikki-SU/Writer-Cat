// 线索/长伏笔数据模型
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Thread {
    pub id: String,
    pub book_id: String,
    pub name: String,
    pub thread_type: String,  // "线索" | "长伏笔"  (Rust字段名用thread_type避免与type关键字冲突)
    pub resolved: bool,
    pub resolved_chapter_id: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

impl Thread {
    pub fn new(book_id: String, name: String, thread_type: String) -> Self {
        let now = chrono::Utc::now().to_rfc3339();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            book_id,
            name,
            thread_type,
            resolved: false,
            resolved_chapter_id: None,
            created_at: now.clone(),
            updated_at: now,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreadNode {
    pub id: String,
    pub thread_id: String,
    pub chapter_id: Option<String>,
    pub chapter_title: Option<String>,
    pub content: String,
    pub branch_label: String,
    pub order_index: i32,
    pub created_at: String,
}

impl ThreadNode {
    pub fn new(thread_id: String, content: String, order_index: i32) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            thread_id,
            chapter_id: None,
            chapter_title: None,
            content,
            branch_label: String::new(),
            order_index,
            created_at: chrono::Utc::now().to_rfc3339(),
        }
    }
}

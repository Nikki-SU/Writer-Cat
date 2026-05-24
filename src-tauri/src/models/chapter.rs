// 章节数据模型
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Chapter {
    pub id: String,
    pub book_id: String,
    pub title: String,
    pub content: String,
    pub order_index: i32,
    pub word_count: i32,
    pub target_word_count: i32,
    pub expected_emotion: Vec<String>, // 情绪颜色数组，最多3个
    pub actual_emotion: Vec<String>,
    pub created_at: String,
    pub updated_at: String,
}

impl Chapter {
    pub fn new(book_id: String, title: String, order_index: i32) -> Self {
        let now = chrono::Utc::now().to_rfc3339();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            book_id,
            title,
            content: String::new(),
            order_index,
            word_count: 0,
            target_word_count: 3000,
            expected_emotion: vec![],
            actual_emotion: vec![],
            created_at: now.clone(),
            updated_at: now,
        }
    }
}

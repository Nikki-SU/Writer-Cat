// 书籍数据模型
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Book {
    pub id: String,
    pub name: String,
    pub created_at: String,
    pub updated_at: String,
    pub total_words: i32,
    pub target_words: i32,
}

impl Book {
    pub fn new(name: String) -> Self {
        let now = chrono::Utc::now().to_rfc3339();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            created_at: now.clone(),
            updated_at: now,
            total_words: 0,
            target_words: 3000,
        }
    }
}

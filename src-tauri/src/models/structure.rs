// 结构数据模型（伏笔+世界观）
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Foreshadow {
    pub id: String,
    pub book_id: String,
    pub name: String,
    pub bury_chapter_id: Option<String>,
    pub bury_chapter_title: Option<String>,
    pub bury_content: String,
    pub reveal_chapter_id: Option<String>,
    pub reveal_chapter_title: Option<String>,
    pub reveal_content: String,
    pub completed: bool,
    pub created_at: String,
    pub updated_at: String,
}

impl Foreshadow {
    pub fn new(book_id: String, name: String) -> Self {
        let now = chrono::Utc::now().to_rfc3339();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            book_id,
            name,
            bury_chapter_id: None,
            bury_chapter_title: None,
            bury_content: String::new(),
            reveal_chapter_id: None,
            reveal_chapter_title: None,
            reveal_content: String::new(),
            completed: false,
            created_at: now.clone(),
            updated_at: now,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Worldview {
    pub id: String,
    pub book_id: String,
    pub name: String,
    pub description: String,
    pub created_at: String,
    pub updated_at: String,
}

impl Worldview {
    pub fn new(book_id: String, name: String) -> Self {
        let now = chrono::Utc::now().to_rfc3339();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            book_id,
            name,
            description: String::new(),
            created_at: now.clone(),
            updated_at: now,
        }
    }
}

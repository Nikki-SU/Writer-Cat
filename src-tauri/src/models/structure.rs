// fix: 伏笔和世界观模型
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Foreshadow {
    pub id: String,
    pub book_id: String,
    pub title: String,
    pub description: Option<String>,
    pub buried_chapter_id: Option<String>,
    pub resolved_chapter_id: Option<String>,
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateForeshadow {
    pub book_id: String,
    pub title: String,
    pub description: Option<String>,
    pub buried_chapter_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateForeshadow {
    pub title: Option<String>,
    pub description: Option<String>,
    pub buried_chapter_id: Option<String>,
    pub resolved_chapter_id: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Worldview {
    pub id: String,
    pub book_id: String,
    pub title: String,
    pub content: Option<String>,
    pub category: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateWorldview {
    pub book_id: String,
    pub title: String,
    pub content: Option<String>,
    pub category: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateWorldview {
    pub title: Option<String>,
    pub content: Option<String>,
    pub category: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorldviewMount {
    pub id: String,
    pub worldview_id: String,
    pub chapter_id: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MountWorldview {
    pub worldview_id: String,
    pub chapter_id: String,
}

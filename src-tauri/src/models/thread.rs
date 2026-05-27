// fix: 线索和长伏笔模型
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Thread {
    pub id: String,
    pub book_id: String,
    pub title: String,
    pub thread_type: String,
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateThread {
    pub book_id: String,
    pub title: String,
    pub thread_type: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateThread {
    pub title: Option<String>,
    pub thread_type: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreadNode {
    pub id: String,
    pub thread_id: String,
    pub title: String,
    pub content: Option<String>,
    pub chapter_id: Option<String>,
    pub parent_node_id: Option<String>,
    pub node_type: String,
    pub order_index: i32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AddThreadNode {
    pub thread_id: String,
    pub title: String,
    pub content: Option<String>,
    pub chapter_id: Option<String>,
    pub parent_node_id: Option<String>,
    pub node_type: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateThreadNode {
    pub title: Option<String>,
    pub content: Option<String>,
    pub chapter_id: Option<String>,
    pub parent_node_id: Option<String>,
    pub node_type: Option<String>,
    pub order_index: Option<i32>,
}

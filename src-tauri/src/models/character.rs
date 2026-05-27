// fix: 人物模型
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Character {
    pub id: String,
    pub book_id: String,
    pub name: String,
    pub nickname: Option<String>,
    pub gender: Option<String>,
    pub age: Option<String>,
    pub appearance: Option<String>,
    pub personality: Option<String>,
    pub background: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateCharacter {
    pub book_id: String,
    pub name: String,
    pub nickname: Option<String>,
    pub gender: Option<String>,
    pub age: Option<String>,
    pub appearance: Option<String>,
    pub personality: Option<String>,
    pub background: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateCharacter {
    pub name: Option<String>,
    pub nickname: Option<String>,
    pub gender: Option<String>,
    pub age: Option<String>,
    pub appearance: Option<String>,
    pub personality: Option<String>,
    pub background: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Relationship {
    pub id: String,
    pub book_id: String,
    pub char1_id: String,
    pub char2_id: String,
    pub relation_type: String,
    pub description: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AddRelationship {
    pub book_id: String,
    pub char1_id: String,
    pub char2_id: String,
    pub relation_type: String,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineEvent {
    pub id: String,
    pub character_id: String,
    pub chapter_id: Option<String>,
    pub event: String,
    pub event_time: Option<String>,
    pub order_index: i32,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AddTimelineEvent {
    pub character_id: String,
    pub chapter_id: Option<String>,
    pub event: String,
    pub event_time: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateTimelineEvent {
    pub event: Option<String>,
    pub event_time: Option<String>,
    pub chapter_id: Option<String>,
}

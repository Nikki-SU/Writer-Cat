// 人物数据模型
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Character {
    pub id: String,
    pub book_id: String,
    pub name: String,
    pub avatar: String,
    pub gender: String,
    pub age: i32,
    pub intro: String,
    pub personality: String,
    pub appearance: String,
    pub created_at: String,
    pub updated_at: String,
}

impl Character {
    pub fn new(book_id: String, name: String) -> Self {
        let now = chrono::Utc::now().to_rfc3339();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            book_id,
            name,
            avatar: String::new(),
            gender: String::new(),
            age: 0,
            intro: String::new(),
            personality: String::new(),
            appearance: String::new(),
            created_at: now.clone(),
            updated_at: now,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CharacterRelation {
    pub id: String,
    pub book_id: String,
    pub character_id: String,
    pub target_character_id: String,
    pub relation_type: String,
    pub start_chapter: i32,
    pub end_chapter: i32,
    pub created_at: String,
}

impl CharacterRelation {
    pub fn new(
        book_id: String,
        character_id: String,
        target_character_id: String,
        relation_type: String,
    ) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            book_id,
            character_id,
            target_character_id,
            relation_type,
            start_chapter: 1,
            end_chapter: 0, // 0表示全书
            created_at: chrono::Utc::now().to_rfc3339(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CharacterTimeline {
    pub id: String,
    pub character_id: String,
    pub chapter_id: String,
    pub chapter_title: String,
    pub event: String,
    pub personality_change: String,
    pub created_at: String,
}

impl CharacterTimeline {
    pub fn new(
        character_id: String,
        chapter_id: String,
        chapter_title: String,
        event: String,
    ) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            character_id,
            chapter_id,
            chapter_title,
            event,
            personality_change: String::new(),
            created_at: chrono::Utc::now().to_rfc3339(),
        }
    }
}

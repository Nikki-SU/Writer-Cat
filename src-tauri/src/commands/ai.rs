// AI集成命令
use serde::{Deserialize, Serialize};
use tauri::command;

#[derive(Debug, Serialize, Deserialize)]
pub struct SpellingError {
    pub original: String,
    pub corrected: String,
    pub position: i32,
    pub line: i32,
    pub context: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CharacterMatch {
    pub name: String,
    pub start_pos: i32,
    pub end_pos: i32,
    pub chapter_count: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TimelineEvent {
    pub chapter_id: String,
    pub chapter_title: String,
    pub event: String,
    pub personality_change: Option<String>,
}

#[command]
pub fn check_spelling(text: String) -> Result<Vec<SpellingError>, String> {
    // TODO: 集成Ollama或在线API进行错别字检查
    todo!("实现AI错别字检查")
}

#[command]
pub fn detect_characters(text: String, known_characters: Vec<String>) -> Result<Vec<CharacterMatch>, String> {
    // TODO: 集成Ollama或在线API进行人物识别
    todo!("实现AI人物识别")
}

#[command]
pub fn summarize_text(text: String, max_length: Option<i32>) -> Result<String, String> {
    // TODO: 集成Ollama或在线API进行文本概括
    todo!("实现AI文本概括")
}

#[command]
pub fn generate_timeline(
    character_name: String,
    book_id: String,
    all_chapters: Option<bool>,
    current_chapter_id: Option<String>,
) -> Result<Vec<TimelineEvent>, String> {
    // TODO: 集成Ollama或在线API生成人物时间线
    todo!("实现AI生成人物时间线")
}

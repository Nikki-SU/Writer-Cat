// 情节和情绪模型
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Plot {
    pub id: String,
    pub book_id: String,
    pub title: String,
    pub description: Option<String>,
    pub status: String,
    pub target_word_count: i32,
    pub actual_word_count: i32,
    pub chapter_id: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreatePlot {
    pub book_id: String,
    pub title: String,
    pub description: Option<String>,
    pub target_word_count: Option<i32>,
    pub chapter_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdatePlot {
    pub title: Option<String>,
    pub description: Option<String>,
    pub status: Option<String>,
    pub target_word_count: Option<i32>,
    pub actual_word_count: Option<i32>,
    pub chapter_id: Option<String>,
}

/// 情绪标记 - 用于情节的情绪可视化
/// emotion_level: 0-100 位置
/// expected_emotion: 预期情绪 1-5
/// actual_emotion: 实际情绪 1-5
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmotionMark {
    pub id: String,
    pub plot_id: String,
    pub emotion_level: i32,
    pub expected_emotion: i32,
    pub actual_emotion: i32,
    pub position: i32,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateEmotion {
    pub expected_emotion: Option<i32>,
    pub actual_emotion: Option<i32>,
}

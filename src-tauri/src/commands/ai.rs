// AI集成命令
use serde::{Deserialize, Serialize};
use tauri::command;
use crate::db::get_db_path;
use rusqlite::{params, Connection};

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

#[derive(Debug, Serialize, Deserialize)]
pub struct Conflict {
    pub content: String,
    pub conflict_with: String,
    pub position: i32,
    pub line: i32,
    pub conflict_type: String,
}

fn get_ai_settings() -> Result<(String, String, String), String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    
    let mut ai_provider = "ollama".to_string();
    let mut ollama_url = "http://localhost:11434".to_string();
    let mut ollama_model = "qwen2.5:7b".to_string();
    
    let mut stmt = conn
        .prepare("SELECT key, value FROM settings WHERE key IN ('ai_provider', 'ollama_url', 'ollama_model')")
        .map_err(|e| e.to_string())?;
    
    let rows = stmt
        .query_map([], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        })
        .map_err(|e| e.to_string())?;
    
    for row in rows {
        if let Ok((key, value)) = row {
            match key.as_str() {
                "ai_provider" => ai_provider = value,
                "ollama_url" => ollama_url = value,
                "ollama_model" => ollama_model = value,
                _ => {}
            }
        }
    }
    
    Ok((ai_provider, ollama_url, ollama_model))
}

async fn call_ollama(url: &str, model: &str, prompt: &str) -> Result<String, String> {
    let client = reqwest::Client::new();
    
    #[derive(Serialize)]
    struct OllamaRequest<'a> {
        model: &'a str,
        prompt: &'a str,
        stream: bool,
    }
    
    let response = client
        .post(format!("{}/api/generate", url))
        .json(&OllamaRequest {
            model,
            prompt,
            stream: false,
        })
        .timeout(std::time::Duration::from_secs(60))
        .send()
        .await
        .map_err(|e| format!("连接 Ollama 失败: {}. 请确保 Ollama 已启动并运行在 {}", e, url))?;
    
    #[derive(Deserialize)]
    struct OllamaResponse {
        response: String,
    }
    
    let ollama_resp: OllamaResponse = response
        .json()
        .await
        .map_err(|e| format!("解析 Ollama 响应失败: {}", e))?;
    
    Ok(ollama_resp.response)
}

#[command]
pub async fn check_spelling(text: String) -> Result<Vec<SpellingError>, String> {
    let (ai_provider, ollama_url, ollama_model) = get_ai_settings()?;
    
    if ai_provider != "ollama" {
        return Err("目前只支持 Ollama 进行错别字检查".to_string());
    }
    
    let prompt = format!(
        r#"你是一个中文错别字检查专家。请检查以下文本中的错别字，返回JSON数组格式的结果。

要求：
1. 只返回JSON数组，不要有其他内容
2. 每个错误包含：original（原字）, corrected（正字）, position（位置索引）, line（行号）, context（上下文，20字以内）
3. 如果没有错误，返回空数组 []

文本：
{}"#,
        text
    );
    
    let response = call_ollama(&ollama_url, &ollama_model, &prompt).await?;
    
    // 尝试解析JSON
    serde_json::from_str(&response).map_err(|e| format!("AI返回格式错误: {}，原始内容: {}", e, response))
}

#[command]
pub async fn detect_characters(text: String, known_characters: Vec<String>) -> Result<Vec<CharacterMatch>, String> {
    let (ai_provider, ollama_url, ollama_model) = get_ai_settings()?;
    
    if ai_provider != "ollama" {
        return Err("目前只支持 Ollama 进行人物识别".to_string());
    }
    
    let characters_str = if known_characters.is_empty() {
        "无".to_string()
    } else {
        known_characters.join(", ")
    };
    
    let prompt = format!(
        r#"你是一个小说人物识别专家。请在以下文本中识别人物名称。

已知人物：{}
文本：
{}

要求：
1. 只返回JSON数组，不要有其他内容
2. 每个匹配包含：name（人物名）, start_pos（开始位置）, end_pos（结束位置）, chapter_count（出现次数，默认为1）
3. 如果没有识别到人物，返回空数组 []"#,
        characters_str, text
    );
    
    let response = call_ollama(&ollama_url, &ollama_model, &prompt).await?;
    
    serde_json::from_str(&response).map_err(|e| format!("AI返回格式错误: {}，原始内容: {}", e, response))
}

#[command]
pub async fn summarize_text(text: String, max_length: Option<i32>) -> Result<String, String> {
    let (ai_provider, ollama_url, ollama_model) = get_ai_settings()?;
    
    if ai_provider != "ollama" {
        return Err("目前只支持 Ollama 进行文本概括".to_string());
    }
    
    let length_constraint = max_length.unwrap_or(200);
    
    let prompt = format!(
        r#"请用{}字以内概括以下文本的核心内容：

{}"#,
        length_constraint, text
    );
    
    call_ollama(&ollama_url, &ollama_model, &prompt).await
}

#[command]
pub async fn generate_timeline(
    character_name: String,
    book_id: String,
    all_chapters: Option<bool>,
    current_chapter_id: Option<String>,
) -> Result<Vec<TimelineEvent>, String> {
    let (ai_provider, ollama_url, ollama_model) = get_ai_settings()?;
    
    if ai_provider != "ollama" {
        return Err("目前只支持 Ollama 生成时间线".to_string());
    }
    
    // 获取章节内容用于生成时间线
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    
    let query = if all_chapters.unwrap_or(false) {
        format!(
            "SELECT id, title, content FROM chapters WHERE book_id = '{}' ORDER BY order_index",
            book_id
        )
    } else if let Some(cid) = &current_chapter_id {
        format!(
            "SELECT id, title, content FROM chapters WHERE book_id = '{}' AND order_index <= (SELECT order_index FROM chapters WHERE id = '{}') ORDER BY order_index",
            book_id, cid
        )
    } else {
        return Err("请提供 current_chapter_id 或设置 all_chapters=true".to_string());
    };
    
    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;
    let chapters: Vec<(String, String, String)> = stmt
        .query_map([], |row| {
            Ok((row.get(0)?, row.get(1)?, row.get(2)?))
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    
    if chapters.is_empty() {
        return Ok(vec![]);
    }
    
    let mut chapter_texts = String::new();
    for (i, (id, title, content)) in chapters.iter().enumerate() {
        chapter_texts.push_str(&format!("章节{}【{}】：\n{}\n\n", i + 1, title, &content[..content.len().min(500)]));
    }
    
    let prompt = format!(
        r#"请分析以下小说文本，为人物"{}"生成时间线事件。

要求：
1. 只返回JSON数组，不要有其他内容
2. 每个事件包含：chapter_id（章节ID）, chapter_title（章节标题）, event（事件描述）, personality_change（性格变化，可选）
3. 识别关键事件，如相遇、重要决定、关系变化等

文本：
{}"#,
        character_name, chapter_texts
    );
    
    let response = call_ollama(&ollama_url, &ollama_model, &prompt).await?;
    
    // 解析响应并映射章节ID
    let events: Vec<TimelineEvent> = serde_json::from_str(&response)
        .map_err(|e| format!("AI返回格式错误: {}，原始内容: {}", e, response))?;
    
    // 映射章节标题到ID
    let events: Vec<TimelineEvent> = events
        .into_iter()
        .map(|mut e| {
            // 尝试从章节标题匹配ID
            if e.chapter_id.is_empty() {
                for (id, title, _) in &chapters {
                    if title.contains(&e.chapter_title) {
                        e.chapter_id = id.clone();
                        break;
                    }
                }
            }
            e
        })
        .collect();
    
    Ok(events)
}

#[command]
pub async fn check_worldview_conflict(
    text: String,
    worldviews: Vec<String>,
) -> Result<Vec<Conflict>, String> {
    let (ai_provider, ollama_url, ollama_model) = get_ai_settings()?;
    
    if ai_provider != "ollama" {
        return Err("目前只支持 Ollama 进行世界观冲突检查".to_string());
    }
    
    if worldviews.is_empty() {
        return Ok(vec![]);
    }
    
    let worldviews_str = worldviews.join("\n");
    
    let prompt = format!(
        r#"你是一个小说一致性检查专家。请检查以下文本是否与设定的世界观冲突。

设定世界观：
{}

待检查文本：
{}

要求：
1. 只返回JSON数组，不要有其他内容
2. 每个冲突包含：content（冲突的原文）, conflict_with（与什么冲突）, position（位置索引）, line（行号）, conflict_type（固定为"worldview"）
3. 如果没有冲突，返回空数组 []
4. 仔细对比文本与世界观设定，检测任何不一致之处"#,
        worldviews_str, text
    );
    
    let response = call_ollama(&ollama_url, &ollama_model, &prompt).await?;
    
    serde_json::from_str(&response).map_err(|e| format!("AI返回格式错误: {}，原始内容: {}", e, response))
}

#[command]
pub async fn check_character_conflict(
    text: String,
    characters: Vec<String>,
) -> Result<Vec<Conflict>, String> {
    let (ai_provider, ollama_url, ollama_model) = get_ai_settings()?;
    
    if ai_provider != "ollama" {
        return Err("目前只支持 Ollama 进行人物冲突检查".to_string());
    }
    
    if characters.is_empty() {
        return Ok(vec![]);
    }
    
    let characters_str = characters.join("\n");
    
    let prompt = format!(
        r#"你是一个小说一致性检查专家。请检查以下文本是否与人物设定冲突（如人物行为、性格、关系等不一致）。

人物设定：
{}

待检查文本：
{}

要求：
1. 只返回JSON数组，不要有其他内容
2. 每个冲突包含：content（冲突的原文）, conflict_with（与什么冲突）, position（位置索引）, line（行号）, conflict_type（固定为"character"）
3. 如果没有冲突，返回空数组 []
4. 仔细检查人物行为是否符合其性格设定"#,
        characters_str, text
    );
    
    let response = call_ollama(&ollama_url, &ollama_model, &prompt).await?;
    
    serde_json::from_str(&response).map_err(|e| format!("AI返回格式错误: {}，原始内容: {}", e, response))
}

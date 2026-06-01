// AI 检查和提取命令
use serde::{Deserialize, Serialize};
use serde_json::json;
use crate::AppState;
use tauri::State;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TextCheckResult {
    pub typos: Vec<TypoIssue>,
    pub worldview_conflicts: Vec<WorldviewConflict>,
    pub character_conflicts: Vec<CharacterConflict>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TypoIssue {
    pub text: String,
    pub position: i32,
    pub suggestion: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorldviewConflict {
    pub text: String,
    pub position: i32,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CharacterConflict {
    pub text: String,
    pub position: i32,
    pub character_name: String,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtractResult {
    pub characters: Vec<ExtractedCharacter>,
    pub timeline: Vec<TimelineItem>,
    pub foreshadows: Vec<String>,
    pub worldviews: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtractedCharacter {
    pub name: String,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineItem {
    pub event: String,
    pub chapter: Option<String>,
}

fn get_ollama_model(state: &State<'_, AppState>) -> String {
    sqlx::query_as::<_, (String,)>("SELECT value FROM settings WHERE key = 'global'")
        .fetch_optional(&state.db)
        .ok()
        .flatten()
        .and_then(|(value,)| {
            serde_json::from_str::<serde_json::Value>(&value).ok()
        })
        .and_then(|v| v.get("ollama_model"))
        .and_then(|m| m.as_str())
        .map(String::from)
        .unwrap_or_else(|| "qwen2.5:7b".to_string())
}

fn get_ollama_url(state: &State<'_, AppState>) -> String {
    sqlx::query_as::<_, (String,)>("SELECT value FROM settings WHERE key = 'global'")
        .fetch_optional(&state.db)
        .ok()
        .flatten()
        .and_then(|(value,)| {
            serde_json::from_str::<serde_json::Value>(&value).ok()
        })
        .and_then(|v| v.get("ollama_url"))
        .and_then(|m| m.as_str())
        .map(String::from)
        .unwrap_or_else(|| "http://localhost:11434".to_string())
}

#[tauri::command]
pub async fn check_text(
    state: State<'_, AppState>,
    text: String,
    _book_id: String,
) -> Result<TextCheckResult, String> {
    let status = crate::commands::ollama::check_ollama_status().await?;

    if !status.installed || !status.running {
        return Err("Ollama 未安装或未运行，请先安装 Ollama".to_string());
    }

    let model = get_ollama_model(&state);
    let ollama_url = get_ollama_url(&state);
    let client = reqwest::Client::new();
    let prompt = format!(
        r#"你是一个专业的网文写作助手。请检查以下文本中的问题：

1. 错别字：用❌标记
2. 世界观冲突（与设定不符的地方）：用🌍标记
3. 人设冲突（与人物设定不符的地方）：用👤标记

只返回 JSON 格式的结果，不要有其他内容：
{{
    "typos": [{{"text": "错字", "position": 10, "suggestion": "正确字"}}],
    "worldview_conflicts": [{{"text": "冲突文本", "position": 50, "description": "冲突描述"}}],
    "character_conflicts": [{{"text": "冲突文本", "position": 100, "character_name": "人物名", "description": "冲突描述"}}]
}}

待检查文本：
{}"#,
        text
    );

    let resp = client.post(format!("{}/api/generate", ollama_url))
        .json(&json!({
            "model": model,
            "prompt": prompt,
            "stream": false,
            "options": { "temperature": 0.1 }
        }))
        .timeout(std::time::Duration::from_secs(30))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let data: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;
    let response = data.get("response")
        .and_then(|r| r.as_str())
        .unwrap_or("{}");

    serde_json::from_str(response).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn extract_entities(
    state: State<'_, AppState>,
    text: String,
    _book_id: String,
) -> Result<ExtractResult, String> {
    let status = crate::commands::ollama::check_ollama_status().await?;

    if !status.installed || !status.running {
        return Err("Ollama 未安装或未运行，请先安装 Ollama".to_string());
    }

    let model = get_ollama_model(&state);
    let ollama_url = get_ollama_url(&state);
    let client = reqwest::Client::new();
    let prompt = format!(
        r#"你是一个专业的网文写作助手。请从以下文本中提取信息：

1. 人物：出现的角色姓名和简短描述
2. 大事记：重要事件和发生的章节
3. 伏笔：埋下的伏笔线索
4. 世界观：涉及的世界观设定

只返回 JSON 格式的结果：
{{
    "characters": [{{"name": "人物名", "description": "简短描述"}}],
    "timeline": [{{"event": "事件", "chapter": "章节名"}}],
    "foreshadows": ["伏笔1", "伏笔2"],
    "worldviews": ["世界观1", "世界观2"]
}}

待分析文本：
{}"#,
        text
    );

    let resp = client.post(format!("{}/api/generate", ollama_url))
        .json(&json!({
            "model": model,
            "prompt": prompt,
            "stream": false,
            "options": { "temperature": 0.3 }
        }))
        .timeout(std::time::Duration::from_secs(30))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let data: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;
    let response = data.get("response")
        .and_then(|r| r.as_str())
        .unwrap_or("{}");

    serde_json::from_str(response).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn generate_text(
    state: State<'_, AppState>,
    prompt: String,
    context: Option<String>,
) -> Result<String, String> {
    let status = crate::commands::ollama::check_ollama_status().await?;

    if !status.installed || !status.running {
        return Err("Ollama 未安装或未运行，请先安装 Ollama".to_string());
    }

    let model = get_ollama_model(&state);
    let ollama_url = get_ollama_url(&state);
    let client = reqwest::Client::new();
    let full_prompt = if let Some(ctx) = context {
        format!("上下文：{}\n\n请继续：{}", ctx, prompt)
    } else {
        prompt
    };

    let resp = client.post(format!("{}/api/generate", ollama_url))
        .json(&json!({
            "model": model,
            "prompt": full_prompt,
            "stream": false,
            "options": { "temperature": 0.7, "num_predict": 500 }
        }))
        .timeout(std::time::Duration::from_secs(60))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let data: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;
    let response = data.get("response")
        .and_then(|r| r.as_str())
        .unwrap_or("")
        .to_string();

    Ok(response)
}

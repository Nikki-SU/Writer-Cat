// fix: 情节相关命令 - CRUD + 情绪标记
use crate::models::*;
use crate::AppState;
use tauri::State;
use uuid::Uuid;
use chrono::Utc;

#[tauri::command]
pub async fn get_plots(
    state: State<'_, AppState>,
    book_id: String,
) -> Result<Vec<Plot>, String> {
    let rows = sqlx::query_as::<_, (String, String, String, Option<String>, String, i32, i32, Option<String>, String, String)>(
        "SELECT id, book_id, title, description, status, target_word_count, actual_word_count, chapter_id, created_at, updated_at FROM plots WHERE book_id = ? ORDER BY created_at"
    )
    .bind(&book_id)
    .fetch_all(&*state.db.lock().unwrap())
    .await
    .map_err(|e| e.to_string())?;

    Ok(rows
        .into_iter()
        .map(|(id, book_id, title, description, status, target_word_count, actual_word_count, chapter_id, created_at, updated_at)| Plot {
            id, book_id, title, description, status, target_word_count, actual_word_count, chapter_id, created_at, updated_at,
        })
        .collect())
}

#[tauri::command]
pub async fn create_plot(
    state: State<'_, AppState>,
    data: CreatePlot,
) -> Result<Plot, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    let target_word_count = data.target_word_count.unwrap_or(3000);

    sqlx::query(
        "INSERT INTO plots (id, book_id, title, description, status, target_word_count, actual_word_count, chapter_id, created_at, updated_at) VALUES (?, ?, ?, ?, 'active', ?, 0, ?, ?, ?)"
    )
    .bind(&id)
    .bind(&data.book_id)
    .bind(&data.title)
    .bind(&data.description)
    .bind(target_word_count)
    .bind(&data.chapter_id)
    .bind(&now)
    .bind(&now)
    .execute(&*state.db.lock().unwrap())
    .await
    .map_err(|e| e.to_string())?;

    Ok(Plot {
        id,
        book_id: data.book_id,
        title: data.title,
        description: data.description,
        status: "active".to_string(),
        target_word_count,
        actual_word_count: 0,
        chapter_id: data.chapter_id,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub async fn update_plot(
    state: State<'_, AppState>,
    id: String,
    data: UpdatePlot,
) -> Result<Plot, String> {
    let now = Utc::now().to_rfc3339();

    // 逐字段拼接 SQL，避免宏导致的类型不匹配
    let mut set_clauses = vec!["updated_at = ?".to_string()];
    let mut str_params: Vec<String> = vec![now.clone()];
    let mut int_params: Vec<i32> = vec![];

    // String 字段
    if let Some(ref v) = data.title { set_clauses.push("title = ?".into()); str_params.push(v.clone()); }
    if let Some(ref v) = data.description { set_clauses.push("description = ?".into()); str_params.push(v.clone()); }
    if let Some(ref v) = data.status { set_clauses.push("status = ?".into()); str_params.push(v.clone()); }
    if let Some(ref v) = data.chapter_id { set_clauses.push("chapter_id = ?".into()); str_params.push(v.clone()); }
    // i32 字段 - 转为字符串绑定（SQLite 会自动转换）
    if let Some(v) = data.target_word_count { set_clauses.push("target_word_count = ?".into()); str_params.push(v.to_string()); }
    if let Some(v) = data.actual_word_count { set_clauses.push("actual_word_count = ?".into()); str_params.push(v.to_string()); }

    let query = format!("UPDATE plots SET {} WHERE id = ?", set_clauses.join(", "));
    let mut q = sqlx::query(&query);
    for p in &str_params { q = q.bind(p); }
    q.bind(&id).execute(&*state.db.lock().unwrap()).await.map_err(|e| e.to_string())?;

    let row = sqlx::query_as::<_, (String, String, String, Option<String>, String, i32, i32, Option<String>, String, String)>(
        "SELECT id, book_id, title, description, status, target_word_count, actual_word_count, chapter_id, created_at, updated_at FROM plots WHERE id = ?"
    )
    .bind(&id)
    .fetch_one(&*state.db.lock().unwrap())
    .await
    .map_err(|e| e.to_string())?;

    Ok(Plot {
        id: row.0, book_id: row.1, title: row.2, description: row.3, status: row.4,
        target_word_count: row.5, actual_word_count: row.6, chapter_id: row.7,
        created_at: row.8, updated_at: row.9,
    })
}

#[tauri::command]
pub async fn delete_plot(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    sqlx::query("DELETE FROM plots WHERE id = ?")
        .bind(&id)
        .execute(&*state.db.lock().unwrap())
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn update_emotion(
    state: State<'_, AppState>,
    plot_id: String,
    position: i32,
    data: UpdateEmotion,
) -> Result<EmotionMark, String> {
    let now = Utc::now().to_rfc3339();

    // 查找或创建情绪标记
    let existing: Option<(String,)> = sqlx::query_as(
        "SELECT id FROM emotion_marks WHERE plot_id = ? AND position = ?"
    )
    .bind(&plot_id)
    .bind(position)
    .fetch_optional(&*state.db.lock().unwrap())
    .await
    .map_err(|e| e.to_string())?;

    if let Some((id,)) = existing {
        // 更新现有
        sqlx::query("UPDATE emotion_marks SET expected_emotion = ?, actual_emotion = ? WHERE id = ?")
            .bind(&data.expected_emotion.unwrap_or(3))
            .bind(&data.actual_emotion.unwrap_or(3))
            .bind(&id)
            .execute(&*state.db.lock().unwrap())
            .await
            .map_err(|e| e.to_string())?;

        let row = sqlx::query_as::<_, (String, String, i32, i32, i32, i32, String)>(
            "SELECT id, plot_id, emotion_level, expected_emotion, actual_emotion, position, created_at FROM emotion_marks WHERE id = ?"
        )
        .bind(&id)
        .fetch_one(&*state.db.lock().unwrap())
        .await
        .map_err(|e| e.to_string())?;

        Ok(EmotionMark {
            id: row.0, plot_id: row.1, emotion_level: row.2,
            expected_emotion: row.3, actual_emotion: row.4, position: row.5, created_at: row.6,
        })
    } else {
        // 创建新标记
        let id = Uuid::new_v4().to_string();
        let emotion_level = position;
        let expected = data.expected_emotion.unwrap_or(3);
        let actual = data.actual_emotion.unwrap_or(3);

        sqlx::query(
            "INSERT INTO emotion_marks (id, plot_id, emotion_level, expected_emotion, actual_emotion, position, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(&id)
        .bind(&plot_id)
        .bind(emotion_level)
        .bind(expected)
        .bind(actual)
        .bind(position)
        .bind(&now)
        .execute(&*state.db.lock().unwrap())
        .await
        .map_err(|e| e.to_string())?;

        Ok(EmotionMark {
            id, plot_id, emotion_level, expected_emotion: expected, actual_emotion: actual,
            position, created_at: now,
        })
    }
}

#[tauri::command]
pub async fn get_emotions(
    state: State<'_, AppState>,
    plot_id: String,
) -> Result<Vec<EmotionMark>, String> {
    let rows = sqlx::query_as::<_, (String, String, i32, i32, i32, i32, String)>(
        "SELECT id, plot_id, emotion_level, expected_emotion, actual_emotion, position, created_at FROM emotion_marks WHERE plot_id = ? ORDER BY position"
    )
    .bind(&plot_id)
    .fetch_all(&*state.db.lock().unwrap())
    .await
    .map_err(|e| e.to_string())?;

    Ok(rows
        .into_iter()
        .map(|(id, plot_id, emotion_level, expected_emotion, actual_emotion, position, created_at)| EmotionMark {
            id, plot_id, emotion_level, expected_emotion, actual_emotion, position, created_at,
        })
        .collect())
}

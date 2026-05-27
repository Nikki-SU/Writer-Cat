// fix: 人物相关命令 - CRUD + 关系 + 时间线
use crate::models::*;
use crate::AppState;
use tauri::State;
use uuid::Uuid;
use chrono::Utc;

#[tauri::command]
pub async fn get_characters(
    state: State<'_, AppState>,
    book_id: String,
) -> Result<Vec<Character>, String> {
    let rows = sqlx::query_as::<_, (String, String, String, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, String, String)>(
        "SELECT id, book_id, name, nickname, gender, age, appearance, personality, background, created_at, updated_at FROM characters WHERE book_id = ? ORDER BY name"
    )
    .bind(&book_id)
    .fetch_all(&*state.db.lock().unwrap())
    .await
    .map_err(|e| e.to_string())?;

    Ok(rows
        .into_iter()
        .map(|(id, book_id, name, nickname, gender, age, appearance, personality, background, created_at, updated_at)| Character {
            id, book_id, name, nickname, gender, age, appearance, personality, background, created_at, updated_at,
        })
        .collect())
}

#[tauri::command]
pub async fn create_character(
    state: State<'_, AppState>,
    data: CreateCharacter,
) -> Result<Character, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    sqlx::query(
        "INSERT INTO characters (id, book_id, name, nickname, gender, age, appearance, personality, background, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&id)
    .bind(&data.book_id)
    .bind(&data.name)
    .bind(&data.nickname)
    .bind(&data.gender)
    .bind(&data.age)
    .bind(&data.appearance)
    .bind(&data.personality)
    .bind(&data.background)
    .bind(&now)
    .bind(&now)
    .execute(&*state.db.lock().unwrap())
    .await
    .map_err(|e| e.to_string())?;

    Ok(Character {
        id,
        book_id: data.book_id,
        name: data.name,
        nickname: data.nickname,
        gender: data.gender,
        age: data.age,
        appearance: data.appearance,
        personality: data.personality,
        background: data.background,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub async fn update_character(
    state: State<'_, AppState>,
    id: String,
    data: UpdateCharacter,
) -> Result<Character, String> {
    let now = Utc::now().to_rfc3339();
    let mut updates = vec!["updated_at = ?".to_string()];
    let mut params: Vec<String> = vec![now];

    macro_rules! add_update {
        ($field:expr, $value:expr) => {
            if let Some(ref v) = $value {
                updates.push(concat!(stringify!($field), " = ?"));
                params.push(v.clone());
            }
        };
    }

    add_update!(name, data.name);
    add_update!(nickname, data.nickname);
    add_update!(gender, data.gender);
    add_update!(age, data.age);
    add_update!(appearance, data.appearance);
    add_update!(personality, data.personality);
    add_update!(background, data.background);

    let query = format!("UPDATE characters SET {} WHERE id = ?", updates.join(", "));
    let mut q = sqlx::query(&query);
    for p in &params {
        q = q.bind(p);
    }
    q.bind(&id).execute(&*state.db.lock().unwrap()).await.map_err(|e| e.to_string())?;

    // 获取更新后的数据
    let row = sqlx::query_as::<_, (String, String, String, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, String, String)>(
        "SELECT id, book_id, name, nickname, gender, age, appearance, personality, background, created_at, updated_at FROM characters WHERE id = ?"
    )
    .bind(&id)
    .fetch_one(&*state.db.lock().unwrap())
    .await
    .map_err(|e| e.to_string())?;

    Ok(Character {
        id: row.0, book_id: row.1, name: row.2, nickname: row.3, gender: row.4, age: row.5,
        appearance: row.6, personality: row.7, background: row.8, created_at: row.9, updated_at: row.10,
    })
}

#[tauri::command]
pub async fn delete_character(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    // 删除人物会级联删除关系和时间线（数据库约束）
    sqlx::query("DELETE FROM characters WHERE id = ?")
        .bind(&id)
        .execute(&*state.db.lock().unwrap())
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

// 获取人物关系
#[tauri::command]
pub async fn get_relationships(
    state: State<'_, AppState>,
    book_id: String,
) -> Result<Vec<Relationship>, String> {
    let rows = sqlx::query_as::<_, (String, String, String, String, String, Option<String>, String)>(
        "SELECT id, book_id, char1_id, char2_id, relation_type, description, created_at FROM relationships WHERE book_id = ?"
    )
    .bind(&book_id)
    .fetch_all(&*state.db.lock().unwrap())
    .await
    .map_err(|e| e.to_string())?;

    Ok(rows
        .into_iter()
        .map(|(id, book_id, char1_id, char2_id, relation_type, description, created_at)| Relationship {
            id, book_id, char1_id, char2_id, relation_type, description, created_at,
        })
        .collect())
}

#[tauri::command]
pub async fn add_relationship(
    state: State<'_, AppState>,
    data: AddRelationship,
) -> Result<Relationship, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    sqlx::query(
        "INSERT INTO relationships (id, book_id, char1_id, char2_id, relation_type, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&id)
    .bind(&data.book_id)
    .bind(&data.char1_id)
    .bind(&data.char2_id)
    .bind(&data.relation_type)
    .bind(&data.description)
    .bind(&now)
    .execute(&*state.db.lock().unwrap())
    .await
    .map_err(|e| e.to_string())?;

    Ok(Relationship {
        id,
        book_id: data.book_id,
        char1_id: data.char1_id,
        char2_id: data.char2_id,
        relation_type: data.relation_type,
        description: data.description,
        created_at: now,
    })
}

#[tauri::command]
pub async fn remove_relationship(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    sqlx::query("DELETE FROM relationships WHERE id = ?")
        .bind(&id)
        .execute(&*state.db.lock().unwrap())
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_timeline_events(
    state: State<'_, AppState>,
    character_id: String,
) -> Result<Vec<TimelineEvent>, String> {
    let rows = sqlx::query_as::<_, (String, String, Option<String>, String, Option<String>, i32, String)>(
        "SELECT id, character_id, chapter_id, event, event_time, order_index, created_at FROM timeline_events WHERE character_id = ? ORDER BY order_index"
    )
    .bind(&character_id)
    .fetch_all(&*state.db.lock().unwrap())
    .await
    .map_err(|e| e.to_string())?;

    Ok(rows
        .into_iter()
        .map(|(id, character_id, chapter_id, event, event_time, order_index, created_at)| TimelineEvent {
            id, character_id, chapter_id, event, event_time, order_index, created_at,
        })
        .collect())
}

#[tauri::command]
pub async fn add_timeline_event(
    state: State<'_, AppState>,
    data: AddTimelineEvent,
) -> Result<TimelineEvent, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    let max_order: Option<i32> = sqlx::query_scalar(
        "SELECT MAX(order_index) FROM timeline_events WHERE character_id = ?"
    )
    .bind(&data.character_id)
    .fetch_optional(&*state.db.lock().unwrap())
    .await
    .map_err(|e| e.to_string())?;
    
    let order_index = max_order.unwrap_or(-1) + 1;

    sqlx::query(
        "INSERT INTO timeline_events (id, character_id, chapter_id, event, event_time, order_index, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&id)
    .bind(&data.character_id)
    .bind(&data.chapter_id)
    .bind(&data.event)
    .bind(&data.event_time)
    .bind(order_index)
    .bind(&now)
    .execute(&*state.db.lock().unwrap())
    .await
    .map_err(|e| e.to_string())?;

    Ok(TimelineEvent {
        id,
        character_id: data.character_id,
        chapter_id: data.chapter_id,
        event: data.event,
        event_time: data.event_time,
        order_index,
        created_at: now,
    })
}

#[tauri::command]
pub async fn update_timeline_event(
    state: State<'_, AppState>,
    id: String,
    data: UpdateTimelineEvent,
) -> Result<TimelineEvent, String> {
    let mut updates = vec![];
    let mut params: Vec<String> = vec![];

    if let Some(ref event) = data.event {
        updates.push("event = ?".to_string());
        params.push(event.clone());
    }
    if let Some(ref time) = data.event_time {
        updates.push("event_time = ?".to_string());
        params.push(time.clone());
    }
    if let Some(ref chapter_id) = data.chapter_id {
        updates.push("chapter_id = ?".to_string());
        params.push(chapter_id.clone());
    }

    if !updates.is_empty() {
        let query = format!("UPDATE timeline_events SET {} WHERE id = ?", updates.join(", "));
        let mut q = sqlx::query(&query);
        for p in &params {
            q = q.bind(p);
        }
        q.bind(&id).execute(&*state.db.lock().unwrap()).await.map_err(|e| e.to_string())?;
    }

    let row = sqlx::query_as::<_, (String, String, Option<String>, String, Option<String>, i32, String)>(
        "SELECT id, character_id, chapter_id, event, event_time, order_index, created_at FROM timeline_events WHERE id = ?"
    )
    .bind(&id)
    .fetch_one(&*state.db.lock().unwrap())
    .await
    .map_err(|e| e.to_string())?;

    Ok(TimelineEvent {
        id: row.0, character_id: row.1, chapter_id: row.2, event: row.3, event_time: row.4,
        order_index: row.5, created_at: row.6,
    })
}

#[tauri::command]
pub async fn delete_timeline_event(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    sqlx::query("DELETE FROM timeline_events WHERE id = ?")
        .bind(&id)
        .execute(&*state.db.lock().unwrap())
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

// 伏笔和世界观相关命令 - 双向互锁 + 挂载
use crate::models::*;
use crate::AppState;
use tauri::State;
use uuid::Uuid;
use chrono::Utc;

#[derive(Debug, Clone, serde::Serialize)]
pub struct StructureData {
    pub foreshadows: Vec<Foreshadow>,
    pub worldviews: Vec<Worldview>,
    pub worldview_mounts: Vec<WorldviewMount>,
}

#[tauri::command]
pub async fn get_structures(
    state: State<'_, AppState>,
    book_id: String,
) -> Result<StructureData, String> {
    let foreshadows = get_foreshadows_inner(&state.db, &book_id).await?;
    let worldviews = get_worldviews_inner(&state.db, &book_id).await?;
    let worldview_mounts = get_worldview_mounts_inner(&state.db).await?;

    Ok(StructureData { foreshadows, worldviews, worldview_mounts })
}

async fn get_foreshadows_inner(
    pool: &sqlx::SqlitePool,
    book_id: &str,
) -> Result<Vec<Foreshadow>, String> {
    let rows = sqlx::query_as::<_, (String, String, String, Option<String>, Option<String>, Option<String>, String, String, String)>(
        "SELECT id, book_id, title, description, buried_chapter_id, resolved_chapter_id, status, created_at, updated_at FROM foreshadows WHERE book_id = ? ORDER BY created_at"
    )
    .bind(book_id)
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(rows
        .into_iter()
        .map(|(id, book_id, title, description, buried_chapter_id, resolved_chapter_id, status, created_at, updated_at)| Foreshadow {
            id, book_id, title, description, buried_chapter_id, resolved_chapter_id, status, created_at, updated_at,
        })
        .collect())
}

#[tauri::command]
pub async fn create_foreshadow(
    state: State<'_, AppState>,
    data: CreateForeshadow,
) -> Result<Foreshadow, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    sqlx::query(
        "INSERT INTO foreshadows (id, book_id, title, description, buried_chapter_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'active', ?, ?)"
    )
    .bind(&id)
    .bind(&data.book_id)
    .bind(&data.title)
    .bind(&data.description)
    .bind(&data.buried_chapter_id)
    .bind(&now)
    .bind(&now)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(Foreshadow {
        id, book_id: data.book_id, title: data.title, description: data.description,
        buried_chapter_id: data.buried_chapter_id, resolved_chapter_id: None,
        status: "active".to_string(), created_at: now.clone(), updated_at: now,
    })
}

#[tauri::command]
pub async fn update_foreshadow(
    state: State<'_, AppState>,
    id: String,
    data: UpdateForeshadow,
) -> Result<Foreshadow, String> {
    let now = Utc::now().to_rfc3339();
    let mut updates = vec!["updated_at = ?".to_string()];
    let mut params: Vec<String> = vec![now];

    if let Some(ref v) = data.title { updates.push("title = ?".to_string()); params.push(v.clone()); }
    if let Some(ref v) = data.description { updates.push("description = ?".to_string()); params.push(v.clone()); }
    if let Some(ref v) = data.buried_chapter_id { updates.push("buried_chapter_id = ?".to_string()); params.push(v.clone()); }
    if let Some(ref v) = data.resolved_chapter_id { updates.push("resolved_chapter_id = ?".to_string()); params.push(v.clone()); }
    if let Some(ref v) = data.status { updates.push("status = ?".to_string()); params.push(v.clone()); }

    let query = format!("UPDATE foreshadows SET {} WHERE id = ?", updates.join(", "));
    let mut q = sqlx::query(&query);
    for p in &params {
        q = q.bind(p);
    }
    q.bind(&id).execute(&state.db).await.map_err(|e| e.to_string())?;

    let row = sqlx::query_as::<_, (String, String, String, Option<String>, Option<String>, Option<String>, String, String, String)>(
        "SELECT id, book_id, title, description, buried_chapter_id, resolved_chapter_id, status, created_at, updated_at FROM foreshadows WHERE id = ?"
    )
    .bind(&id)
    .fetch_one(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(Foreshadow {
        id: row.0, book_id: row.1, title: row.2, description: row.3,
        buried_chapter_id: row.4, resolved_chapter_id: row.5, status: row.6,
        created_at: row.7, updated_at: row.8,
    })
}

#[tauri::command]
pub async fn delete_foreshadow(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    sqlx::query("DELETE FROM foreshadows WHERE id = ?")
        .bind(&id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn resolve_foreshadow(
    state: State<'_, AppState>,
    id: String,
    resolved_chapter_id: String,
) -> Result<Foreshadow, String> {
    let now = Utc::now().to_rfc3339();

    sqlx::query("UPDATE foreshadows SET resolved_chapter_id = ?, status = 'resolved', updated_at = ? WHERE id = ?")
        .bind(&resolved_chapter_id)
        .bind(&now)
        .bind(&id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    let row = sqlx::query_as::<_, (String, String, String, Option<String>, Option<String>, Option<String>, String, String, String)>(
        "SELECT id, book_id, title, description, buried_chapter_id, resolved_chapter_id, status, created_at, updated_at FROM foreshadows WHERE id = ?"
    )
    .bind(&id)
    .fetch_one(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(Foreshadow {
        id: row.0, book_id: row.1, title: row.2, description: row.3,
        buried_chapter_id: row.4, resolved_chapter_id: row.5, status: row.6,
        created_at: row.7, updated_at: row.8,
    })
}

async fn get_worldviews_inner(
    pool: &sqlx::SqlitePool,
    book_id: &str,
) -> Result<Vec<Worldview>, String> {
    let rows = sqlx::query_as::<_, (String, String, String, Option<String>, Option<String>, String, String)>(
        "SELECT id, book_id, title, content, category, created_at, updated_at FROM worldviews WHERE book_id = ? ORDER BY category, title"
    )
    .bind(book_id)
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(rows
        .into_iter()
        .map(|(id, book_id, title, content, category, created_at, updated_at)| Worldview {
            id, book_id, title, content, category, created_at, updated_at,
        })
        .collect())
}

#[tauri::command]
pub async fn create_worldview(
    state: State<'_, AppState>,
    data: CreateWorldview,
) -> Result<Worldview, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    sqlx::query(
        "INSERT INTO worldviews (id, book_id, title, content, category, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&id)
    .bind(&data.book_id)
    .bind(&data.title)
    .bind(&data.content)
    .bind(&data.category)
    .bind(&now)
    .bind(&now)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(Worldview {
        id, book_id: data.book_id, title: data.title, content: data.content,
        category: data.category, created_at: now.clone(), updated_at: now,
    })
}

#[tauri::command]
pub async fn update_worldview(
    state: State<'_, AppState>,
    id: String,
    data: UpdateWorldview,
) -> Result<Worldview, String> {
    let now = Utc::now().to_rfc3339();
    let mut updates = vec!["updated_at = ?".to_string()];
    let mut params: Vec<String> = vec![now];

    if let Some(ref v) = data.title { updates.push("title = ?".to_string()); params.push(v.clone()); }
    if let Some(ref v) = data.content { updates.push("content = ?".to_string()); params.push(v.clone()); }
    if let Some(ref v) = data.category { updates.push("category = ?".to_string()); params.push(v.clone()); }

    let query = format!("UPDATE worldviews SET {} WHERE id = ?", updates.join(", "));
    let mut q = sqlx::query(&query);
    for p in &params {
        q = q.bind(p);
    }
    q.bind(&id).execute(&state.db).await.map_err(|e| e.to_string())?;

    let row = sqlx::query_as::<_, (String, String, String, Option<String>, Option<String>, String, String)>(
        "SELECT id, book_id, title, content, category, created_at, updated_at FROM worldviews WHERE id = ?"
    )
    .bind(&id)
    .fetch_one(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(Worldview {
        id: row.0, book_id: row.1, title: row.2, content: row.3,
        category: row.4, created_at: row.5, updated_at: row.6,
    })
}

#[tauri::command]
pub async fn delete_worldview(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    sqlx::query("DELETE FROM worldviews WHERE id = ?")
        .bind(&id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

async fn get_worldview_mounts_inner(
    pool: &sqlx::SqlitePool,
) -> Result<Vec<WorldviewMount>, String> {
    let rows = sqlx::query_as::<_, (String, String, String, String)>(
        "SELECT id, worldview_id, chapter_id, created_at FROM worldview_mounts"
    )
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(rows
        .into_iter()
        .map(|(id, worldview_id, chapter_id, created_at)| WorldviewMount {
            id, worldview_id, chapter_id, created_at,
        })
        .collect())
}

#[tauri::command]
pub async fn mount_worldview(
    state: State<'_, AppState>,
    data: MountWorldview,
) -> Result<WorldviewMount, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    sqlx::query(
        "INSERT INTO worldview_mounts (id, worldview_id, chapter_id, created_at) VALUES (?, ?, ?, ?)"
    )
    .bind(&id)
    .bind(&data.worldview_id)
    .bind(&data.chapter_id)
    .bind(&now)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(WorldviewMount {
        id, worldview_id: data.worldview_id, chapter_id: data.chapter_id, created_at: now,
    })
}

#[tauri::command]
pub async fn unmount_worldview(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    sqlx::query("DELETE FROM worldview_mounts WHERE id = ?")
        .bind(&id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

// 线索和长伏笔相关命令 - 线性/分支/收束链式结构
use crate::models::*;
use crate::AppState;
use tauri::State;
use uuid::Uuid;
use chrono::Utc;

#[derive(Debug, Clone, serde::Serialize)]
pub struct ThreadWithNodes {
    #[serde(flatten)]
    pub thread: Thread,
    pub nodes: Vec<ThreadNode>,
}

#[tauri::command]
pub async fn get_threads(
    state: State<'_, AppState>,
    book_id: String,
) -> Result<Vec<ThreadWithNodes>, String> {
    let rows = sqlx::query_as::<_, (String, String, String, String, String, String, String)>(
        "SELECT id, book_id, title, thread_type, status, created_at, updated_at FROM threads WHERE book_id = ? ORDER BY created_at"
    )
    .bind(&book_id)
    .fetch_all(&*state.db.lock().unwrap())
    .await
    .map_err(|e| e.to_string())?;

    let mut result = vec![];
    for (id, book_id, title, thread_type, status, created_at, updated_at) in rows {
        let nodes = get_thread_nodes(state.clone(), id.clone()).await?;
        result.push(ThreadWithNodes {
            thread: Thread {
                id, book_id, title, thread_type, status, created_at, updated_at,
            },
            nodes,
        });
    }

    Ok(result)
}

async fn get_thread_nodes(
    state: State<'_, AppState>,
    thread_id: String,
) -> Result<Vec<ThreadNode>, String> {
    let rows = sqlx::query_as::<_, (String, String, String, Option<String>, Option<String>, Option<String>, String, i32, String, String)>(
        "SELECT id, thread_id, title, content, chapter_id, parent_node_id, node_type, order_index, created_at, updated_at FROM thread_nodes WHERE thread_id = ? ORDER BY order_index"
    )
    .bind(&thread_id)
    .fetch_all(&*state.db.lock().unwrap())
    .await
    .map_err(|e| e.to_string())?;

    Ok(rows
        .into_iter()
        .map(|(id, thread_id, title, content, chapter_id, parent_node_id, node_type, order_index, created_at, updated_at)| ThreadNode {
            id, thread_id, title, content, chapter_id, parent_node_id, node_type, order_index, created_at, updated_at,
        })
        .collect())
}

#[tauri::command]
pub async fn create_thread(
    state: State<'_, AppState>,
    data: CreateThread,
) -> Result<Thread, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    let thread_type = data.thread_type.unwrap_or_else(|| "linear".to_string());

    sqlx::query(
        "INSERT INTO threads (id, book_id, title, thread_type, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'active', ?, ?)"
    )
    .bind(&id)
    .bind(&data.book_id)
    .bind(&data.title)
    .bind(&thread_type)
    .bind(&now)
    .bind(&now)
    .execute(&*state.db.lock().unwrap())
    .await
    .map_err(|e| e.to_string())?;

    Ok(Thread {
        id,
        book_id: data.book_id,
        title: data.title,
        thread_type,
        status: "active".to_string(),
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub async fn update_thread(
    state: State<'_, AppState>,
    id: String,
    data: UpdateThread,
) -> Result<Thread, String> {
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

    add_update!(title, data.title);
    add_update!(thread_type, data.thread_type);
    add_update!(status, data.status);

    let query = format!("UPDATE threads SET {} WHERE id = ?", updates.join(", "));
    let mut q = sqlx::query(&query);
    for p in &params {
        q = q.bind(p);
    }
    q.bind(&id).execute(&*state.db.lock().unwrap()).await.map_err(|e| e.to_string())?;

    let row = sqlx::query_as::<_, (String, String, String, String, String, String, String)>(
        "SELECT id, book_id, title, thread_type, status, created_at, updated_at FROM threads WHERE id = ?"
    )
    .bind(&id)
    .fetch_one(&*state.db.lock().unwrap())
    .await
    .map_err(|e| e.to_string())?;

    Ok(Thread {
        id: row.0, book_id: row.1, title: row.2, thread_type: row.3, status: row.4,
        created_at: row.5, updated_at: row.6,
    })
}

#[tauri::command]
pub async fn delete_thread(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    sqlx::query("DELETE FROM threads WHERE id = ?")
        .bind(&id)
        .execute(&*state.db.lock().unwrap())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn add_thread_node(
    state: State<'_, AppState>,
    data: AddThreadNode,
) -> Result<ThreadNode, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    let node_type = data.node_type.unwrap_or_else(|| "normal".to_string());

    let max_order: Option<i32> = sqlx::query_scalar(
        "SELECT MAX(order_index) FROM thread_nodes WHERE thread_id = ?"
    )
    .bind(&data.thread_id)
    .fetch_optional(&*state.db.lock().unwrap())
    .await
    .map_err(|e| e.to_string())?;
    
    let order_index = max_order.unwrap_or(-1) + 1;

    sqlx::query(
        "INSERT INTO thread_nodes (id, thread_id, title, content, chapter_id, parent_node_id, node_type, order_index, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&id)
    .bind(&data.thread_id)
    .bind(&data.title)
    .bind(&data.content)
    .bind(&data.chapter_id)
    .bind(&data.parent_node_id)
    .bind(&node_type)
    .bind(order_index)
    .bind(&now)
    .bind(&now)
    .execute(&*state.db.lock().unwrap())
    .await
    .map_err(|e| e.to_string())?;

    Ok(ThreadNode {
        id,
        thread_id: data.thread_id,
        title: data.title,
        content: data.content,
        chapter_id: data.chapter_id,
        parent_node_id: data.parent_node_id,
        node_type,
        order_index,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub async fn update_thread_node(
    state: State<'_, AppState>,
    id: String,
    data: UpdateThreadNode,
) -> Result<ThreadNode, String> {
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

    add_update!(title, data.title);
    add_update!(content, data.content);
    add_update!(chapter_id, data.chapter_id);
    add_update!(parent_node_id, data.parent_node_id);
    add_update!(node_type, data.node_type);
    add_update!(order_index, data.order_index);

    let query = format!("UPDATE thread_nodes SET {} WHERE id = ?", updates.join(", "));
    let mut q = sqlx::query(&query);
    for p in &params {
        q = q.bind(p);
    }
    q.bind(&id).execute(&*state.db.lock().unwrap()).await.map_err(|e| e.to_string())?;

    let row = sqlx::query_as::<_, (String, String, String, Option<String>, Option<String>, Option<String>, String, i32, String, String)>(
        "SELECT id, thread_id, title, content, chapter_id, parent_node_id, node_type, order_index, created_at, updated_at FROM thread_nodes WHERE id = ?"
    )
    .bind(&id)
    .fetch_one(&*state.db.lock().unwrap())
    .await
    .map_err(|e| e.to_string())?;

    Ok(ThreadNode {
        id: row.0, thread_id: row.1, title: row.2, content: row.3, chapter_id: row.4,
        parent_node_id: row.5, node_type: row.6, order_index: row.7, created_at: row.8, updated_at: row.9,
    })
}

#[tauri::command]
pub async fn delete_thread_node(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    // 删除节点会级联删除子节点
    sqlx::query("DELETE FROM thread_nodes WHERE id = ?")
        .bind(&id)
        .execute(&*state.db.lock().unwrap())
        .await
        .map_err(|e| e.to_string())
}

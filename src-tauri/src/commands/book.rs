// 书籍相关命令 - 创建/切换/删除/重命名/文件系统操作
use crate::models::{Book, CreateBook, UpdateBook};
use crate::AppState;
use tauri::State;
use uuid::Uuid;
use chrono::Utc;

#[tauri::command]
pub async fn create_book(
    state: State<'_, AppState>,
    data: CreateBook,
) -> Result<Book, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    
    sqlx::query(
        "INSERT INTO books (id, title, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(&id)
    .bind(&data.title)
    .bind(&data.description)
    .bind(&now)
    .bind(&now)
    .execute(&*state.db.lock().unwrap())
    .await
    .map_err(|e| e.to_string())?;

    // 创建书籍目录结构
    let data_path = get_data_dir();
    let book_dir = data_path.join("books").join(&id);
    std::fs::create_dir_all(book_dir.join("assets")).map_err(|e| e.to_string())?;

    Ok(Book {
        id,
        title: data.title,
        description: data.description,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub async fn get_books(state: State<'_, AppState>) -> Result<Vec<Book>, String> {
    let rows = sqlx::query_as::<_, (String, String, Option<String>, String, String)>(
        "SELECT id, title, description, created_at, updated_at FROM books ORDER BY updated_at DESC"
    )
    .fetch_all(&*state.db.lock().unwrap())
    .await
    .map_err(|e| e.to_string())?;

    Ok(rows
        .into_iter()
        .map(|(id, title, description, created_at, updated_at)| Book {
            id,
            title,
            description,
            created_at,
            updated_at,
        })
        .collect())
}

#[tauri::command]
pub async fn get_book(
    state: State<'_, AppState>,
    id: String,
) -> Result<Book, String> {
    let row = sqlx::query_as::<_, (String, String, Option<String>, String, String)>(
        "SELECT id, title, description, created_at, updated_at FROM books WHERE id = ?"
    )
    .bind(&id)
    .fetch_one(&*state.db.lock().unwrap())
    .await
    .map_err(|e| e.to_string())?;

    Ok(Book {
        id: row.0,
        title: row.1,
        description: row.2,
        created_at: row.3,
        updated_at: row.4,
    })
}

#[tauri::command]
pub async fn update_book(
    state: State<'_, AppState>,
    id: String,
    data: UpdateBook,
) -> Result<Book, String> {
    let now = Utc::now().to_rfc3339();
    
    let mut updates = vec!["updated_at = ?".to_string()];
    let mut params: Vec<String> = vec![now.clone()];

    if let Some(ref title) = data.title {
        updates.push("title = ?".to_string());
        params.push(title.clone());
    }
    if let Some(ref desc) = data.description {
        updates.push("description = ?".to_string());
        params.push(desc.clone());
    }

    let query = format!(
        "UPDATE books SET {} WHERE id = ?",
        updates.join(", ")
    );
    
    let mut q = sqlx::query(&query);
    for p in &params {
        q = q.bind(p);
    }
    q.bind(&id).execute(&*state.db.lock().unwrap()).await.map_err(|e| e.to_string())?;

    get_book(state, id).await
}

#[tauri::command]
pub async fn delete_book(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    // 删除数据库记录
    sqlx::query("DELETE FROM books WHERE id = ?")
        .bind(&id)
        .execute(&*state.db.lock().unwrap())
        .await
        .map_err(|e| e.to_string())?;

    // 删除书籍目录
    let data_path = get_data_dir();
    let book_dir = data_path.join("books").join(&id);
    if book_dir.exists() {
        std::fs::remove_dir_all(book_dir).map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub fn get_data_path() -> Result<String, String> {
    Ok(get_data_dir().to_string_lossy().to_string())
}

fn get_data_dir() -> std::path::PathBuf {
    dirs::data_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("."))
        .join("writer-cat")
        .join("data")
}

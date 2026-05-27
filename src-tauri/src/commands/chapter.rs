// 章节相关命令 - CRUD + 排序 + 文件读写 + 自动保存 + 导出
use crate::commands::book::get_data_dir;
use crate::models::{Backup, Chapter, CreateChapter, ReorderChapters, UpdateChapter};
use crate::AppState;
use std::fs;
use tauri::State;
use uuid::Uuid;
use chrono::Utc;

fn get_chapter_path(book_id: &str, chapter_id: &str) -> std::path::PathBuf {
    get_data_dir()
        .join("books")
        .join(book_id)
        .join(format!("ch{}.md", &chapter_id[..8]))
}

fn get_backup_dir(book_id: &str, chapter_id: &str) -> std::path::PathBuf {
    get_data_dir()
        .join("books")
        .join(book_id)
        .join(".backups")
        .join(chapter_id)
}

/// 辅助函数：获取章节信息
pub async fn get_chapter_by_id(
    state: State<'_, AppState>,
    id: String,
) -> Result<Chapter, String> {
    let row = sqlx::query_as::<_, (String, String, String, i32, i32, String, String, String)>(
        "SELECT id, book_id, title, order_index, word_count, status, created_at, updated_at FROM chapters WHERE id = ?"
    )
    .bind(&id)
    .fetch_one(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(Chapter {
        id: row.0, book_id: row.1, title: row.2, order_index: row.3,
        word_count: row.4, status: row.5, created_at: row.6, updated_at: row.7,
    })
}

#[tauri::command]
pub async fn create_chapter(
    state: State<'_, AppState>,
    data: CreateChapter,
) -> Result<Chapter, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    let max_order: Option<i32> = sqlx::query_scalar(
        "SELECT MAX(order_index) FROM chapters WHERE book_id = ?"
    )
    .bind(&data.book_id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    let order_index = max_order.unwrap_or(-1) + 1;

    sqlx::query(
        "INSERT INTO chapters (id, book_id, title, order_index, word_count, status, created_at, updated_at) VALUES (?, ?, ?, ?, 0, 'draft', ?, ?)"
    )
    .bind(&id)
    .bind(&data.book_id)
    .bind(&data.title)
    .bind(order_index)
    .bind(&now)
    .bind(&now)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    // 创建章节文件
    let chapter_path = get_chapter_path(&data.book_id, &id);
    fs::write(&chapter_path, "").map_err(|e| e.to_string())?;

    Ok(Chapter {
        id, book_id: data.book_id, title: data.title, order_index,
        word_count: 0, status: "draft".to_string(), created_at: now.clone(), updated_at: now,
    })
}

#[tauri::command]
pub async fn get_chapters(
    state: State<'_, AppState>,
    book_id: String,
) -> Result<Vec<Chapter>, String> {
    let rows = sqlx::query_as::<_, (String, String, String, i32, i32, String, String, String)>(
        "SELECT id, book_id, title, order_index, word_count, status, created_at, updated_at FROM chapters WHERE book_id = ? ORDER BY order_index"
    )
    .bind(&book_id)
    .fetch_all(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(rows
        .into_iter()
        .map(|(id, book_id, title, order_index, word_count, status, created_at, updated_at)| Chapter {
            id, book_id, title, order_index, word_count, status, created_at, updated_at,
        })
        .collect())
}

#[tauri::command]
pub async fn get_chapter(
    state: State<'_, AppState>,
    id: String,
) -> Result<Chapter, String> {
    get_chapter_by_id(state, id).await
}

#[tauri::command]
pub async fn update_chapter(
    state: State<'_, AppState>,
    id: String,
    data: UpdateChapter,
) -> Result<Chapter, String> {
    let now = Utc::now().to_rfc3339();
    let mut updates = vec!["updated_at = ?".to_string()];
    let mut params: Vec<String> = vec![now.clone()];

    if let Some(ref title) = data.title {
        updates.push("title = ?".to_string());
        params.push(title.clone());
    }
    if let Some(ref status) = data.status {
        updates.push("status = ?".to_string());
        params.push(status.clone());
    }

    let query = format!("UPDATE chapters SET {} WHERE id = ?", updates.join(", "));
    let mut q = sqlx::query(&query);
    for p in &params {
        q = q.bind(p);
    }
    q.bind(&id).execute(&state.db).await.map_err(|e| e.to_string())?;

    get_chapter_by_id(state, id).await
}

#[tauri::command]
pub async fn delete_chapter(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    let chapter = get_chapter_by_id(state.clone(), id.clone()).await?;

    sqlx::query("DELETE FROM chapters WHERE id = ?")
        .bind(&id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    // 删除章节文件
    let chapter_path = get_chapter_path(&chapter.book_id, &id);
    if chapter_path.exists() {
        fs::remove_file(chapter_path).ok();
    }

    // 删除备份
    let backup_dir = get_backup_dir(&chapter.book_id, &id);
    if backup_dir.exists() {
        fs::remove_dir_all(backup_dir).ok();
    }

    Ok(())
}

#[tauri::command]
pub async fn reorder_chapters(
    state: State<'_, AppState>,
    data: ReorderChapters,
) -> Result<(), String> {
    let now = Utc::now().to_rfc3339();

    for order in data.chapter_orders {
        sqlx::query("UPDATE chapters SET order_index = ?, updated_at = ? WHERE id = ? AND book_id = ?")
            .bind(order.order_index)
            .bind(&now)
            .bind(&order.id)
            .bind(&data.book_id)
            .execute(&state.db)
            .await
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub async fn read_chapter_content(
    state: State<'_, AppState>,
    id: String,
) -> Result<String, String> {
    let chapter = get_chapter_by_id(state, id).await?;
    let path = get_chapter_path(&chapter.book_id, &chapter.id);
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn write_chapter_content(
    state: State<'_, AppState>,
    id: String,
    content: String,
) -> Result<i32, String> {
    let chapter = get_chapter_by_id(state.clone(), id.clone()).await?;
    let path = get_chapter_path(&chapter.book_id, &chapter.id);

    let word_count = content.chars().filter(|c| !c.is_whitespace()).count() as i32;

    // 安全写入：先写 .tmp 再替换
    let tmp_path = path.with_extension("tmp");
    fs::write(&tmp_path, &content).map_err(|e| e.to_string())?;
    fs::rename(&tmp_path, &path).map_err(|e| e.to_string())?;

    // 创建备份
    create_backup(&chapter.book_id, &chapter.id, &content).await?;

    // 更新字数
    let now = Utc::now().to_rfc3339();
    sqlx::query("UPDATE chapters SET word_count = ?, updated_at = ? WHERE id = ?")
        .bind(word_count)
        .bind(&now)
        .bind(&id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(word_count)
}

async fn create_backup(book_id: &str, chapter_id: &str, content: &str) -> Result<(), String> {
    let backup_dir = get_backup_dir(book_id, chapter_id);
    fs::create_dir_all(&backup_dir).map_err(|e| e.to_string())?;

    let timestamp = Utc::now().format("%Y%m%d%H%M%S").to_string();
    let backup_path = backup_dir.join(format!("{}.md", timestamp));
    fs::write(backup_path, content).map_err(|e| e.to_string())?;

    // 清理旧备份，只保留10个
    let entries = fs::read_dir(&backup_dir).map_err(|e| e.to_string())?;
    let mut backups: Vec<_> = entries
        .filter_map(|e| e.ok())
        .filter(|e| e.path().extension().map_or(false, |ext| ext == "md"))
        .collect();

    backups.sort_by_key(|e| e.path());
    backups.reverse();

    for backup in backups.into_iter().skip(10) {
        fs::remove_file(backup.path()).ok();
    }

    Ok(())
}

#[tauri::command]
pub async fn get_backups(
    state: State<'_, AppState>,
    id: String,
) -> Result<Vec<Backup>, String> {
    let chapter = get_chapter_by_id(state, id).await?;
    let backup_dir = get_backup_dir(&chapter.book_id, &chapter.id);

    if !backup_dir.exists() {
        return Ok(vec![]);
    }

    let entries = fs::read_dir(&backup_dir).map_err(|e| e.to_string())?;
    let mut backups: Vec<Backup> = entries
        .filter_map(|e| e.ok())
        .filter(|e| e.path().extension().map_or(false, |ext| ext == "md"))
        .filter_map(|e| {
            let metadata = e.metadata().ok()?;
            let name = e.file_name().to_string_lossy().to_string();
            let timestamp = name.trim_end_matches(".md").to_string();
            Some(Backup {
                path: e.path().to_string_lossy().to_string(),
                created_at: timestamp,
                size: metadata.len(),
            })
        })
        .collect();

    backups.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    Ok(backups)
}

#[tauri::command]
pub async fn restore_backup(
    state: State<'_, AppState>,
    id: String,
    backup_path: String,
) -> Result<String, String> {
    let content = fs::read_to_string(&backup_path).map_err(|e| e.to_string())?;
    write_chapter_content(state, id, content).await?;
    Ok("备份恢复成功".to_string())
}

#[tauri::command]
pub async fn export_chapter(
    state: State<'_, AppState>,
    id: String,
) -> Result<String, String> {
    let chapter = get_chapter_by_id(state, id).await?;
    let path = get_chapter_path(&chapter.book_id, &chapter.id);
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    Ok(format!("# {}\n\n{}", chapter.title, content))
}

#[tauri::command]
pub async fn export_book(
    state: State<'_, AppState>,
    book_id: String,
) -> Result<String, String> {
    use std::io::Write;
    use zip::write::FileOptions;
    use zip::ZipWriter;

    let book = crate::commands::book::get_book(state.clone(), book_id.clone()).await?;
    let chapters = get_chapters(state.clone(), book_id.clone()).await?;
    let data_path = get_data_dir();

    let zip_path = data_path.join("sync").join(format!("{}.zip", book_id));
    fs::create_dir_all(zip_path.parent().unwrap()).map_err(|e| e.to_string())?;

    let file = fs::File::create(&zip_path).map_err(|e| e.to_string())?;
    let mut zip = ZipWriter::new(file);
    let options = FileOptions::default().compression_method(zip::CompressionMethod::Deflated);

    zip.start_file("meta.json", options.clone()).map_err(|e| e.to_string())?;
    zip.write_all(serde_json::to_string_pretty(&book).unwrap().as_bytes()).map_err(|e| e.to_string())?;

    for chapter in &chapters {
        let chapter_path = get_chapter_path(&book_id, &chapter.id);
        if chapter_path.exists() {
            let content = fs::read_to_string(&chapter_path).unwrap_or_default();
            let filename = format!("chapters/{}.md", &chapter.id[..8]);
            zip.start_file(&filename, options.clone()).map_err(|e| e.to_string())?;
            zip.write_all(format!("# {}\n\n{}", chapter.title, content).as_bytes()).map_err(|e| e.to_string())?;
        }
    }

    let assets_dir = data_path.join("books").join(&book_id).join("assets");
    if assets_dir.exists() {
        for entry in walkdir::WalkDir::new(&assets_dir) {
            let entry = entry.map_err(|e| e.to_string())?;
            if entry.file_type().is_file() {
                let path = entry.path();
                let relative = path.strip_prefix(&assets_dir).unwrap();
                let filename = format!("assets/{}", relative.to_string_lossy());
                zip.start_file(&filename, options.clone()).map_err(|e| e.to_string())?;
                zip.write_all(&fs::read(path).unwrap_or_default()).map_err(|e| e.to_string())?;
            }
        }
    }

    zip.finish().map_err(|e| e.to_string())?;
    Ok(zip_path.to_string_lossy().to_string())
}

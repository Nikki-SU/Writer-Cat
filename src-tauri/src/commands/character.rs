// 人物管理命令
use crate::db::get_db_path;
use crate::models::character::{Character, CharacterRelation, CharacterTimeline};
use rusqlite::{params, Connection};
use tauri::command;

#[command]
pub fn create_character(
    book_id: String,
    name: String,
    avatar: Option<String>,
    gender: Option<String>,
    age: Option<i32>,
    intro: Option<String>,
    personality: Option<String>,
    appearance: Option<String>,
) -> Result<Character, String> {
    let mut character = Character::new(book_id.clone(), name);
    
    if let Some(a) = avatar {
        character.avatar = a;
    }
    if let Some(g) = gender {
        character.gender = g;
    }
    if let Some(a) = age {
        character.age = a;
    }
    if let Some(i) = intro {
        character.intro = i;
    }
    if let Some(p) = personality {
        character.personality = p;
    }
    if let Some(a) = appearance {
        character.appearance = a;
    }
    
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO characters (id, book_id, name, avatar, gender, age, intro, personality, appearance, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        params![
            character.id,
            character.book_id,
            character.name,
            character.avatar,
            character.gender,
            character.age,
            character.intro,
            character.personality,
            character.appearance,
            character.created_at,
            character.updated_at
        ],
    ).map_err(|e| e.to_string())?;
    
    Ok(character)
}

#[command]
pub fn get_characters(book_id: String) -> Result<Vec<Character>, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, book_id, name, avatar, gender, age, intro, personality, appearance, created_at, updated_at FROM characters WHERE book_id = ?1 ORDER BY created_at")
        .map_err(|e| e.to_string())?;
    
    let characters = stmt
        .query_map(params![book_id], |row| {
            Ok(Character {
                id: row.get(0)?,
                book_id: row.get(1)?,
                name: row.get(2)?,
                avatar: row.get(3)?,
                gender: row.get(4)?,
                age: row.get(5)?,
                intro: row.get(6)?,
                personality: row.get(7)?,
                appearance: row.get(8)?,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    
    Ok(characters)
}

#[command]
pub fn get_character(id: String) -> Result<Character, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, book_id, name, avatar, gender, age, intro, personality, appearance, created_at, updated_at FROM characters WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    
    stmt.query_row(params![id], |row| {
        Ok(Character {
            id: row.get(0)?,
            book_id: row.get(1)?,
            name: row.get(2)?,
            avatar: row.get(3)?,
            gender: row.get(4)?,
            age: row.get(5)?,
            intro: row.get(6)?,
            personality: row.get(7)?,
            appearance: row.get(8)?,
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    })
    .map_err(|e| e.to_string())
}

#[command]
pub fn update_character(
    id: String,
    name: Option<String>,
    avatar: Option<String>,
    gender: Option<String>,
    age: Option<i32>,
    intro: Option<String>,
    personality: Option<String>,
    appearance: Option<String>,
) -> Result<Character, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();
    
    // 先获取现有人物
    let mut stmt = conn
        .prepare("SELECT id, book_id, name, avatar, gender, age, intro, personality, appearance, created_at, updated_at FROM characters WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    
    let mut character: Character = stmt.query_row(params![id], |row| {
        Ok(Character {
            id: row.get(0)?,
            book_id: row.get(1)?,
            name: row.get(2)?,
            avatar: row.get(3)?,
            gender: row.get(4)?,
            age: row.get(5)?,
            intro: row.get(6)?,
            personality: row.get(7)?,
            appearance: row.get(8)?,
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    })
    .map_err(|e| e.to_string())?;
    
    // 更新字段
    if let Some(n) = name {
        character.name = n;
    }
    if let Some(a) = avatar {
        character.avatar = a;
    }
    if let Some(g) = gender {
        character.gender = g;
    }
    if let Some(a) = age {
        character.age = a;
    }
    if let Some(i) = intro {
        character.intro = i;
    }
    if let Some(p) = personality {
        character.personality = p;
    }
    if let Some(a) = appearance {
        character.appearance = a;
    }
    character.updated_at = now;
    
    conn.execute(
        "UPDATE characters SET name = ?1, avatar = ?2, gender = ?3, age = ?4, intro = ?5, personality = ?6, appearance = ?7, updated_at = ?8 WHERE id = ?9",
        params![
            character.name,
            character.avatar,
            character.gender,
            character.age,
            character.intro,
            character.personality,
            character.appearance,
            character.updated_at,
            character.id
        ],
    )
    .map_err(|e| e.to_string())?;
    
    Ok(character)
}

#[command]
pub fn delete_character(id: String) -> Result<(), String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    // 由于使用了ON DELETE CASCADE，外键关联会自动删除
    conn.execute("DELETE FROM characters WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// 人物关系命令
#[command]
pub fn create_relation(
    book_id: String,
    character_id: String,
    target_character_id: String,
    relation_type: String,
    start_chapter: Option<i32>,
    end_chapter: Option<i32>,
) -> Result<CharacterRelation, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    
    // 创建正向关系 (A -> B)
    let mut relation = CharacterRelation::new(
        book_id.clone(),
        character_id.clone(),
        target_character_id.clone(),
        relation_type.clone(),
    );
    if let Some(sc) = start_chapter {
        relation.start_chapter = sc;
    }
    if let Some(ec) = end_chapter {
        relation.end_chapter = ec;
    }
    
    conn.execute(
        "INSERT INTO character_relations (id, book_id, character_id, target_character_id, relation_type, start_chapter, end_chapter, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![
            relation.id,
            relation.book_id,
            relation.character_id,
            relation.target_character_id,
            relation.relation_type,
            relation.start_chapter,
            relation.end_chapter,
            relation.created_at
        ],
    ).map_err(|e| e.to_string())?;
    
    // 创建反向关系 (B -> A)，使用对立的relation_type
    let reverse_type = get_reverse_relation_type(&relation_type);
    let mut reverse_relation = CharacterRelation::new(
        book_id,
        target_character_id,
        character_id,
        reverse_type,
    );
    if let Some(sc) = start_chapter {
        reverse_relation.start_chapter = sc;
    }
    if let Some(ec) = end_chapter {
        reverse_relation.end_chapter = ec;
    }
    
    conn.execute(
        "INSERT INTO character_relations (id, book_id, character_id, target_character_id, relation_type, start_chapter, end_chapter, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![
            reverse_relation.id,
            reverse_relation.book_id,
            reverse_relation.character_id,
            reverse_relation.target_character_id,
            reverse_relation.relation_type,
            reverse_relation.start_chapter,
            reverse_relation.end_chapter,
            reverse_relation.created_at
        ],
    ).map_err(|e| e.to_string())?;
    
    Ok(relation)
}

fn get_reverse_relation_type(relation_type: &str) -> String {
    match relation_type {
        "父亲" => "儿子".to_string(),
        "母亲" => "儿子".to_string(),
        "父亲" => "女儿".to_string(),
        "母亲" => "女儿".to_string(),
        "儿子" => "父亲".to_string(),
        "女儿" => "父亲".to_string(),
        "兄弟" => "兄弟".to_string(),
        "姐妹" => "姐妹".to_string(),
        "夫妻" => "夫妻".to_string(),
        "恋人" => "恋人".to_string(),
        "朋友" => "朋友".to_string(),
        "敌人" => "敌人".to_string(),
        "上司" => "下属".to_string(),
        "下属" => "上司".to_string(),
        "老师" => "学生".to_string(),
        "学生" => "老师".to_string(),
        "兄妹" => "兄妹".to_string(),
        "姐弟" => "姐弟".to_string(),
        "父子" => "父子".to_string(),
        "母女" => "母女".to_string(),
        _ => relation_type.to_string(),
    }
}

#[command]
pub fn get_relations(book_id: String) -> Result<Vec<CharacterRelation>, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, book_id, character_id, target_character_id, relation_type, start_chapter, end_chapter, created_at FROM character_relations WHERE book_id = ?1")
        .map_err(|e| e.to_string())?;
    
    let relations = stmt
        .query_map(params![book_id], |row| {
            Ok(CharacterRelation {
                id: row.get(0)?,
                book_id: row.get(1)?,
                character_id: row.get(2)?,
                target_character_id: row.get(3)?,
                relation_type: row.get(4)?,
                start_chapter: row.get(5)?,
                end_chapter: row.get(6)?,
                created_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    
    Ok(relations)
}

#[command]
pub fn update_relation(id: String, relation_type: String) -> Result<CharacterRelation, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    
    // 先获取现有关系
    let mut stmt = conn
        .prepare("SELECT id, book_id, character_id, target_character_id, relation_type, start_chapter, end_chapter, created_at FROM character_relations WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    
    let relation: CharacterRelation = stmt.query_row(params![id], |row| {
        Ok(CharacterRelation {
            id: row.get(0)?,
            book_id: row.get(1)?,
            character_id: row.get(2)?,
            target_character_id: row.get(3)?,
            relation_type: row.get(4)?,
            start_chapter: row.get(5)?,
            end_chapter: row.get(6)?,
            created_at: row.get(7)?,
        })
    })
    .map_err(|e| e.to_string())?;
    
    // 更新正向关系
    conn.execute(
        "UPDATE character_relations SET relation_type = ?1 WHERE id = ?2",
        params![relation_type, id],
    )
    .map_err(|e| e.to_string())?;
    
    // 查找并更新对应的反向关系
    let reverse_relation_type = get_reverse_relation_type(&relation_type);
    conn.execute(
        "UPDATE character_relations SET relation_type = ?1 WHERE character_id = ?2 AND target_character_id = ?3",
        params![reverse_relation_type, relation.target_character_id, relation.character_id],
    )
    .map_err(|e| e.to_string())?;
    
    // 返回更新后的关系
    let mut stmt = conn
        .prepare("SELECT id, book_id, character_id, target_character_id, relation_type, start_chapter, end_chapter, created_at FROM character_relations WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    
    stmt.query_row(params![id], |row| {
        Ok(CharacterRelation {
            id: row.get(0)?,
            book_id: row.get(1)?,
            character_id: row.get(2)?,
            target_character_id: row.get(3)?,
            relation_type: row.get(4)?,
            start_chapter: row.get(5)?,
            end_chapter: row.get(6)?,
            created_at: row.get(7)?,
        })
    })
    .map_err(|e| e.to_string())
}

#[command]
pub fn delete_relation(id: String) -> Result<(), String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    
    // 先获取要删除的关系，以便找到对应的反向关系
    let mut stmt = conn
        .prepare("SELECT character_id, target_character_id FROM character_relations WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    
    let result: Result<(String, String), _> = stmt.query_row(params![id], |row| {
        Ok((row.get(0)?, row.get(1)?))
    });
    
    if let Ok((character_id, target_character_id)) = result {
        // 删除正向关系
        conn.execute("DELETE FROM character_relations WHERE id = ?1", params![id])
            .map_err(|e| e.to_string())?;
        
        // 删除反向关系
        conn.execute(
            "DELETE FROM character_relations WHERE character_id = ?1 AND target_character_id = ?2",
            params![target_character_id, character_id],
        )
        .map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

// 人物时间线命令
#[command]
pub fn create_timeline_event(
    character_id: String,
    chapter_id: String,
    chapter_title: String,
    event: String,
    personality_change: Option<String>,
) -> Result<CharacterTimeline, String> {
    let mut timeline = CharacterTimeline::new(character_id, chapter_id, chapter_title, event);
    if let Some(pc) = personality_change {
        timeline.personality_change = pc;
    }
    
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO character_timelines (id, character_id, chapter_id, chapter_title, event, personality_change, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![
            timeline.id,
            timeline.character_id,
            timeline.chapter_id,
            timeline.chapter_title,
            timeline.event,
            timeline.personality_change,
            timeline.created_at
        ],
    ).map_err(|e| e.to_string())?;
    
    Ok(timeline)
}

#[command]
pub fn get_timeline(character_id: String) -> Result<Vec<CharacterTimeline>, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, character_id, chapter_id, chapter_title, event, personality_change, created_at FROM character_timelines WHERE character_id = ?1 ORDER BY created_at")
        .map_err(|e| e.to_string())?;
    
    let timelines = stmt
        .query_map(params![character_id], |row| {
            Ok(CharacterTimeline {
                id: row.get(0)?,
                character_id: row.get(1)?,
                chapter_id: row.get(2)?,
                chapter_title: row.get(3)?,
                event: row.get(4)?,
                personality_change: row.get(5)?,
                created_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    
    Ok(timelines)
}

#[command]
pub fn update_timeline_event(id: String, event: String, personality_change: Option<String>) -> Result<CharacterTimeline, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    
    // 先获取现有时间线
    let mut stmt = conn
        .prepare("SELECT id, character_id, chapter_id, chapter_title, event, personality_change, created_at FROM character_timelines WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    
    let mut timeline: CharacterTimeline = stmt.query_row(params![id], |row| {
        Ok(CharacterTimeline {
            id: row.get(0)?,
            character_id: row.get(1)?,
            chapter_id: row.get(2)?,
            chapter_title: row.get(3)?,
            event: row.get(4)?,
            personality_change: row.get(5)?,
            created_at: row.get(6)?,
        })
    })
    .map_err(|e| e.to_string())?;
    
    // 更新字段
    timeline.event = event;
    if let Some(pc) = personality_change {
        timeline.personality_change = pc;
    }
    
    conn.execute(
        "UPDATE character_timelines SET event = ?1, personality_change = ?2 WHERE id = ?3",
        params![timeline.event, timeline.personality_change, timeline.id],
    )
    .map_err(|e| e.to_string())?;
    
    Ok(timeline)
}

#[command]
pub fn delete_timeline_event(id: String) -> Result<(), String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM character_timelines WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

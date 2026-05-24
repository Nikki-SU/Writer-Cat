// 人物API封装
import { invoke } from '@tauri-apps/api/core';

/**
 * 创建新人物
 * @param {object} data - 人物数据
 * @returns {Promise<Character>}
 */
export async function createCharacter(data) {
  return await invoke('create_character', {
    bookId: data.bookId,
    name: data.name,
    avatar: data.avatar || null,
    gender: data.gender || null,
    age: data.age || null,
    intro: data.intro || null,
    personality: data.personality || null,
    appearance: data.appearance || null,
  });
}

/**
 * 获取书籍的所有人物
 * @param {string} bookId - 书籍ID
 * @returns {Promise<Character[]>}
 */
export async function getCharacters(bookId) {
  return await invoke('get_characters', { bookId });
}

/**
 * 获取单个人物
 * @param {string} id - 人物ID
 * @returns {Promise<Character>}
 */
export async function getCharacter(id) {
  return await invoke('get_character', { id });
}

/**
 * 更新人物信息
 * @param {string} id - 人物ID
 * @param {object} updates - 更新内容
 * @returns {Promise<Character>}
 */
export async function updateCharacter(id, updates) {
  return await invoke('update_character', {
    id,
    name: updates.name || null,
    avatar: updates.avatar || null,
    gender: updates.gender || null,
    age: updates.age || null,
    intro: updates.intro || null,
    personality: updates.personality || null,
    appearance: updates.appearance || null,
  });
}

/**
 * 删除人物
 * @param {string} id - 人物ID
 * @returns {Promise<void>}
 */
export async function deleteCharacter(id) {
  return await invoke('delete_character', { id });
}

// 人物关系
export async function createRelation(data) {
  return await invoke('create_relation', data);
}

export async function getRelations(bookId) {
  return await invoke('get_relations', { bookId });
}

export async function updateRelation(id, relationType) {
  return await invoke('update_relation', { id, relationType });
}

export async function deleteRelation(id) {
  return await invoke('delete_relation', { id });
}

// 人物时间线
export async function createTimelineEvent(data) {
  return await invoke('create_timeline_event', data);
}

export async function getTimeline(characterId) {
  return await invoke('get_timeline', { characterId });
}

export async function updateTimelineEvent(id, event) {
  return await invoke('update_timeline_event', { id, event });
}

export async function deleteTimelineEvent(id) {
  return await invoke('delete_timeline_event', { id });
}

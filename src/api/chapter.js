// 章节API封装
import { invoke } from '@tauri-apps/api/core';

/**
 * 创建新章节
 * @param {string} bookId - 书籍ID
 * @param {string} title - 章节标题
 * @param {number} orderIndex - 排序索引
 * @returns {Promise<Chapter>}
 */
export async function createChapter(bookId, title, orderIndex) {
  return await invoke('create_chapter', { bookId, title, orderIndex });
}

/**
 * 获取书籍的所有章节
 * @param {string} bookId - 书籍ID
 * @returns {Promise<Chapter[]>}
 */
export async function getChapters(bookId) {
  return await invoke('get_chapters', { bookId });
}

/**
 * 获取单个章节
 * @param {string} id - 章节ID
 * @returns {Promise<Chapter>}
 */
export async function getChapter(id) {
  return await invoke('get_chapter', { id });
}

/**
 * 更新章节
 * @param {string} id - 章节ID
 * @param {object} updates - 更新内容
 * @returns {Promise<Chapter>}
 */
export async function updateChapter(id, updates) {
  return await invoke('update_chapter', { 
    id, 
    title: updates.title || null,
    content: updates.content || null,
    wordCount: updates.wordCount || null,
  });
}

/**
 * 删除章节
 * @param {string} id - 章节ID
 * @returns {Promise<void>}
 */
export async function deleteChapter(id) {
  return await invoke('delete_chapter', { id });
}

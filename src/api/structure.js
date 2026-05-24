// 结构API封装（伏笔+世界观+线索）
import { invoke } from '@tauri-apps/api/core';

// ==================== 伏笔管理 ====================

/**
 * 创建伏笔
 * @param {Object} data - 包含 bookId, name, buryChapterId, buryChapterTitle, buryContent
 * @returns {Promise<Foreshadow>}
 */
export async function createForeshadow(data) {
  return await invoke('create_foreshadow', {
    bookId: data.bookId,
    name: data.name,
    buryChapterId: data.buryChapterId || null,
    buryChapterTitle: data.buryChapterTitle || null,
    buryContent: data.buryContent || null,
  });
}

/**
 * 获取书籍的所有伏笔
 * @param {string} bookId - 书籍ID
 * @returns {Promise<Foreshadow[]>}
 */
export async function getForeshadows(bookId) {
  return await invoke('get_foreshadows', { bookId });
}

/**
 * 更新伏笔
 * @param {string} id - 伏笔ID
 * @param {Object} updates - 可更新字段
 * @returns {Promise<Foreshadow>}
 */
export async function updateForeshadow(id, updates) {
  return await invoke('update_foreshadow', {
    id,
    name: updates.name || null,
    revealChapterId: updates.revealChapterId || null,
    revealChapterTitle: updates.revealChapterTitle || null,
    revealContent: updates.revealContent || null,
    completed: updates.completed !== undefined ? updates.completed : null,
  });
}

/**
 * 删除伏笔
 * @param {string} id - 伏笔ID
 */
export async function deleteForeshadow(id) {
  return await invoke('delete_foreshadow', { id });
}

// ==================== 世界观管理 ====================

/**
 * 创建世界观
 * @param {Object} data - 包含 bookId, name, description
 * @returns {Promise<Worldview>}
 */
export async function createWorldview(data) {
  return await invoke('create_worldview', {
    bookId: data.bookId,
    name: data.name,
    description: data.description || null,
  });
}

/**
 * 获取书籍的所有世界观
 * @param {string} bookId - 书籍ID
 * @returns {Promise<Worldview[]>}
 */
export async function getWorldviews(bookId) {
  return await invoke('get_worldviews', { bookId });
}

/**
 * 获取单个世界观详情
 * @param {string} id - 世界观ID
 * @returns {Promise<Worldview>}
 */
export async function getWorldview(id) {
  return await invoke('get_worldview', { id });
}

/**
 * 更新世界观
 * @param {string} id - 世界观ID
 * @param {Object} updates - 可更新字段
 * @returns {Promise<Worldview>}
 */
export async function updateWorldview(id, updates) {
  return await invoke('update_worldview', {
    id,
    name: updates.name || null,
    description: updates.description || null,
  });
}

/**
 * 删除世界观
 * @param {string} id - 世界观ID
 */
export async function deleteWorldview(id) {
  return await invoke('delete_worldview', { id });
}

// ==================== 世界观-章节关联 ====================

/**
 * 将世界观挂载到章节
 * @param {string} worldviewId - 世界观ID
 * @param {string} chapterId - 章节ID
 * @param {string} position - 位置标记（可选）
 */
export async function attachWorldviewToChapter(worldviewId, chapterId, position = '') {
  return await invoke('attach_worldview_to_chapter', { worldviewId, chapterId, position });
}

/**
 * 将世界观从章节解绑
 * @param {string} worldviewId - 世界观ID
 * @param {string} chapterId - 章节ID
 */
export async function detachWorldviewFromChapter(worldviewId, chapterId) {
  return await invoke('detach_worldview_from_chapter', { worldviewId, chapterId });
}

/**
 * 获取世界观已挂载的章节列表
 * @param {string} worldviewId - 世界观ID
 * @returns {Promise<{chapterId: string, position: string}[]>}
 */
export async function getWorldviewChapters(worldviewId) {
  return await invoke('get_worldview_chapters', { worldviewId });
}

/**
 * 获取章节已挂载的世界观列表
 * @param {string} chapterId - 章节ID
 * @returns {Promise<Worldview[]>}
 */
export async function getChapterWorldviews(chapterId) {
  return await invoke('get_chapter_worldviews', { chapterId });
}

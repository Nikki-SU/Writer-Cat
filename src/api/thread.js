// 线索/长伏笔 API封装
import { invoke } from '@tauri-apps/api/core';

/**
 * 创建线索/长伏笔
 * @param {Object} data - 包含 bookId, name, threadType
 * @returns {Promise<Thread>}
 */
export async function createThread(data) {
  return await invoke('create_thread', {
    bookId: data.bookId,
    name: data.name,
    threadType: data.threadType,
  });
}

/**
 * 获取书籍的所有线索/长伏笔
 * @param {string} bookId - 书籍ID
 * @returns {Promise<Thread[]>}
 */
export async function getThreads(bookId) {
  return await invoke('get_threads', { bookId });
}

/**
 * 获取单个线索详情
 * @param {string} id - 线索ID
 * @returns {Promise<Thread>}
 */
export async function getThread(id) {
  return await invoke('get_thread', { id });
}

/**
 * 更新线索/长伏笔
 * @param {string} id - 线索ID
 * @param {Object} updates - 可更新字段
 * @returns {Promise<Thread>}
 */
export async function updateThread(id, updates) {
  return await invoke('update_thread', {
    id,
    name: updates.name || null,
    threadType: updates.threadType || null,
    resolved: updates.resolved !== undefined ? updates.resolved : null,
    resolvedChapterId: updates.resolvedChapterId || null,
  });
}

/**
 * 删除线索/长伏笔
 * @param {string} id - 线索ID
 */
export async function deleteThread(id) {
  return await invoke('delete_thread', { id });
}

/**
 * 创建线索节点
 * @param {Object} data - 包含 threadId, content, orderIndex
 * @returns {Promise<ThreadNode>}
 */
export async function createThreadNode(data) {
  return await invoke('create_thread_node', {
    threadId: data.threadId,
    content: data.content,
    orderIndex: data.orderIndex,
  });
}

/**
 * 获取线索的所有节点
 * @param {string} threadId - 线索ID
 * @returns {Promise<ThreadNode[]>}
 */
export async function getThreadNodes(threadId) {
  return await invoke('get_thread_nodes', { threadId });
}

/**
 * 更新线索节点
 * @param {string} id - 节点ID
 * @param {Object} updates - 可更新字段
 * @returns {Promise<ThreadNode>}
 */
export async function updateThreadNode(id, updates) {
  return await invoke('update_thread_node', {
    id,
    content: updates.content || null,
    chapterId: updates.chapterId || null,
    chapterTitle: updates.chapterTitle || null,
    branchLabel: updates.branchLabel || null,
  });
}

/**
 * 删除线索节点
 * @param {string} id - 节点ID
 */
export async function deleteThreadNode(id) {
  return await invoke('delete_thread_node', { id });
}

/**
 * 重新排序线索节点
 * @param {string} threadId - 线索ID
 * @param {string[]} nodeIds - 节点ID数组（按新顺序）
 */
export async function reorderThreadNodes(threadId, nodeIds) {
  return await invoke('reorder_thread_nodes', { threadId, nodeIds });
}

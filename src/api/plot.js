// 情节API封装
import { invoke } from '@tauri-apps/api/core';

/**
 * 创建新情节
 * @param {object} data - 情节数据
 * @returns {Promise<PlotItem>}
 */
export async function createPlotItem(data) {
  return await invoke('create_plot_item', {
    chapterId: data.chapterId,
    bookId: data.bookId,
    content: data.content,
    orderIndex: data.orderIndex,
  });
}

/**
 * 获取章节的所有情节
 * @param {string} chapterId - 章节ID
 * @returns {Promise<PlotItem[]>}
 */
export async function getPlotItems(chapterId) {
  return await invoke('get_plot_items', { chapterId });
}

/**
 * 获取书籍的所有情节（按章节分组）
 * @param {string} bookId - 书籍ID
 * @returns {Promise<PlotItem[]>}
 */
export async function getAllPlotItems(bookId) {
  return await invoke('get_all_plot_items', { bookId });
}

/**
 * 更新情节
 * @param {string} id - 情节ID
 * @param {object} updates - 更新内容
 * @returns {Promise<PlotItem>}
 */
export async function updatePlotItem(id, updates) {
  return await invoke('update_plot_item', {
    id,
    content: updates.content,
    completed: updates.completed !== undefined ? updates.completed : null,
  });
}

/**
 * 删除情节
 * @param {string} id - 情节ID
 * @returns {Promise<void>}
 */
export async function deletePlotItem(id) {
  return await invoke('delete_plot_item', { id });
}

/**
 * 重排情节顺序
 * @param {string} chapterId - 章节ID
 * @param {string[]} itemIds - 情节ID数组
 * @returns {Promise<void>}
 */
export async function reorderPlotItems(chapterId, itemIds) {
  return await invoke('reorder_plot_items', { chapterId, itemIds });
}

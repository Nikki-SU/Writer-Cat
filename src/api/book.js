// 书籍API封装
import { invoke } from '@tauri-apps/api/core';

/**
 * 创建新书籍
 * @param {string} name - 书籍名称
 * @returns {Promise<Book>}
 */
export async function createBook(name) {
  return await invoke('create_book', { name });
}

/**
 * 获取所有书籍
 * @returns {Promise<Book[]>}
 */
export async function getBooks() {
  return await invoke('get_books');
}

/**
 * 获取单个书籍
 * @param {string} id - 书籍ID
 * @returns {Promise<Book>}
 */
export async function getBook(id) {
  return await invoke('get_book', { id });
}

/**
 * 更新书籍信息
 * @param {string} id - 书籍ID
 * @param {string} name - 书籍名称
 * @returns {Promise<Book>}
 */
export async function updateBook(id, name) {
  return await invoke('update_book', { id, name });
}

/**
 * 删除书籍
 * @param {string} id - 书籍ID
 * @returns {Promise<void>}
 */
export async function deleteBook(id) {
  return await invoke('delete_book', { id });
}

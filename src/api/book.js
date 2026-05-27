// 书籍 API
import { invoke } from '@tauri-apps/api/core';

export const bookApi = {
  // 获取所有书籍
  getBooks: () => invoke('get_books'),
  
  // 获取单个书籍
  getBook: (id) => invoke('get_book', { id }),
  
  // 创建书籍
  createBook: (data) => invoke('create_book', { data }),
  
  // 更新书籍
  updateBook: (id, data) => invoke('update_book', { id, data }),
  
  // 删除书籍
  deleteBook: (id) => invoke('delete_book', { id }),
  
  // 获取数据路径
  getDataPath: () => invoke('get_data_path'),
};

// fix: 章节 API
import { invoke } from '@tauri-apps/api/core';

export const chapterApi = {
  // 获取章节列表
  getChapters: (bookId) => invoke('get_chapters', { bookId }),
  
  // 获取单个章节
  getChapter: (id) => invoke('get_chapter', { id }),
  
  // 创建章节
  createChapter: (data) => invoke('create_chapter', { data }),
  
  // 更新章节
  updateChapter: (id, data) => invoke('update_chapter', { id, data }),
  
  // 删除章节
  deleteChapter: (id) => invoke('delete_chapter', { id }),
  
  // 重新排序章节
  reorderChapters: (data) => invoke('reorder_chapters', { data }),
  
  // 读取章节内容
  readContent: (id) => invoke('read_chapter_content', { id }),
  
  // 写入章节内容（自动保存）
  writeContent: (id, content) => invoke('write_chapter_content', { id, content }),
  
  // 获取备份列表
  getBackups: (id) => invoke('get_backups', { id }),
  
  // 恢复备份
  restoreBackup: (id, backupPath) => invoke('restore_backup', { id, backupPath }),
  
  // 导出单章
  exportChapter: (id) => invoke('export_chapter', { id }),
  
  // 导出整书
  exportBook: (bookId) => invoke('export_book', { bookId }),
};

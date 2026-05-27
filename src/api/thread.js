// fix: 线索 API
import { invoke } from '@tauri-apps/api/core';

export const threadApi = {
  // 获取线索列表（包含节点）
  getThreads: (bookId) => invoke('get_threads', { bookId }),
  
  // 创建线索
  createThread: (data) => invoke('create_thread', { data }),
  
  // 更新线索
  updateThread: (id, data) => invoke('update_thread', { id, data }),
  
  // 删除线索
  deleteThread: (id) => invoke('delete_thread', { id }),
  
  // 添加节点
  addThreadNode: (data) => invoke('add_thread_node', { data }),
  
  // 更新节点
  updateThreadNode: (id, data) => invoke('update_thread_node', { id, data }),
  
  // 删除节点
  deleteThreadNode: (id) => invoke('delete_thread_node', { id }),
};

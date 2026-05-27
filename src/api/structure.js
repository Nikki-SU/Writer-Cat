// 结构和伏笔 API
import { invoke } from '@tauri-apps/api/core';

export const structureApi = {
  // 获取结构数据（伏笔+世界观）
  getStructures: (bookId) => invoke('get_structures', { bookId }),
  
  // 创建伏笔
  createForeshadow: (data) => invoke('create_foreshadow', { data }),
  
  // 更新伏笔
  updateForeshadow: (id, data) => invoke('update_foreshadow', { id, data }),
  
  // 删除伏笔
  deleteForeshadow: (id) => invoke('delete_foreshadow', { id }),
  
  // 解决伏笔（双向互锁）
  resolveForeshadow: (id, resolvedChapterId) => invoke('resolve_foreshadow', { id, resolvedChapterId }),
  
  // 创建世界观
  createWorldview: (data) => invoke('create_worldview', { data }),
  
  // 更新世界观
  updateWorldview: (id, data) => invoke('update_worldview', { id, data }),
  
  // 删除世界观
  deleteWorldview: (id) => invoke('delete_worldview', { id }),
  
  // 挂载世界观到章节
  mountWorldview: (data) => invoke('mount_worldview', { data }),
  
  // 取消挂载
  unmountWorldview: (id) => invoke('unmount_worldview', { id }),
};

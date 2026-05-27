// 人物 API
import { invoke } from '@tauri-apps/api/core';

export const characterApi = {
  // 获取人物列表
  getCharacters: (bookId) => invoke('get_characters', { bookId }),
  
  // 创建人物
  createCharacter: (data) => invoke('create_character', { data }),
  
  // 更新人物
  updateCharacter: (id, data) => invoke('update_character', { id, data }),
  
  // 删除人物
  deleteCharacter: (id) => invoke('delete_character', { id }),
  
  // 添加关系
  addRelationship: (data) => invoke('add_relationship', { data }),
  
  // 删除关系
  removeRelationship: (id) => invoke('remove_relationship', { id }),
  
  // 获取时间线事件
  getTimelineEvents: (characterId) => invoke('get_timeline_events', { characterId }),
  
  // 添加时间线事件
  addTimelineEvent: (data) => invoke('add_timeline_event', { data }),
  
  // 更新时间线事件
  updateTimelineEvent: (id, data) => invoke('update_timeline_event', { id, data }),
  
  // 删除时间线事件
  deleteTimelineEvent: (id) => invoke('delete_timeline_event', { id }),
};

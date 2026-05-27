// 编辑器 Store
import { create } from 'zustand';
import { chapterApi } from '../api/chapter';

const useEditorStore = create((set, get) => ({
  content: '',
  isDirty: false,
  isSaving: false,
  lastSaved: null,
  autoSaveTimer: null,

  // 设置内容
  setContent: (content) => {
    set({ content, isDirty: true });
  },

  // 保存内容（防抖）
  saveContent: async (chapterId, delay = 500) => {
    const { content, autoSaveTimer, isSaving } = get();
    
    // 清除之前的定时器
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    // 设置新的定时器
    const timer = setTimeout(async () => {
      if (isSaving) return;
      set({ isSaving: true });
      
      try {
        await chapterApi.writeContent(chapterId, content);
        set({ isDirty: false, isSaving: false, lastSaved: new Date() });
      } catch (e) {
        console.error('保存失败:', e);
        set({ isSaving: false });
      }
    }, delay);

    set({ autoSaveTimer: timer });
  },

  // 立即保存
  saveNow: async (chapterId) => {
    const { content } = get();
    set({ isSaving: true });
    
    try {
      await chapterApi.writeContent(chapterId, content);
      set({ isDirty: false, isSaving: false, lastSaved: new Date() });
    } catch (e) {
      console.error('保存失败:', e);
      set({ isSaving: false });
    }
  },

  // 获取备份
  getBackups: async (chapterId) => {
    return chapterApi.getBackups(chapterId);
  },

  // 恢复备份
  restoreBackup: async (chapterId, backupPath) => {
    await chapterApi.restoreBackup(chapterId, backupPath);
    // 重新加载内容
    const content = await chapterApi.readContent(chapterId);
    set({ content, isDirty: false });
  },
}));

export default useEditorStore;

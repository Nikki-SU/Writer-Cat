// AI Store
import { create } from 'zustand';
import { aiApi } from '../api/ai';

const useAiStore = create((set, get) => ({
  isChecking: false,
  isExtracting: false,
  checkResult: null,
  extractResult: null,
  aiPanelOpen: false,
  aiToolExpanded: null,

  // 检查文本
  checkText: async (text, bookId) => {
    set({ isChecking: true, checkResult: null });
    try {
      const result = await aiApi.checkText(text, bookId);
      set({ isChecking: false, checkResult: result });
      return result;
    } catch (e) {
      set({ isChecking: false });
      console.error('AI 检查失败:', e);
      throw e;
    }
  },

  // 提取实体
  extractEntities: async (text, bookId) => {
    set({ isExtracting: true, extractResult: null });
    try {
      const result = await aiApi.extractEntities(text, bookId);
      set({ isExtracting: false, extractResult: result });
      return result;
    } catch (e) {
      set({ isExtracting: false });
      console.error('AI 提取失败:', e);
      throw e;
    }
  },

  // 生成文本
  generateText: async (prompt, context) => {
    try {
      return await aiApi.generateText(prompt, context);
    } catch (e) {
      console.error('AI 生成失败:', e);
      throw e;
    }
  },

  // 切换 AI 面板
  toggleAiPanel: () => set((state) => ({ aiPanelOpen: !state.aiPanelOpen })),

  // 展开/收起工具
  setAiToolExpanded: (tool) => set({ aiToolExpanded: tool }),

  // 接受检查结果
  acceptTypo: (typo) => {
    // 实际应用中，这里应该调用编辑器替换文本
    console.log('接受错别字修正:', typo);
  },

  // 拒绝检查结果
  rejectCheck: (item) => {
    console.log('拒绝检查结果:', item);
  },

  // 添加提取的人物
  addExtractedCharacter: (character) => {
    // 实际应用中，这里应该添加到人物管理
    console.log('添加人物:', character);
  },

  // 添加提取的伏笔
  addExtractedForeshadow: (foreshadow) => {
    console.log('添加伏笔:', foreshadow);
  },

  // 清除结果
  clearResults: () => set({ checkResult: null, extractResult: null }),
}));

export default useAiStore;

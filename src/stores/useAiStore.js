// AI Store
import { create } from 'zustand';
import { aiApi } from '../api/ai';

const useAiStore = create((set, get) => ({
  isChecking: false,
  isExtracting: false,
  checkResults: {},
  extractResults: {},
  checkErrors: {},
  extractErrors: {},
  aiPanelOpen: false,
  aiToolExpanded: null,

  // 检查文本（统一入口）
  checkText: async (text, bookId, type = 'typo') => {
    set((state) => ({
      isChecking: true,
      checkErrors: { ...state.checkErrors, [type]: null }
    }));
    try {
      const result = await aiApi.checkText(text, bookId);
      set((state) => ({
        isChecking: false,
        checkResults: { ...state.checkResults, [type]: result.typos || [] }
      }));
      return result;
    } catch (e) {
      set((state) => ({
        isChecking: false,
        checkErrors: { ...state.checkErrors, [type]: e.toString() }
      }));
      console.error('AI 检查失败:', e);
      throw e;
    }
  },

  // 检查世界观冲突
  checkWorldviewConflict: async (text, bookId) => {
    const result = await get().checkText(text, bookId, 'worldview_conflict');
    set((state) => ({
      checkResults: { ...state.checkResults, worldview_conflict: result.worldview_conflicts || [] }
    }));
    return result;
  },

  // 检查人设冲突
  checkCharacterConflict: async (text, bookId) => {
    const result = await get().checkText(text, bookId, 'character_conflict');
    set((state) => ({
      checkResults: { ...state.checkResults, character_conflict: result.character_conflicts || [] }
    }));
    return result;
  },

  // 提取实体（统一入口）
  extractEntities: async (text, bookId) => {
    set((state) => ({
      isExtracting: true,
      extractResults: {},
      extractErrors: {}
    }));
    try {
      const result = await aiApi.extractEntities(text, bookId);
      set({
        isExtracting: false,
        extractResults: {
          characters: result.characters || [],
          timeline: result.timeline || [],
          foreshadow: result.foreshadows || [],
          worldview: result.worldviews || []
        }
      });
      return result;
    } catch (e) {
      set({ isExtracting: false });
      console.error('AI 提取失败:', e);
      throw e;
    }
  },

  // 提取人物
  extractCharacters: async (text, bookId) => {
    const result = await get().extractEntities(text, bookId);
    return result.characters;
  },

  // 提取大事记
  extractTimeline: async (text, bookId) => {
    const result = await get().extractEntities(text, bookId);
    return result.timeline;
  },

  // 提取伏笔
  extractForeshadows: async (text, bookId) => {
    const result = await get().extractEntities(text, bookId);
    return result.foreshadows;
  },

  // 提取世界观
  extractWorldviews: async (text, bookId) => {
    const result = await get().extractEntities(text, bookId);
    return result.worldviews;
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

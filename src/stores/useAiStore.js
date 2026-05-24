// AI面板状态管理
import { create } from 'zustand';
import * as aiApi from '../api/ai';

// AI面板类型
export const AI_PANELS = {
  SPELLING: 'spelling',           // 错别字检查
  WORLDVIEW_CHECK: 'worldview-check', // 世界观冲突检查
  CHARACTER_CHECK: 'character-check', // 人设冲突检查
  EXTRACT_CHARACTER: 'extract-character',   // 提取人物
  EXTRACT_TIMELINE: 'extract-timeline',     // 提取大事记
  EXTRACT_FORESHADOW: 'extract-foreshadow', // 提取伏笔
  EXTRACT_WORLDVIEW: 'extract-worldview',   // 提取世界观
};

export const useAiStore = create((set, get) => ({
  // AI面板状态
  activePanel: null, // null | AI_PANELS 中的值
  isProcessing: false,
  error: null,

  // 检查结果
  spellingErrors: [],
  worldviewConflicts: [],
  characterConflicts: [],

  // 提取结果
  extractedCharacters: [],
  extractedTimeline: [],
  extractedForeshadow: null,
  extractedWorldview: null,

  // 选中文字（用于AI提取）
  selectedText: '',
  selectedRange: null,

  /**
   * 设置当前激活的面板
   * @param {string} panel - 面板类型
   */
  setActivePanel: (panel) => {
    // 如果点击的是同一个面板，则收起
    if (get().activePanel === panel) {
      set({ activePanel: null });
    } else {
      set({ activePanel: panel });
    }
  },

  /**
   * 收起AI面板
   */
  clearPanel: () => {
    set({ activePanel: null });
  },

  /**
   * 设置选中文字
   * @param {string} text - 选中的文字
   * @param {Object} range - 选中范围 { start, end }
   */
  setSelectedText: (text, range = null) => {
    set({ selectedText: text, selectedRange: range });
  },

  /**
   * 清除选中文字
   */
  clearSelectedText: () => {
    set({ selectedText: '', selectedRange: null });
  },

  // ==================== AI检查功能 ====================

  /**
   * 错别字检查
   * @param {string} text - 待检查文本
   */
  checkSpelling: async (text) => {
    set({ isProcessing: true, error: null, activePanel: AI_PANELS.SPELLING });
    try {
      const errors = await aiApi.checkSpelling(text);
      set({ spellingErrors: errors, isProcessing: false });
    } catch (error) {
      console.error('错别字检查失败:', error);
      set({ error: error.message, isProcessing: false });
    }
  },

  /**
   * 接受错别字修改
   * @param {number} index - 错误索引
   */
  acceptSpellingFix: (index) => {
    const { spellingErrors } = get();
    if (index >= 0 && index < spellingErrors.length) {
      const newErrors = spellingErrors.filter((_, i) => i !== index);
      set({ spellingErrors: newErrors });
    }
  },

  /**
   * 拒绝错别字修改
   * @param {number} index - 错误索引
   */
  rejectSpellingFix: (index) => {
    const { spellingErrors } = get();
    if (index >= 0 && index < spellingErrors.length) {
      const newErrors = spellingErrors.filter((_, i) => i !== index);
      set({ spellingErrors: newErrors });
    }
  },

  /**
   * 世界观冲突检查
   * @param {string} text - 待检查文本
   * @param {Array} worldviews - 世界观列表
   */
  checkWorldviewConflict: async (text, worldviews) => {
    set({ isProcessing: true, error: null, activePanel: AI_PANELS.WORLDVIEW_CHECK });
    try {
      const conflicts = await aiApi.checkWorldviewConflict(text, worldviews);
      set({ worldviewConflicts: conflicts, isProcessing: false });
    } catch (error) {
      console.error('世界观冲突检查失败:', error);
      set({ error: error.message, isProcessing: false });
    }
  },

  /**
   * 人设冲突检查
   * @param {string} text - 待检查文本
   * @param {Array} characters - 人物列表
   */
  checkCharacterConflict: async (text, characters) => {
    set({ isProcessing: true, error: null, activePanel: AI_PANELS.CHARACTER_CHECK });
    try {
      const conflicts = await aiApi.checkCharacterConflict(text, characters);
      set({ characterConflicts: conflicts, isProcessing: false });
    } catch (error) {
      console.error('人设冲突检查失败:', error);
      set({ error: error.message, isProcessing: false });
    }
  },

  /**
   * 忽略冲突
   * @param {string} panelType - 面板类型
   * @param {number} index - 冲突索引
   */
  dismissConflict: (panelType, index) => {
    if (panelType === AI_PANELS.WORLDVIEW_CHECK) {
      const { worldviewConflicts } = get();
      if (index >= 0 && index < worldviewConflicts.length) {
        set({ worldviewConflicts: worldviewConflicts.filter((_, i) => i !== index) });
      }
    } else if (panelType === AI_PANELS.CHARACTER_CHECK) {
      const { characterConflicts } = get();
      if (index >= 0 && index < characterConflicts.length) {
        set({ characterConflicts: characterConflicts.filter((_, i) => i !== index) });
      }
    }
  },

  // ==================== AI提取功能 ====================

  /**
   * 提取人物
   * @param {string} text - 待检查文本
   * @param {Array} knownCharacters - 已有人物列表
   */
  detectCharacters: async (text, knownCharacters = []) => {
    set({ isProcessing: true, error: null, activePanel: AI_PANELS.EXTRACT_CHARACTER });
    try {
      const characters = await aiApi.detectCharacters(text, knownCharacters);
      set({ extractedCharacters: characters, isProcessing: false });
      return characters;
    } catch (error) {
      console.error('提取人物失败:', error);
      set({ error: error.message, isProcessing: false });
      throw error;
    }
  },

  /**
   * 生成时间线
   * @param {string} characterName - 人物名称
   * @param {string} bookId - 书籍ID
   * @param {Array} allChapters - 所有章节内容
   * @param {string} chapterId - 当前章节ID
   */
  generateTimeline: async (characterName, bookId, allChapters = [], chapterId = null) => {
    set({ isProcessing: true, error: null, activePanel: AI_PANELS.EXTRACT_TIMELINE });
    try {
      const timeline = await aiApi.generateTimeline(characterName, bookId, true, chapterId);
      set({ extractedTimeline: timeline, isProcessing: false });
      return timeline;
    } catch (error) {
      console.error('生成时间线失败:', error);
      set({ error: error.message, isProcessing: false });
      throw error;
    }
  },

  /**
   * 提取伏笔（基于选中文本）
   * @param {string} text - 选中的文本
   */
  extractForeshadow: async (text) => {
    if (!text || !text.trim()) {
      set({ error: '请先选中要提取为伏笔的文字' });
      return null;
    }
    set({ isProcessing: true, error: null, activePanel: AI_PANELS.EXTRACT_FORESHADOW });
    try {
      const summary = await aiApi.summarizeText(text, 50);
      set({ extractedForeshadow: { original: text, summary }, isProcessing: false });
      return summary;
    } catch (error) {
      console.error('提取伏笔失败:', error);
      set({ error: error.message, isProcessing: false });
      throw error;
    }
  },

  /**
   * 提取世界观（基于选中文本）
   * @param {string} text - 选中的文本
   */
  extractWorldview: async (text) => {
    if (!text || !text.trim()) {
      set({ error: '请先选中要提取为世界观的文字' });
      return null;
    }
    set({ isProcessing: true, error: null, activePanel: AI_PANELS.EXTRACT_WORLDVIEW });
    try {
      const summary = await aiApi.summarizeText(text, 100);
      set({ extractedWorldview: { original: text, summary }, isProcessing: false });
      return summary;
    } catch (error) {
      console.error('提取世界观失败:', error);
      set({ error: error.message, isProcessing: false });
      throw error;
    }
  },

  /**
   * 清除提取结果
   * @param {string} type - 提取类型
   */
  clearExtraction: (type) => {
    switch (type) {
      case AI_PANELS.EXTRACT_CHARACTER:
        set({ extractedCharacters: [] });
        break;
      case AI_PANELS.EXTRACT_TIMELINE:
        set({ extractedTimeline: [] });
        break;
      case AI_PANELS.EXTRACT_FORESHADOW:
        set({ extractedForeshadow: null });
        break;
      case AI_PANELS.EXTRACT_WORLDVIEW:
        set({ extractedWorldview: null });
        break;
    }
  },

  /**
   * 清除所有检查结果
   */
  clearAllResults: () => {
    set({
      spellingErrors: [],
      worldviewConflicts: [],
      characterConflicts: [],
      extractedCharacters: [],
      extractedTimeline: [],
      extractedForeshadow: null,
      extractedWorldview: null,
    });
  },

  /**
   * 重置AI状态
   */
  reset: () => {
    set({
      activePanel: null,
      isProcessing: false,
      error: null,
      spellingErrors: [],
      worldviewConflicts: [],
      characterConflicts: [],
      extractedCharacters: [],
      extractedTimeline: [],
      extractedForeshadow: null,
      extractedWorldview: null,
      selectedText: '',
      selectedRange: null,
    });
  },
}));

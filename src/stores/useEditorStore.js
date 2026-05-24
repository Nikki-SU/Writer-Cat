// 编辑器状态管理
import { create } from 'zustand';

export const useEditorStore = create((set, get) => ({
  // 编辑器内容
  content: '',
  originalContent: '',
  
  // 编辑器状态
  isDirty: false,
  isSaving: false,
  lastSaved: null,
  
  // 选择状态
  selection: { start: 0, end: 0 },
  selectedText: '',
  
  // 工具栏状态
  showToolbar: true,
  
  // 错别字检查
  spellingErrors: [],
  currentErrorIndex: -1,
  showSpellingPanel: false,
  
  // AI功能
  isAiProcessing: false,
  aiProcessingType: null,
  
  // 选中文字高亮标记
  highlightedRanges: {
    spelling: [],  // [{ start, end, suggestion }]
    worldview: [], // [{ start, end, conflict }]
    character: [], // [{ start, end, conflict }]
  },
  
  // 设置内容
  setContent: (content) => {
    const { originalContent } = get();
    set({
      content,
      isDirty: content !== originalContent,
    });
  },
  
  // 标记已保存
  markSaved: () => {
    const { content } = get();
    set({
      originalContent: content,
      isDirty: false,
      lastSaved: new Date(),
    });
  },
  
  // 设置选择
  setSelection: (start, end) => {
    const { content } = get();
    set({
      selection: { start, end },
      selectedText: content.substring(start, end),
    });
  },
  
  // 开始AI处理
  startAiProcessing: (type) => {
    set({ isAiProcessing: true, aiProcessingType: type });
  },
  
  // 结束AI处理
  endAiProcessing: () => {
    set({ isAiProcessing: false, aiProcessingType: null });
  },
  
  // 设置错别字
  setSpellingErrors: (errors) => {
    set({
      spellingErrors: errors,
      currentErrorIndex: errors.length > 0 ? 0 : -1,
      highlightedRanges: {
        ...get().highlightedRanges,
        spelling: errors.map((e) => ({
          start: e.start,
          end: e.end,
          suggestion: e.suggestion,
        })),
      },
    });
  },
  
  // 接受错别字修改
  acceptError: (index) => {
    const { spellingErrors } = get();
    if (index >= 0 && index < spellingErrors.length) {
      const error = spellingErrors[index];
      // 应用修改
      const { content } = get();
      const newContent = 
        content.substring(0, error.start) + 
        error.suggestion + 
        content.substring(error.end);
      set({
        content: newContent,
        originalContent: newContent,
        isDirty: false,
        lastSaved: new Date(),
      });
      // 移除已处理的错误
      const newErrors = spellingErrors.filter((_, i) => i !== index);
      set({
        spellingErrors: newErrors,
        currentErrorIndex: Math.min(index, newErrors.length - 1),
        highlightedRanges: {
          ...get().highlightedRanges,
          spelling: newErrors.map((e) => ({
            start: e.start,
            end: e.end,
            suggestion: e.suggestion,
          })),
        },
      });
    }
  },
  
  // 拒绝错别字修改
  rejectError: (index) => {
    const { spellingErrors } = get();
    if (index >= 0 && index < spellingErrors.length) {
      const newErrors = spellingErrors.filter((_, i) => i !== index);
      set({
        spellingErrors: newErrors,
        currentErrorIndex: Math.min(index, newErrors.length - 1),
        highlightedRanges: {
          ...get().highlightedRanges,
          spelling: newErrors.map((e) => ({
            start: e.start,
            end: e.end,
            suggestion: e.suggestion,
          })),
        },
      });
    }
  },
  
  // 设置世界观冲突高亮
  setWorldviewConflicts: (conflicts) => {
    set({
      highlightedRanges: {
        ...get().highlightedRanges,
        worldview: conflicts.map((c) => ({
          start: c.start,
          end: c.end,
          conflict: c,
        })),
      },
    });
  },
  
  // 设置人设冲突高亮
  setCharacterConflicts: (conflicts) => {
    set({
      highlightedRanges: {
        ...get().highlightedRanges,
        character: conflicts.map((c) => ({
          start: c.start,
          end: c.end,
          conflict: c,
        })),
      },
    });
  },
  
  // 清除特定类型的高亮
  clearHighlight: (type) => {
    set({
      highlightedRanges: {
        ...get().highlightedRanges,
        [type]: [],
      },
    });
  },
  
  // 清除所有高亮
  clearAllHighlights: () => {
    set({
      highlightedRanges: {
        spelling: [],
        worldview: [],
        character: [],
      },
    });
  },
  
  // 切换错别字面板
  toggleSpellingPanel: () => {
    set((state) => ({ showSpellingPanel: !state.showSpellingPanel }));
  },
  
  // 重置编辑器
  reset: () => {
    set({
      content: '',
      originalContent: '',
      isDirty: false,
      isSaving: false,
      lastSaved: null,
      selection: { start: 0, end: 0 },
      selectedText: '',
      spellingErrors: [],
      currentErrorIndex: -1,
      showSpellingPanel: false,
      isAiProcessing: false,
      aiProcessingType: null,
      highlightedRanges: {
        spelling: [],
        worldview: [],
        character: [],
      },
    });
  },
}));

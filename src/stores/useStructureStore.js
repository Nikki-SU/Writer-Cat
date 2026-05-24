// 结构状态管理（伏笔+世界观+线索/长伏笔）
import { create } from 'zustand';
import * as structureApi from '../api/structure';
import * as threadApi from '../api/thread';

export const useStructureStore = create((set, get) => ({
  // 状态
  foreshadows: [],
  worldviews: [],
  threads: [],
  threadNodes: {}, // { threadId: [nodes] }
  loading: false,
  error: null,
  currentWorldviewChapters: [], // 当前查看的世界观挂载的章节

  // ==================== 伏笔管理 ====================

  /**
   * 加载书籍的伏笔
   * @param {string} bookId - 书籍ID
   */
  loadForeshadows: async (bookId) => {
    set({ loading: true, error: null });
    try {
      const foreshadows = await structureApi.getForeshadows(bookId);
      set({ foreshadows, loading: false });
    } catch (error) {
      console.error('加载伏笔失败:', error);
      set({ error: error.message, loading: false });
    }
  },

  /**
   * 创建伏笔
   * @param {Object} data - 包含 bookId, name, buryChapterId, buryChapterTitle, buryContent
   */
  createForeshadow: async (data) => {
    set({ loading: true, error: null });
    try {
      const foreshadow = await structureApi.createForeshadow(data);
      set((state) => ({
        foreshadows: [...state.foreshadows, foreshadow],
        loading: false,
      }));
      return foreshadow;
    } catch (error) {
      console.error('创建伏笔失败:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /**
   * 更新伏笔
   * @param {string} id - 伏笔ID
   * @param {Object} updates - 可更新字段
   */
  updateForeshadow: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const foreshadow = await structureApi.updateForeshadow(id, updates);
      set((state) => ({
        foreshadows: state.foreshadows.map((f) => (f.id === id ? foreshadow : f)),
        loading: false,
      }));
      return foreshadow;
    } catch (error) {
      console.error('更新伏笔失败:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /**
   * 删除伏笔
   * @param {string} id - 伏笔ID
   */
  deleteForeshadow: async (id) => {
    set({ loading: true, error: null });
    try {
      await structureApi.deleteForeshadow(id);
      set((state) => ({
        foreshadows: state.foreshadows.filter((f) => f.id !== id),
        loading: false,
      }));
    } catch (error) {
      console.error('删除伏笔失败:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // ==================== 世界观管理 ====================

  /**
   * 加载书籍的世界观
   * @param {string} bookId - 书籍ID
   */
  loadWorldviews: async (bookId) => {
    set({ loading: true, error: null });
    try {
      const worldviews = await structureApi.getWorldviews(bookId);
      set({ worldviews, loading: false });
    } catch (error) {
      console.error('加载世界观失败:', error);
      set({ error: error.message, loading: false });
    }
  },

  /**
   * 创建世界观
   * @param {Object} data - 包含 bookId, name, description
   */
  createWorldview: async (data) => {
    set({ loading: true, error: null });
    try {
      const worldview = await structureApi.createWorldview(data);
      set((state) => ({
        worldviews: [...state.worldviews, worldview],
        loading: false,
      }));
      return worldview;
    } catch (error) {
      console.error('创建世界观失败:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /**
   * 更新世界观
   * @param {string} id - 世界观ID
   * @param {Object} updates - 可更新字段
   */
  updateWorldview: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const worldview = await structureApi.updateWorldview(id, updates);
      set((state) => ({
        worldviews: state.worldviews.map((w) => (w.id === id ? worldview : w)),
        loading: false,
      }));
      return worldview;
    } catch (error) {
      console.error('更新世界观失败:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /**
   * 删除世界观
   * @param {string} id - 世界观ID
   */
  deleteWorldview: async (id) => {
    set({ loading: true, error: null });
    try {
      await structureApi.deleteWorldview(id);
      set((state) => ({
        worldviews: state.worldviews.filter((w) => w.id !== id),
        loading: false,
      }));
    } catch (error) {
      console.error('删除世界观失败:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /**
   * 挂载世界观到章节
   * @param {string} worldviewId - 世界观ID
   * @param {string} chapterId - 章节ID
   * @param {string} position - 位置标记（可选）
   */
  attachWorldview: async (worldviewId, chapterId, position = '') => {
    set({ loading: true, error: null });
    try {
      await structureApi.attachWorldviewToChapter(worldviewId, chapterId, position);
      // 重新加载世界观挂载的章节
      const chapters = await structureApi.getWorldviewChapters(worldviewId);
      set({ currentWorldviewChapters: chapters, loading: false });
    } catch (error) {
      console.error('挂载世界观失败:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /**
   * 从章节解绑世界观
   * @param {string} worldviewId - 世界观ID
   * @param {string} chapterId - 章节ID
   */
  detachWorldview: async (worldviewId, chapterId) => {
    set({ loading: true, error: null });
    try {
      await structureApi.detachWorldviewFromChapter(worldviewId, chapterId);
      // 重新加载世界观挂载的章节
      const chapters = await structureApi.getWorldviewChapters(worldviewId);
      set({ currentWorldviewChapters: chapters, loading: false });
    } catch (error) {
      console.error('解绑世界观失败:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /**
   * 加载世界观挂载的章节
   * @param {string} worldviewId - 世界观ID
   */
  loadWorldviewChapters: async (worldviewId) => {
    try {
      const chapters = await structureApi.getWorldviewChapters(worldviewId);
      set({ currentWorldviewChapters: chapters });
    } catch (error) {
      console.error('加载世界观章节失败:', error);
    }
  },

  // ==================== 线索/长伏笔管理 ====================

  /**
   * 加载书籍的线索/长伏笔
   * @param {string} bookId - 书籍ID
   */
  loadThreads: async (bookId) => {
    set({ loading: true, error: null });
    try {
      const threads = await threadApi.getThreads(bookId);
      set({ threads, loading: false });
    } catch (error) {
      console.error('加载线索失败:', error);
      set({ error: error.message, loading: false });
    }
  },

  /**
   * 创建线索/长伏笔
   * @param {Object} data - 包含 bookId, name, threadType
   */
  createThread: async (data) => {
    set({ loading: true, error: null });
    try {
      const thread = await threadApi.createThread(data);
      set((state) => ({
        threads: [...state.threads, thread],
        loading: false,
      }));
      return thread;
    } catch (error) {
      console.error('创建线索失败:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /**
   * 更新线索/长伏笔
   * @param {string} id - 线索ID
   * @param {Object} updates - 可更新字段
   */
  updateThread: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const thread = await threadApi.updateThread(id, updates);
      set((state) => ({
        threads: state.threads.map((t) => (t.id === id ? thread : t)),
        loading: false,
      }));
      return thread;
    } catch (error) {
      console.error('更新线索失败:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /**
   * 删除线索/长伏笔
   * @param {string} id - 线索ID
   */
  deleteThread: async (id) => {
    set({ loading: true, error: null });
    try {
      await threadApi.deleteThread(id);
      set((state) => {
        const newThreadNodes = { ...state.threadNodes };
        delete newThreadNodes[id];
        return {
          threads: state.threads.filter((t) => t.id !== id),
          threadNodes: newThreadNodes,
          loading: false,
        };
      });
    } catch (error) {
      console.error('删除线索失败:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /**
   * 加载线索的节点
   * @param {string} threadId - 线索ID
   */
  loadThreadNodes: async (threadId) => {
    try {
      const nodes = await threadApi.getThreadNodes(threadId);
      set((state) => ({
        threadNodes: { ...state.threadNodes, [threadId]: nodes },
      }));
    } catch (error) {
      console.error('加载线索节点失败:', error);
    }
  },

  /**
   * 创建线索节点
   * @param {Object} data - 包含 threadId, content, orderIndex
   */
  createThreadNode: async (data) => {
    try {
      const node = await threadApi.createThreadNode(data);
      set((state) => ({
        threadNodes: {
          ...state.threadNodes,
          [data.threadId]: [...(state.threadNodes[data.threadId] || []), node],
        },
      }));
      return node;
    } catch (error) {
      console.error('创建线索节点失败:', error);
      throw error;
    }
  },

  /**
   * 更新线索节点
   * @param {string} id - 节点ID
   * @param {Object} updates - 可更新字段
   */
  updateThreadNode: async (id, updates) => {
    try {
      const node = await threadApi.updateThreadNode(id, updates);
      // 需要找到对应的 threadId 并更新
      set((state) => {
        const newThreadNodes = { ...state.threadNodes };
        for (const threadId of Object.keys(newThreadNodes)) {
          const nodes = newThreadNodes[threadId];
          const idx = nodes.findIndex((n) => n.id === id);
          if (idx !== -1) {
            newThreadNodes[threadId] = [...nodes];
            newThreadNodes[threadId][idx] = node;
            break;
          }
        }
        return { threadNodes: newThreadNodes };
      });
      return node;
    } catch (error) {
      console.error('更新线索节点失败:', error);
      throw error;
    }
  },

  /**
   * 删除线索节点
   * @param {string} id - 节点ID
   */
  deleteThreadNode: async (id) => {
    try {
      await threadApi.deleteThreadNode(id);
      set((state) => {
        const newThreadNodes = { ...state.threadNodes };
        for (const threadId of Object.keys(newThreadNodes)) {
          const nodes = newThreadNodes[threadId];
          const filtered = nodes.filter((n) => n.id !== id);
          if (filtered.length !== nodes.length) {
            newThreadNodes[threadId] = filtered;
            break;
          }
        }
        return { threadNodes: newThreadNodes };
      });
    } catch (error) {
      console.error('删除线索节点失败:', error);
      throw error;
    }
  },

  /**
   * 重新排序线索节点
   * @param {string} threadId - 线索ID
   * @param {string[]} nodeIds - 节点ID数组
   */
  reorderThreadNodes: async (threadId, nodeIds) => {
    try {
      await threadApi.reorderThreadNodes(threadId, nodeIds);
      // 重新加载节点以获取更新后的顺序
      await get().loadThreadNodes(threadId);
    } catch (error) {
      console.error('排序线索节点失败:', error);
      throw error;
    }
  },

  /**
   * 获取未完成的伏笔
   */
  getIncompleteForeshadows: () => {
    return get().foreshadows.filter((f) => !f.completed);
  },

  /**
   * 获取已完成的伏笔
   */
  getCompletedForeshadows: () => {
    return get().foreshadows.filter((f) => f.completed);
  },

  /**
   * 获取未完成的线索
   */
  getIncompleteThreads: () => {
    return get().threads.filter((t) => !t.resolved);
  },

  /**
   * 获取已完成的线索
   */
  getCompletedThreads: () => {
    return get().threads.filter((t) => t.resolved);
  },

  /**
   * 重置状态
   */
  reset: () => {
    set({
      foreshadows: [],
      worldviews: [],
      threads: [],
      threadNodes: {},
      currentWorldviewChapters: [],
      loading: false,
      error: null,
    });
  },
}));

// fix: 结构和伏笔 Store
import { create } from 'zustand';
import { structureApi } from '../api/structure';
import { threadApi } from '../api/thread';

const useStructureStore = create((set, get) => ({
  foreshadows: [],
  worldviews: [],
  worldviewMounts: [],
  threads: [],
  loading: false,

  // 加载结构数据
  loadStructures: async (bookId) => {
    if (!bookId) return;
    set({ loading: true });
    try {
      const [structures, threads] = await Promise.all([
        structureApi.getStructures(bookId),
        threadApi.getThreads(bookId),
      ]);
      set({
        foreshadows: structures.foreshadows,
        worldviews: structures.worldviews,
        worldviewMounts: structures.worldview_mounts,
        threads,
        loading: false,
      });
    } catch (e) {
      console.error('加载结构数据失败:', e);
      set({ loading: false });
    }
  },

  // 创建伏笔
  createForeshadow: async (bookId, title, description, buriedChapterId) => {
    try {
      const foreshadow = await structureApi.createForeshadow({
        book_id: bookId,
        title,
        description,
        buried_chapter_id: buriedChapterId,
      });
      set((state) => ({ foreshadows: [...state.foreshadows, foreshadow] }));
      return foreshadow;
    } catch (e) {
      console.error('创建伏笔失败:', e);
      throw e;
    }
  },

  // 更新伏笔
  updateForeshadow: async (id, data) => {
    try {
      const foreshadow = await structureApi.updateForeshadow(id, data);
      set((state) => ({
        foreshadows: state.foreshadows.map((f) => (f.id === id ? foreshadow : f)),
      }));
      return foreshadow;
    } catch (e) {
      console.error('更新伏笔失败:', e);
      throw e;
    }
  },

  // 删除伏笔
  deleteForeshadow: async (id) => {
    try {
      await structureApi.deleteForeshadow(id);
      set((state) => ({
        foreshadows: state.foreshadows.filter((f) => f.id !== id),
      }));
    } catch (e) {
      console.error('删除伏笔失败:', e);
      throw e;
    }
  },

  // 解决伏笔（双向互锁）
  resolveForeshadow: async (id, resolvedChapterId) => {
    try {
      const foreshadow = await structureApi.resolveForeshadow(id, resolvedChapterId);
      set((state) => ({
        foreshadows: state.foreshadows.map((f) => (f.id === id ? foreshadow : f)),
      }));
      return foreshadow;
    } catch (e) {
      console.error('解决伏笔失败:', e);
      throw e;
    }
  },

  // 创建世界观
  createWorldview: async (bookId, title, content, category) => {
    try {
      const worldview = await structureApi.createWorldview({
        book_id: bookId,
        title,
        content,
        category,
      });
      set((state) => ({ worldviews: [...state.worldviews, worldview] }));
      return worldview;
    } catch (e) {
      console.error('创建世界观失败:', e);
      throw e;
    }
  },

  // 更新世界观
  updateWorldview: async (id, data) => {
    try {
      const worldview = await structureApi.updateWorldview(id, data);
      set((state) => ({
        worldviews: state.worldviews.map((w) => (w.id === id ? worldview : w)),
      }));
      return worldview;
    } catch (e) {
      console.error('更新世界观失败:', e);
      throw e;
    }
  },

  // 删除世界观
  deleteWorldview: async (id) => {
    try {
      await structureApi.deleteWorldview(id);
      set((state) => ({
        worldviews: state.worldviews.filter((w) => w.id !== id),
      }));
    } catch (e) {
      console.error('删除世界观失败:', e);
      throw e;
    }
  },

  // 挂载世界观到章节
  mountWorldview: async (worldviewId, chapterId) => {
    try {
      const mount = await structureApi.mountWorldview({
        worldview_id: worldviewId,
        chapter_id: chapterId,
      });
      set((state) => ({ worldviewMounts: [...state.worldviewMounts, mount] }));
      return mount;
    } catch (e) {
      console.error('挂载世界观失败:', e);
      throw e;
    }
  },

  // 创建线索
  createThread: async (bookId, title, threadType) => {
    try {
      const thread = await threadApi.createThread({
        book_id: bookId,
        title,
        thread_type: threadType,
      });
      set((state) => ({ threads: [...state.threads, thread] }));
      return thread;
    } catch (e) {
      console.error('创建线索失败:', e);
      throw e;
    }
  },

  // 更新线索
  updateThread: async (id, data) => {
    try {
      const thread = await threadApi.updateThread(id, data);
      set((state) => ({
        threads: state.threads.map((t) => (t.id === id ? { ...t, thread } : t)),
      }));
      return thread;
    } catch (e) {
      console.error('更新线索失败:', e);
      throw e;
    }
  },

  // 删除线索
  deleteThread: async (id) => {
    try {
      await threadApi.deleteThread(id);
      set((state) => ({
        threads: state.threads.filter((t) => t.id !== id),
      }));
    } catch (e) {
      console.error('删除线索失败:', e);
      throw e;
    }
  },

  // 添加线索节点
  addThreadNode: async (threadId, title, content, chapterId, parentNodeId, nodeType) => {
    try {
      const node = await threadApi.addThreadNode({
        thread_id: threadId,
        title,
        content,
        chapter_id: chapterId,
        parent_node_id: parentNodeId,
        node_type: nodeType,
      });
      set((state) => ({
        threads: state.threads.map((t) =>
          t.id === threadId ? { ...t, nodes: [...(t.nodes || []), node] } : t
        ),
      }));
      return node;
    } catch (e) {
      console.error('添加节点失败:', e);
      throw e;
    }
  },

  // 更新线索节点
  updateThreadNode: async (threadId, nodeId, data) => {
    try {
      const node = await threadApi.updateThreadNode(nodeId, data);
      set((state) => ({
        threads: state.threads.map((t) =>
          t.id === threadId
            ? { ...t, nodes: (t.nodes || []).map((n) => (n.id === nodeId ? node : n)) }
            : t
        ),
      }));
      return node;
    } catch (e) {
      console.error('更新节点失败:', e);
      throw e;
    }
  },

  // 删除线索节点
  deleteThreadNode: async (threadId, nodeId) => {
    try {
      await threadApi.deleteThreadNode(nodeId);
      set((state) => ({
        threads: state.threads.map((t) =>
          t.id === threadId
            ? { ...t, nodes: (t.nodes || []).filter((n) => n.id !== nodeId) }
            : t
        ),
      }));
    } catch (e) {
      console.error('删除节点失败:', e);
      throw e;
    }
  },
}));

export default useStructureStore;

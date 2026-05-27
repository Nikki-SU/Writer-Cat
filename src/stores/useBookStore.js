// 书籍 Store
import { create } from 'zustand';
import { bookApi } from '../api/book';
import { chapterApi } from '../api/chapter';

const useBookStore = create((set, get) => ({
  books: [],
  currentBook: null,
  chapters: [],
  currentChapter: null,
  loading: false,
  error: null,

  // 加载书籍列表
  loadBooks: async () => {
    set({ loading: true, error: null });
    try {
      const books = await bookApi.getBooks();
      set({ books, loading: false });
    } catch (e) {
      set({ error: e.toString(), loading: false });
    }
  },

  // 选择书籍
  selectBook: async (book) => {
    set({ currentBook: book, currentChapter: null, chapters: [] });
    if (book) {
      try {
        const chapters = await chapterApi.getChapters(book.id);
        set({ chapters });
      } catch (e) {
        console.error('加载章节失败:', e);
      }
    }
  },

  // 创建书籍
  createBook: async (title, description) => {
    try {
      const book = await bookApi.createBook({ title, description });
      set((state) => ({ books: [book, ...state.books] }));
      return book;
    } catch (e) {
      set({ error: e.toString() });
      throw e;
    }
  },

  // 更新书籍
  updateBook: async (id, data) => {
    try {
      const book = await bookApi.updateBook(id, data);
      set((state) => ({
        books: state.books.map((b) => (b.id === id ? book : b)),
        currentBook: state.currentBook?.id === id ? book : state.currentBook,
      }));
      return book;
    } catch (e) {
      set({ error: e.toString() });
      throw e;
    }
  },

  // 删除书籍
  deleteBook: async (id) => {
    try {
      await bookApi.deleteBook(id);
      set((state) => ({
        books: state.books.filter((b) => b.id !== id),
        currentBook: state.currentBook?.id === id ? null : state.currentBook,
      }));
    } catch (e) {
      set({ error: e.toString() });
      throw e;
    }
  },

  // 创建章节
  createChapter: async (title) => {
    const { currentBook } = get();
    if (!currentBook) return;
    try {
      const chapter = await chapterApi.createChapter({
        book_id: currentBook.id,
        title,
      });
      set((state) => ({ chapters: [...state.chapters, chapter] }));
      return chapter;
    } catch (e) {
      set({ error: e.toString() });
      throw e;
    }
  },

  // 选择章节
  selectChapter: async (chapter) => {
    set({ currentChapter: chapter });
    if (chapter) {
      try {
        const content = await chapterApi.readContent(chapter.id);
        set({ currentChapter: { ...chapter, content } });
      } catch (e) {
        console.error('加载章节内容失败:', e);
      }
    }
  },

  // 更新章节
  updateChapter: async (id, data) => {
    try {
      const chapter = await chapterApi.updateChapter(id, data);
      set((state) => ({
        chapters: state.chapters.map((c) => (c.id === id ? chapter : c)),
        currentChapter: state.currentChapter?.id === id ? chapter : state.currentChapter,
      }));
      return chapter;
    } catch (e) {
      set({ error: e.toString() });
      throw e;
    }
  },

  // 删除章节
  deleteChapter: async (id) => {
    try {
      await chapterApi.deleteChapter(id);
      set((state) => ({
        chapters: state.chapters.filter((c) => c.id !== id),
        currentChapter: state.currentChapter?.id === id ? null : state.currentChapter,
      }));
    } catch (e) {
      set({ error: e.toString() });
      throw e;
    }
  },

  // 重排序章节
  reorderChapters: async (orders) => {
    const { currentBook, chapters } = get();
    if (!currentBook) return;
    try {
      await chapterApi.reorderChapters({ book_id: currentBook.id, chapter_orders: orders });
      // 重新排序本地状态
      const ordered = orders.map((o) => chapters.find((c) => c.id === o.id));
      set({ chapters: ordered.filter(Boolean) });
    } catch (e) {
      set({ error: e.toString() });
      throw e;
    }
  },

  // 复制到剪贴板
  copyToClipboard: async (type) => {
    const { currentChapter } = get();
    if (!currentChapter) return;
    
    try {
      if (type === 'plain') {
        // 纯文本（移除 Markdown 格式）
        const text = currentChapter.content
          ?.replace(/#{1,6}\s+/g, '')
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .replace(/`/g, '') || '';
        await navigator.clipboard.writeText(text);
      } else {
        // Markdown 原文
        const md = await chapterApi.exportChapter(currentChapter.id);
        await navigator.clipboard.writeText(md);
      }
    } catch (e) {
      console.error('复制失败:', e);
    }
  },

  // 导出
  exportChapter: async () => {
    const { currentChapter } = get();
    if (!currentChapter) return;
    return chapterApi.exportChapter(currentChapter.id);
  },

  exportBook: async () => {
    const { currentBook } = get();
    if (!currentBook) return;
    return chapterApi.exportBook(currentBook.id);
  },
}));

export default useBookStore;

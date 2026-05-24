// 书籍状态管理
import { create } from 'zustand';
import * as bookApi from '../api/book';
import * as chapterApi from '../api/chapter';

export const useBookStore = create((set, get) => ({
  books: [],
  currentBook: null,
  chapters: [],
  currentChapter: null,
  loading: false,
  error: null,

  // 加载所有书籍
  loadBooks: async () => {
    set({ loading: true, error: null });
    try {
      const books = await bookApi.getBooks();
      set({ books, loading: false });
    } catch (error) {
      console.error('加载书籍失败:', error);
      set({ error: error.message, loading: false });
    }
  },

  // 选择书籍（同时加载章节列表）
  selectBook: async (bookId) => {
    set({ loading: true, error: null });
    try {
      const book = await bookApi.getBook(bookId);
      const chapters = await chapterApi.getChapters(bookId);
      // 按 orderIndex 排序
      chapters.sort((a, b) => a.order_index - b.order_index);
      set({ currentBook: book, chapters, currentChapter: null, loading: false });
    } catch (error) {
      console.error('选择书籍失败:', error);
      set({ error: error.message, loading: false });
    }
  },

  // 创建书籍
  createBook: async (name) => {
    set({ loading: true, error: null });
    try {
      const book = await bookApi.createBook(name);
      set((state) => ({ 
        books: [...state.books, book],
        currentBook: book,
        chapters: [],
        currentChapter: null,
        loading: false,
      }));
      return book;
    } catch (error) {
      console.error('创建书籍失败:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // 更新书籍
  updateBook: async (id, name) => {
    set({ loading: true, error: null });
    try {
      const book = await bookApi.updateBook(id, name);
      set((state) => ({
        books: state.books.map((b) => (b.id === id ? book : b)),
        currentBook: state.currentBook?.id === id ? book : state.currentBook,
        loading: false,
      }));
      return book;
    } catch (error) {
      console.error('更新书籍失败:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // 删除书籍（带确认）
  deleteBook: async (id) => {
    if (!window.confirm('确定要删除这本书吗？此操作不可恢复。')) {
      return false;
    }
    set({ loading: true, error: null });
    try {
      await bookApi.deleteBook(id);
      set((state) => ({
        books: state.books.filter((b) => b.id !== id),
        currentBook: state.currentBook?.id === id ? null : state.currentBook,
        chapters: state.currentBook?.id === id ? [] : state.chapters,
        currentChapter: state.currentBook?.id === id ? null : state.currentChapter,
        loading: false,
      }));
      return true;
    } catch (error) {
      console.error('删除书籍失败:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // 选择章节（加载章节内容）
  selectChapter: async (chapterId) => {
    try {
      const chapter = await chapterApi.getChapter(chapterId);
      set({ currentChapter: chapter });
    } catch (error) {
      console.error('选择章节失败:', error);
      set({ error: error.message });
    }
  },

  // 创建章节
  createChapter: async (title) => {
    const { currentBook, chapters } = get();
    if (!currentBook) return;
    
    set({ loading: true, error: null });
    try {
      const orderIndex = chapters.length;
      const chapter = await chapterApi.createChapter(currentBook.id, title, orderIndex);
      set((state) => ({
        chapters: [...state.chapters, chapter],
        currentChapter: chapter,
        loading: false,
      }));
      return chapter;
    } catch (error) {
      console.error('创建章节失败:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // 更新章节内容
  updateChapter: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const chapter = await chapterApi.updateChapter(id, updates);
      set((state) => ({
        chapters: state.chapters.map((c) => (c.id === id ? chapter : c)),
        currentChapter: state.currentChapter?.id === id ? chapter : state.currentChapter,
        loading: false,
      }));
      return chapter;
    } catch (error) {
      console.error('更新章节失败:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // 删除章节
  deleteChapter: async (id) => {
    if (!window.confirm('确定要删除这个章节吗？')) {
      return;
    }
    set({ loading: true, error: null });
    try {
      await chapterApi.deleteChapter(id);
      set((state) => ({
        chapters: state.chapters.filter((c) => c.id !== id),
        currentChapter: state.currentChapter?.id === id ? null : state.currentChapter,
        loading: false,
      }));
    } catch (error) {
      console.error('删除章节失败:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // 章节排序（上移）
  moveChapterUp: async (index) => {
    const { chapters } = get();
    if (index <= 0 || index >= chapters.length) return;
    
    const newChapters = [...chapters];
    [newChapters[index - 1], newChapters[index]] = [newChapters[index], newChapters[index - 1]];
    
    // 更新 orderIndex
    try {
      await chapterApi.updateChapter(newChapters[index - 1].id, { orderIndex: index - 1 });
      await chapterApi.updateChapter(newChapters[index].id, { orderIndex: index });
      set({ chapters: newChapters });
    } catch (error) {
      console.error('章节排序失败:', error);
    }
  },

  // 章节排序（下移）
  moveChapterDown: async (index) => {
    const { chapters } = get();
    if (index < 0 || index >= chapters.length - 1) return;
    
    const newChapters = [...chapters];
    [newChapters[index], newChapters[index + 1]] = [newChapters[index + 1], newChapters[index]];
    
    // 更新 orderIndex
    try {
      await chapterApi.updateChapter(newChapters[index].id, { orderIndex: index });
      await chapterApi.updateChapter(newChapters[index + 1].id, { orderIndex: index + 1 });
      set({ chapters: newChapters });
    } catch (error) {
      console.error('章节排序失败:', error);
    }
  },

  // 获取章节序号（从1开始）
  getChapterNumber: (chapterId) => {
    const { chapters } = get();
    const index = chapters.findIndex((c) => c.id === chapterId);
    return index >= 0 ? index + 1 : 0;
  },

  // 获取章节标题
  getChapterTitle: (chapterId) => {
    const { chapters } = get();
    const chapter = chapters.find((c) => c.id === chapterId);
    return chapter?.title || '';
  },

  // 重置状态
  reset: () => {
    set({
      books: [],
      currentBook: null,
      chapters: [],
      currentChapter: null,
      loading: false,
      error: null,
    });
  },
}));

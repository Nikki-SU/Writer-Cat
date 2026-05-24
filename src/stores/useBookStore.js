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
      set({ error: error.message, loading: false });
    }
  },

  // 选择书籍
  selectBook: async (bookId) => {
    set({ loading: true, error: null });
    try {
      const book = await bookApi.getBook(bookId);
      const chapters = await chapterApi.getChapters(bookId);
      set({ currentBook: book, chapters, currentChapter: null, loading: false });
    } catch (error) {
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
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // 删除书籍
  deleteBook: async (id) => {
    set({ loading: true, error: null });
    try {
      await bookApi.deleteBook(id);
      set((state) => ({
        books: state.books.filter((b) => b.id !== id),
        currentBook: state.currentBook?.id === id ? null : state.currentBook,
        chapters: state.currentBook?.id === id ? [] : state.chapters,
        currentChapter: null,
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // 选择章节
  selectChapter: async (chapterId) => {
    try {
      const chapter = await chapterApi.getChapter(chapterId);
      set({ currentChapter: chapter });
    } catch (error) {
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
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // 删除章节
  deleteChapter: async (id) => {
    set({ loading: true, error: null });
    try {
      await chapterApi.deleteChapter(id);
      set((state) => ({
        chapters: state.chapters.filter((c) => c.id !== id),
        currentChapter: state.currentChapter?.id === id ? null : state.currentChapter,
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));

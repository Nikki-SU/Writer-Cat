// 写作页（核心页面）
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useBookStore } from '../stores/useBookStore';
import { useEditorStore } from '../stores/useEditorStore';
import { useSettingsStore } from '../stores/settingsStore';
import LeftSidebar from '../components/Sidebar/LeftSidebar';
import NovelEditor from '../components/Editor/NovelEditor';
import SpellingReview from '../components/Editor/SpellingReview';
import { AUTO_SAVE_DELAY } from '../utils/constants';
import { debounce, countWords } from '../utils/helpers';

function Writer() {
  const navigate = useNavigate();
  const {
    currentBook,
    chapters,
    currentChapter,
    loadBooks,
    selectBook,
    selectChapter,
    createChapter,
    updateChapter,
  } = useBookStore();
  const {
    content,
    setContent,
    isDirty,
    markSaved,
    spellingErrors,
    showSpellingPanel,
    toggleSpellingPanel,
    setSpellingErrors,
  } = useEditorStore();
  const { settings } = useSettingsStore();

  const [showSidebar, setShowSidebar] = useState(true);
  const [editorRef, setEditorRef] = useState(null);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // 加载章节内容
  useEffect(() => {
    if (currentChapter) {
      setContent(currentChapter.content || '');
    }
  }, [currentChapter, setContent]);

  // 自动保存（500ms防抖）
  const saveContent = useCallback(
    debounce(async (content, chapterId) => {
      if (!chapterId || !content) return;
      try {
        await updateChapter(chapterId, {
          content,
          wordCount: countWords(content),
        });
        markSaved();
      } catch (error) {
        console.error('自动保存失败:', error);
      }
    }, AUTO_SAVE_DELAY),
    [updateChapter, markSaved]
  );

  // 内容变化时触发保存
  useEffect(() => {
    if (currentChapter && isDirty) {
      saveContent(content, currentChapter.id);
    }
  }, [content, currentChapter, isDirty, saveContent]);

  // 复制纯文本
  const handleCopyPlainText = async () => {
    // 简单处理：去除Markdown语法
    const plainText = content
      .replace(/#{1,6}\s/g, '') // 标题
      .replace(/\*\*(.*?)\*\*/g, '$1') // 粗体
      .replace(/\*(.*?)\*/g, '$1') // 斜体
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 链接
      .replace(/!\[(.*?)\]\(.*?\)/g, '[$1]') // 图片
      .replace(/`(.*?)`/g, '$1') // 行内代码
      .replace(/```[\s\S]*?```/g, '') // 代码块
      .trim();

    try {
      await navigator.clipboard.writeText(plainText);
      alert('已复制纯文本到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 复制Markdown
  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(content);
      alert('已复制Markdown到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  if (!currentBook) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">请先选择一本书</p>
          <Link to="/" className="text-primary hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* 上栏工具条 */}
      <header className="h-12 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700 flex items-center px-4 gap-4 flex-shrink-0">
        <Link
          to="/"
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
        >
          ← 返回
        </Link>

        <div className="flex-1 flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {currentBook.name}
          </span>
          {currentChapter && (
            <>
              <span className="text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">
                {currentChapter.title || '未命名章节'}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 字体大小 */}
          <select
            value={settings.fontSize}
            onChange={(e) => useSettingsStore.getState().setFontSize(Number(e.target.value))}
            className="px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value={14}>14px</option>
            <option value={16}>16px</option>
            <option value={18}>18px</option>
            <option value={20}>20px</option>
            <option value={24}>24px</option>
          </select>

          {/* 日夜间切换 */}
          <button
            onClick={() => useSettingsStore.getState().toggleDarkMode()}
            className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title={settings.darkMode ? '切换日间模式' : '切换夜间模式'}
          >
            {settings.darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* 主体区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左边栏 */}
        {showSidebar && (
          <LeftSidebar
            onClose={() => setShowSidebar(false)}
            editorRef={editorRef}
          />
        )}

        {/* 写作区 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <NovelEditor
            content={content}
            onChange={setContent}
            fontSize={settings.fontSize}
            darkMode={settings.darkMode}
            onEditorReady={setEditorRef}
          />
        </main>

        {/* 右边栏（AI审阅） */}
        {showSpellingPanel && (
          <SpellingReview
            errors={spellingErrors}
            onClose={toggleSpellingPanel}
            editorRef={editorRef}
          />
        )}
      </div>

      {/* 底部状态栏 */}
      <footer className="h-9 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 flex items-center px-4 gap-4 flex-shrink-0">
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>字数: {countWords(content).toLocaleString()}</span>
          {currentChapter && (
            <span>
              目标: {currentChapter.target_word_count || 3000}
            </span>
          )}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-xs text-yellow-500">● 未保存</span>
          )}
          {!isDirty && (
            <span className="text-xs text-green-500">✓ 已保存</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyPlainText}
            className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            复制纯文本
          </button>
          <button
            onClick={handleCopyMarkdown}
            className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            复制MD
          </button>
        </div>
      </footer>

      {/* 侧边栏切换按钮 */}
      {!showSidebar && (
        <button
          onClick={() => setShowSidebar(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 bg-gray-200 dark:bg-gray-700 px-2 py-4 rounded-r-lg shadow-md"
        >
          →
        </button>
      )}
    </div>
  );
}

export default Writer;

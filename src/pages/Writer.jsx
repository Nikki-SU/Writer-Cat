// 写作页（核心页面）- 三栏布局
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useBookStore } from '../stores/useBookStore';
import { useEditorStore } from '../stores/useEditorStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useAiStore } from '../stores/useAiStore';
import LeftSidebar from '../components/Sidebar/LeftSidebar';
import AIPanel from '../components/Sidebar/AIPanel';
import NovelEditor from '../components/Editor/NovelEditor';
import EditorToolbar from '../components/Editor/EditorToolbar';
import ContextMenu from '../components/Editor/ContextMenu';
import { AUTO_SAVE_DELAY } from '../utils/constants';
import { debounce, countWords, formatWordCount } from '../utils/helpers';

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
    setSelection,
    setSelectedText,
    spellingErrors,
    highlightedRanges,
  } = useEditorStore();
  const { settings, toggleDarkMode } = useSettingsStore();
  const { setSelectedText: setAiSelectedText } = useAiStore();

  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [editorInstance, setEditorInstance] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });

  // 加载书籍列表
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

  // 编辑器准备就绪
  const handleEditorReady = useCallback((instance) => {
    setEditorInstance(instance);
  }, []);

  // 选择变化
  const handleSelectionChange = useCallback((text, range) => {
    setSelection(range.start, range.end);
    setSelectedText(text);
    setAiSelectedText(text, range);
  }, [setSelection, setSelectedText, setAiSelectedText]);

  // 插入图片
  const handleInsertImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (file && editorInstance?.insertImage) {
        // TODO: 上传图片到本地assets目录
        const imageUrl = URL.createObjectURL(file);
        editorInstance.insertImage(imageUrl, file.name);
      }
    };
    input.click();
  }, [editorInstance]);

  // 复制纯文本
  const handleCopyPlainText = async () => {
    const plainText = content
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/!\[(.*?)\]\(.*?\)/g, '[$1]')
      .replace(/`(.*?)`/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
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

  // 右键菜单
  const handleContextMenu = (e) => {
    e.preventDefault();
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text) {
      setContextMenuPos({ x: e.clientX, y: e.clientY });
      setShowContextMenu(true);
    }
  };

  // AI概括
  const handleSummarize = async (selectedText) => {
    if (!selectedText) return;
    // TODO: 调用AI概括并插入
    console.log('AI概括:', selectedText);
  };

  // 提取伏笔
  const handleExtractForeshadow = (extracted) => {
    console.log('提取伏笔:', extracted);
    // TODO: 打开伏笔选择弹窗
  };

  // 提取世界观
  const handleExtractWorldview = (extracted) => {
    console.log('提取世界观:', extracted);
    // TODO: 打开世界观编辑弹窗
  };

  // 字数统计
  const wordCount = countWords(content);
  const wordCountTarget = currentChapter?.wordCountTarget || 3000;
  const wordCountPercent = Math.min(100, Math.round((wordCount / wordCountTarget) * 100));

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
    <div className={`h-screen flex flex-col ${settings.darkMode ? 'dark' : ''}`}>
      {/* 上栏工具条 */}
      <EditorToolbar
        fontSize={settings.fontSize}
        onFontSizeChange={(size) => useSettingsStore.getState().setFontSize(size)}
        darkMode={settings.darkMode}
        onDarkModeToggle={toggleDarkMode}
        onInsertImage={handleInsertImage}
      />

      {/* 主体区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左边栏 */}
        {showLeftSidebar && (
          <LeftSidebar
            onClose={() => setShowLeftSidebar(false)}
            editorRef={editorInstance}
          />
        )}

        {/* 写作区 */}
        <main 
          className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900"
          onContextMenu={handleContextMenu}
        >
          {/* 章节标题栏 */}
          <div className="h-12 px-4 flex items-center gap-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
            {/* 左侧按钮 */}
            <button
              onClick={() => setShowLeftSidebar(!showLeftSidebar)}
              className={`p-1.5 rounded ${showLeftSidebar ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              title={showLeftSidebar ? '收起左栏' : '展开左栏'}
            >
              ☰
            </button>

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

            {/* 右侧按钮 */}
            <button
              onClick={() => setShowRightSidebar(!showRightSidebar)}
              className={`p-1.5 rounded ${showRightSidebar ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              title={showRightSidebar ? '收起AI面板' : '展开AI面板'}
            >
              🧠
            </button>
          </div>

          {/* 编辑器 */}
          <NovelEditor
            content={content}
            onChange={setContent}
            fontSize={settings.fontSize}
            darkMode={settings.darkMode}
            onEditorReady={handleEditorReady}
            onSelectionChange={handleSelectionChange}
          />
        </main>

        {/* 右边栏（AI面板） */}
        {showRightSidebar && (
          <AIPanel
            editorRef={editorInstance}
            onExtractForeshadow={handleExtractForeshadow}
            onExtractWorldview={handleExtractWorldview}
          />
        )}
      </div>

      {/* 底部状态栏 */}
      <footer className="h-8 px-4 flex items-center justify-between bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 text-sm flex-shrink-0">
        <div className="flex items-center gap-4">
          {/* 字数 */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500">字数:</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {formatWordCount(wordCount)}
            </span>
            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  wordCountPercent >= 100 ? 'bg-success' : wordCountPercent >= 80 ? 'bg-primary' : 'bg-warning'
                }`}
                style={{ width: `${wordCountPercent}%` }}
              />
            </div>
            <span className="text-gray-400 text-xs">
              {wordCountPercent}%
            </span>
          </div>

          {/* 保存状态 */}
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${isDirty ? 'bg-warning' : 'bg-success'}`} />
            <span className="text-gray-400">
              {isDirty ? '未保存' : '已保存'}
            </span>
          </div>
        </div>

        {/* 复制按钮 */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyPlainText}
            className="px-2 py-0.5 text-xs text-gray-500 hover:text-primary hover:bg-primary/10 rounded"
          >
            复制纯文本
          </button>
          <button
            onClick={handleCopyMarkdown}
            className="px-2 py-0.5 text-xs text-gray-500 hover:text-primary hover:bg-primary/10 rounded"
          >
            复制MD
          </button>
        </div>
      </footer>

      {/* 右键菜单 */}
      {showContextMenu && (
        <ContextMenu
          onSummarize={handleSummarize}
          onExtractForeshadow={handleExtractForeshadow}
        />
      )}
    </div>
  );
}

export default Writer;

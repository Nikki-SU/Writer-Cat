// 写作页 - 左侧栏 + 编辑器
import { useEffect, useState, useRef, useCallback } from 'react';
import useBookStore from '../stores/useBookStore';
import useEditorStore from '../stores/useEditorStore';
import useStructureStore from '../stores/useStructureStore';
import useAiStore from '../stores/useAiStore';
import useSettingsStore from '../stores/useSettingsStore';
import LeftSidebar from '../components/Sidebar/LeftSidebar';
import EditorToolbar from '../components/Editor/EditorToolbar';
import Editor from '../components/Editor/Editor';
import AiPanel from '../components/Sidebar/AiPanel';

export default function Writer() {
  const { currentBook, chapters, currentChapter, selectChapter, createChapter, copyToClipboard, exportChapter, exportBook } = useBookStore();
  const { content, setContent, saveContent } = useEditorStore();
  const { foreshadows, worldviews, threads, loadStructures } = useStructureStore();
  const { aiPanelOpen, toggleAiPanel } = useAiStore();
  const { settings, updateSettings } = useSettingsStore();
  
  // 编辑器引用
  const editorRef = useRef(null);
  
  // 新建章节弹窗状态
  const [showChapterCreate, setShowChapterCreate] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [createButtonPos, setCreateButtonPos] = useState({ x: 0, y: 0 });
  
  // 工具栏状态
  const [fontSize, setFontSize] = useState(settings.font_size || 16);
  const [darkMode, setDarkMode] = useState(settings.theme === 'dark');
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  const copyButtonRef = useRef(null);

  // 当选择的章节变化时，加载内容
  useEffect(() => {
    if (currentChapter?.content !== undefined) {
      setContent(currentChapter.content || '');
    }
  }, [currentChapter?.id]);

  // 加载结构数据
  useEffect(() => {
    if (currentBook) {
      loadStructures(currentBook.id);
    }
  }, [currentBook, loadStructures]);

  // 章节内容变化时自动保存
  const handleContentChange = useCallback((newContent) => {
    setContent(newContent);
    if (currentChapter) {
      saveContent(currentChapter.id, newContent);
    }
  }, [currentChapter, saveContent]);

  // 创建章节
  const handleCreateChapter = async () => {
    if (!newChapterTitle.trim()) return;
    try {
      const chapter = await createChapter(newChapterTitle.trim());
      setShowChapterCreate(false);
      setNewChapterTitle('');
      selectChapter(chapter);
    } catch (e) {
      console.error('创建章节失败:', e);
    }
  };

  // 打开新建章节弹窗（贴近按钮位置）
  const handleOpenChapterCreate = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCreateButtonPos({ x: rect.right, y: rect.bottom });
    setShowChapterCreate(true);
  };

  // 字体大小变化
  const handleFontSizeChange = (size) => {
    setFontSize(size);
    updateSettings({ ...settings, font_size: size });
  };

  // 日夜间切换
  const handleDarkModeToggle = () => {
    const newTheme = darkMode ? 'light' : 'dark';
    setDarkMode(!darkMode);
    updateSettings({ ...settings, theme: newTheme });
    // 通知编辑器主题变化
    if (editorRef.current?.updateTheme) {
      editorRef.current.updateTheme(newTheme);
    }
  };

  // 插入图片
  const handleInsertImage = () => {
    if (editorRef.current?.insertImage) {
      editorRef.current.insertImage();
    }
  };

  // 复制功能
  const handleCopyPlain = () => {
    copyToClipboard('plain');
    setShowCopyMenu(false);
  };

  const handleCopyMd = () => {
    copyToClipboard('md');
    setShowCopyMenu(false);
  };

  if (!currentBook) {
    return (
      <div className="flex items-center justify-center h-full text-secondary">
        <p>请先选择一本书籍</p>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* 左侧栏 - 垂直排列+折叠规则 */}
      <LeftSidebar
        editorRef={editorRef}
      />

      {/* 编辑器区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 编辑器工具栏 - 文字功能栏 */}
        <EditorToolbar
          currentChapter={currentChapter}
          fontSize={fontSize}
          onFontSizeChange={handleFontSizeChange}
          darkMode={darkMode}
          onDarkModeToggle={handleDarkModeToggle}
          onInsertImage={handleInsertImage}
          onCopyPlain={handleCopyPlain}
          onCopyMd={handleCopyMd}
          onAiPanel={toggleAiPanel}
          showCopyMenu={showCopyMenu}
          setShowCopyMenu={setShowCopyMenu}
          copyButtonRef={copyButtonRef}
        />

        {/* 编辑器 */}
        <div className="flex-1 overflow-hidden">
          <Editor
            ref={editorRef}
            content={content}
            onChange={handleContentChange}
            currentChapter={currentChapter}
            fontSize={fontSize}
            darkMode={darkMode}
          />
        </div>
      </div>

      {/* AI 面板 - 右侧 */}
      {aiPanelOpen && <AiPanel />}

      {/* 新建章节弹窗 - 贴近按钮位置 */}
      {showChapterCreate && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-xl border p-4 w-72 animate-fadeIn"
          style={{
            left: `${createButtonPos.x - 288}px`,
            top: `${createButtonPos.y + 4}px`,
          }}
        >
          <h3 className="text-base font-medium text-body mb-3">新建章节</h3>
          <input
            type="text"
            placeholder="章节标题"
            value={newChapterTitle}
            onChange={(e) => setNewChapterTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreateChapter()}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setShowChapterCreate(false); setNewChapterTitle(''); }}
              className="px-3 py-1.5 text-sm text-secondary hover:bg-gray-100 rounded"
            >
              取消
            </button>
            <button
              onClick={handleCreateChapter}
              className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              创建
            </button>
          </div>
        </div>
      )}
      
      {/* 点击其他地方关闭弹窗 */}
      {showChapterCreate && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setShowChapterCreate(false); setNewChapterTitle(''); }}
        />
      )}
    </div>
  );
}

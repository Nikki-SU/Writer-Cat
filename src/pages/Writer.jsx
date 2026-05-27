// 写作页 - 左侧栏 + 编辑器
import { useEffect, useState, useRef, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import useBookStore from '../stores/useBookStore';
import useEditorStore from '../stores/useEditorStore';
import useStructureStore from '../stores/useStructureStore';
import useAiStore from '../stores/useAiStore';
import Sidebar from '../components/Sidebar/Sidebar';
import Editor from '../components/Editor/Editor';
import AiPanel from '../components/Sidebar/AiPanel';

export default function Writer() {
  const navigate = useNavigate();
  const { currentBook, chapters, currentChapter, selectChapter, createChapter, reorderChapters, copyToClipboard, exportChapter, exportBook } = useBookStore();
  const { content, setContent, saveContent } = useEditorStore();
  const { foreshadows, worldviews, characters, threads, loadStructures } = useStructureStore();
  const { aiPanelOpen, toggleAiPanel } = useAiStore();
  const [sidebarTab, setSidebarTab] = useState('chapters');
  const [showChapterCreate, setShowChapterCreate] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');

  // 当选择的章节变化时，加载内容
  useEffect(() => {
    if (currentChapter?.content !== undefined) {
      setContent(currentChapter.content || '');
    }
  }, [currentChapter?.id]);

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

  if (!currentBook) {
    return (
      <div className="flex items-center justify-center h-full text-secondary">
        <p>请先选择一本书籍</p>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* 左侧栏 */}
      <Sidebar
        chapters={chapters}
        currentChapter={currentChapter}
        foreshadows={foreshadows}
        worldviews={worldviews}
        characters={characters}
        threads={threads}
        activeTab={sidebarTab}
        onTabChange={setSidebarTab}
        onSelectChapter={selectChapter}
        onCreateChapter={() => setShowChapterCreate(true)}
      />

      {/* 编辑器区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 编辑器工具栏 */}
        <EditorToolbar
          currentChapter={currentChapter}
          onCopyPlain={() => copyToClipboard('plain')}
          onCopyMd={() => copyToClipboard('md')}
          onExportChapter={exportChapter}
          onExportBook={exportBook}
          onAiPanel={toggleAiPanel}
        />

        {/* 编辑器 */}
        <div className="flex-1 overflow-hidden">
          <Editor
            content={content}
            onChange={handleContentChange}
            currentChapter={currentChapter}
          />
        </div>
      </div>

      {/* AI 面板 */}
      {aiPanelOpen && <AiPanel />}

      {/* 新建章节弹窗 */}
      {showChapterCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 shadow-xl animate-fadeIn">
            <h2 className="text-xl font-bold mb-4">新建章节</h2>
            <input
              type="text"
              placeholder="章节标题"
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateChapter()}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowChapterCreate(false)} className="px-4 py-2 text-secondary">
                取消
              </button>
              <button onClick={handleCreateChapter} className="px-4 py-2 bg-primary text-white rounded-lg">
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 编辑器工具栏
function EditorToolbar({ currentChapter, onCopyPlain, onCopyMd, onExportChapter, onExportBook, onAiPanel }) {
  const [showExport, setShowExport] = useState(false);

  return (
    <div className="h-12 border-b bg-white flex items-center justify-between px-4">
      <div className="font-medium text-body">
        {currentChapter ? currentChapter.title : '未选择章节'}
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={onAiPanel}
          className="px-3 py-1 text-sm text-secondary hover:text-primary transition"
          title="AI 助手"
        >
          🤖 AI
        </button>
        
        <div className="relative">
          <button
            onClick={() => setShowExport(!showExport)}
            className="px-3 py-1 text-sm text-secondary hover:text-primary transition"
          >
            📋 复制
          </button>
          
          {showExport && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border py-1 z-10 min-w-[120px]">
              <button
                onClick={() => { onCopyPlain(); setShowExport(false); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                复制纯文本
              </button>
              <button
                onClick={() => { onCopyMd(); setShowExport(false); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                复制 Markdown
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

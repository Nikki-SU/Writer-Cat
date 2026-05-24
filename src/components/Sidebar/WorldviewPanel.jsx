// 世界观面板（可检索，有条目+挂载按钮）
import { useState, useEffect } from 'react';
import { useStructureStore } from '../../stores/useStructureStore';
import { useBookStore } from '../../stores/useBookStore';

function WorldviewPanel({ editorRef }) {
  const { currentBook, currentChapter } = useBookStore();
  const {
    worldviews,
    currentWorldviewChapters,
    loadWorldviews,
    loadWorldviewChapters,
    attachWorldview,
    detachWorldview,
    createWorldview,
    deleteWorldview,
  } = useStructureStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWorldviewName, setNewWorldviewName] = useState('');
  const [newWorldviewDesc, setNewWorldviewDesc] = useState('');
  const [expandedWorldview, setExpandedWorldview] = useState(null);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [attachingWorldview, setAttachingWorldview] = useState(null);

  // 加载世界观数据
  useEffect(() => {
    if (currentBook) {
      loadWorldviews(currentBook.id);
    }
  }, [currentBook, loadWorldviews]);

  // 搜索过滤
  const filteredWorldviews = worldviews.filter((w) =>
    w.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 展开世界观详情
  const handleExpandWorldview = async (worldviewId) => {
    if (expandedWorldview === worldviewId) {
      setExpandedWorldview(null);
    } else {
      setExpandedWorldview(worldviewId);
      await loadWorldviewChapters(worldviewId);
    }
  };

  // 点击挂载按钮
  const handleAttachClick = (worldview, e) => {
    e.stopPropagation();
    setAttachingWorldview(worldview);
    setShowAttachModal(true);
  };

  // 挂载世界观到当前章节
  const handleAttach = async (position = '') => {
    if (!attachingWorldview || !currentChapter) return;
    try {
      await attachWorldview(attachingWorldview.id, currentChapter.id, position);
      setShowAttachModal(false);
      setAttachingWorldview(null);
    } catch (error) {
      console.error('挂载世界观失败:', error);
    }
  };

  // 解绑世界观
  const handleDetach = async (worldviewId, chapterId) => {
    try {
      await detachWorldview(worldviewId, chapterId);
    } catch (error) {
      console.error('解绑世界观失败:', error);
    }
  };

  // 创建世界观
  const handleCreateWorldview = async () => {
    if (!newWorldviewName.trim() || !currentBook) return;
    try {
      await createWorldview({
        bookId: currentBook.id,
        name: newWorldviewName.trim(),
        description: newWorldviewDesc.trim(),
      });
      setNewWorldviewName('');
      setNewWorldviewDesc('');
      setShowAddModal(false);
    } catch (error) {
      console.error('创建世界观失败:', error);
    }
  };

  // 删除世界观
  const handleDeleteWorldview = async (worldviewId) => {
    if (!window.confirm('确定要删除这个世界观吗？')) return;
    try {
      await deleteWorldview(worldviewId);
    } catch (error) {
      console.error('删除世界观失败:', error);
    }
  };

  return (
    <div className="px-4 py-2">
      {/* 搜索框 */}
      <div className="relative mb-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索世界观..."
          className="w-full px-3 py-1.5 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-8"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {/* 世界观列表 */}
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {filteredWorldviews.map((w) => {
          const isExpanded = expandedWorldview === w.id;
          const isAttachedToCurrentChapter = currentWorldviewChapters.some(
            (c) => c.chapter_id === currentChapter?.id
          );
          
          return (
            <div key={w.id} className="border border-gray-100 dark:border-gray-600 rounded-lg overflow-hidden">
              <div
                className={`flex items-center gap-2 px-2 py-2 cursor-pointer transition-colors ${
                  isExpanded
                    ? 'bg-gray-100 dark:bg-gray-700'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                onClick={() => handleExpandWorldview(w.id)}
              >
                <span className="text-gray-400 text-sm">🌍</span>
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                  {w.name}
                </span>
                
                {/* 挂载按钮 */}
                <button
                  onClick={(e) => handleAttachClick(w, e)}
                  className={`w-5 h-5 rounded-full border text-xs flex items-center justify-center transition-colors ${
                    isAttachedToCurrentChapter
                      ? 'bg-primary border-primary text-white'
                      : 'border-gray-300 text-gray-400 hover:border-primary hover:text-primary'
                  }`}
                  title={isAttachedToCurrentChapter ? '已挂载到当前章节' : '挂载到当前章节'}
                >
                  ⚪
                </button>
              </div>
              
              {/* 展开详情 */}
              {isExpanded && (
                <div className="px-3 py-2 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-600">
                  {w.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {w.description}
                    </p>
                  )}
                  
                  {/* 挂载的章节 */}
                  {currentWorldviewChapters.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400">已挂载章节:</p>
                      {currentWorldviewChapters.map((c) => (
                        <div
                          key={c.chapter_id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-600 dark:text-gray-400">
                            {c.chapter_title || c.chapter_id.slice(0, 8)}
                          </span>
                          <button
                            onClick={() => handleDetach(w.id, c.chapter_id)}
                            className="text-xs text-error hover:bg-error/10 px-1 rounded"
                          >
                            解绑
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* 删除按钮 */}
                  <button
                    onClick={() => handleDeleteWorldview(w.id)}
                    className="mt-2 text-xs text-error hover:bg-error/10 px-2 py-1 rounded"
                  >
                    删除
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {filteredWorldviews.length === 0 && (
          <p className="text-xs text-gray-400 italic text-center py-2">
            {worldviews.length === 0 ? '暂无世界观' : '无匹配世界观'}
          </p>
        )}
      </div>

      {/* 添加按钮 */}
      <button
        onClick={() => setShowAddModal(true)}
        className="w-full mt-2 px-3 py-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg border border-primary/20"
      >
        + 添加世界观
      </button>

      {/* 添加世界观弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-80 shadow-xl">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
              添加世界观
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  名称
                </label>
                <input
                  type="text"
                  value={newWorldviewName}
                  onChange={(e) => setNewWorldviewName(e.target.value)}
                  placeholder="输入世界观名称..."
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  描述（可选）
                </label>
                <textarea
                  value={newWorldviewDesc}
                  onChange={(e) => setNewWorldviewDesc(e.target.value)}
                  placeholder="输入世界观描述..."
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCreateWorldview}
                disabled={!newWorldviewName.trim()}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                创建
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewWorldviewName('');
                  setNewWorldviewDesc('');
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 挂载弹窗 */}
      {showAttachModal && attachingWorldview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-80 shadow-xl">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
              挂载「{attachingWorldview.name}」
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              挂载到: {currentChapter?.title || '当前章节'}
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleAttach('')}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                确认挂载
              </button>
              <button
                onClick={() => {
                  setShowAttachModal(false);
                  setAttachingWorldview(null);
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorldviewPanel;

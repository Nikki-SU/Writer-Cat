// 伏笔列表组件（只显示未完成的）
import { useState, useEffect } from 'react';
import { useStructureStore } from '../../stores/useStructureStore';
import { useBookStore } from '../../stores/useBookStore';

function ForeshadowList() {
  const { currentBook } = useBookStore();
  const {
    foreshadows,
    loadForeshadows,
    createForeshadow,
    updateForeshadow,
    deleteForeshadow,
    getIncompleteForeshadows,
  } = useStructureStore();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newForeshadowName, setNewForeshadowName] = useState('');
  const [editingForeshadow, setEditingForeshadow] = useState(null);

  // 加载伏笔数据
  useEffect(() => {
    if (currentBook) {
      loadForeshadows(currentBook.id);
    }
  }, [currentBook, loadForeshadows]);

  // 获取未完成的伏笔
  const incompleteForeshadows = getIncompleteForeshadows();

  // 创建伏笔
  const handleCreateForeshadow = async () => {
    if (!newForeshadowName.trim() || !currentBook) return;
    try {
      await createForeshadow({
        bookId: currentBook.id,
        name: newForeshadowName.trim(),
        buryChapterId: null,
        buryChapterTitle: null,
        buryContent: null,
      });
      setNewForeshadowName('');
      setShowAddModal(false);
    } catch (error) {
      console.error('创建伏笔失败:', error);
    }
  };

  // 完成伏笔（填写圆伏笔）
  const handleCompleteForeshadow = async (foreshadowId) => {
    setEditingForeshadow(foreshadowId);
    // TODO: 打开编辑弹窗让用户填写圆伏笔内容
  };

  // 删除伏笔
  const handleDeleteForeshadow = async (foreshadowId) => {
    if (!window.confirm('确定要删除这个伏笔吗？')) return;
    try {
      await deleteForeshadow(foreshadowId);
    } catch (error) {
      console.error('删除伏笔失败:', error);
    }
  };

  if (!currentBook) {
    return null;
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          🎯 伏笔
        </span>
        <button
          onClick={() => setShowAddModal(true)}
          className="p-1 text-xs text-primary hover:bg-primary/10 rounded"
          title="添加伏笔"
        >
          +
        </button>
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto">
        {incompleteForeshadows.length === 0 ? (
          <p className="text-xs text-gray-400 italic px-3">暂无未完成伏笔</p>
        ) : (
          incompleteForeshadows.map((foreshadow) => (
            <div
              key={foreshadow.id}
              className="group px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-400">▫</span>
                <span className="flex-1 truncate">{foreshadow.name}</span>
                {foreshadow.bury_chapter_title && (
                  <span className="text-xs text-gray-400">
                    埋:{foreshadow.bury_chapter_title.replace(/第\d+章/, (m) => m.slice(0, 3))}
                  </span>
                )}
              </div>
              
              {/* 操作按钮（hover时显示） */}
              <div className="hidden group-hover:flex gap-2 mt-1 pt-1 border-t border-gray-100 dark:border-gray-600">
                <button
                  onClick={() => handleCompleteForeshadow(foreshadow.id)}
                  className="px-2 py-0.5 text-xs text-success hover:bg-success/10 rounded"
                >
                  ✓ 圆
                </button>
                <button
                  onClick={() => handleDeleteForeshadow(foreshadow.id)}
                  className="px-2 py-0.5 text-xs text-error hover:bg-error/10 rounded"
                >
                  删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 添加伏笔弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-80 shadow-xl">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
              添加伏笔
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                伏笔名称
              </label>
              <input
                type="text"
                value={newForeshadowName}
                onChange={(e) => setNewForeshadowName(e.target.value)}
                placeholder="输入伏笔名称..."
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                autoFocus
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleCreateForeshadow}
                disabled={!newForeshadowName.trim()}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                创建
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewForeshadowName('');
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
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

export default ForeshadowList;

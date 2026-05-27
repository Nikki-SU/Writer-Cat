// fix: 伏笔列表（规格书要求）
// 只显示未完成的伏笔
// 每个伏笔显示 [埋] 和 [圆] 两个状态
// 两者都填好后自动标记为已完成
// 添加伏笔时要求填写：名称+关联情节+关联章节+文本摘要
import { useState, useEffect } from 'react';
import useStructureStore from '../../stores/useStructureStore';
import useBookStore from '../../stores/useBookStore';

function ForeshadowList({ editorRef }) {
  const { currentBook, chapters } = useBookStore();
  const {
    foreshadows,
    loadForeshadows,
    createForeshadow,
    updateForeshadow,
    deleteForeshadow,
  } = useStructureStore();
  
  // 添加弹窗状态
  const [showAddModal, setShowAddModal] = useState(false);
  const [addButtonPos, setAddButtonPos] = useState({ x: 0, y: 0 });
  
  // 新伏笔表单
  const [newForeshadow, setNewForeshadow] = useState({
    name: '',
    plot: '',
    chapterId: '',
    summary: '',
  });

  // 编辑弹窗状态
  const [editingForeshadow, setEditingForeshadow] = useState(null);
  const [editField, setEditField] = useState(null); // 'bury' | 'resolve'
  const [editPos, setEditPos] = useState({ x: 0, y: 0 });

  // 加载伏笔数据
  useEffect(() => {
    if (currentBook) {
      loadForeshadows(currentBook.id);
    }
  }, [currentBook, loadForeshadows]);

  // 获取未完成的伏笔
  const incompleteForeshadows = foreshadows.filter(f => f.status !== 'resolved');

  // 打开添加弹窗（贴近按钮）
  const handleOpenAdd = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setAddButtonPos({ x: rect.left, y: rect.bottom });
    setShowAddModal(true);
  };

  // 创建伏笔
  const handleCreateForeshadow = async () => {
    if (!newForeshadow.name.trim() || !currentBook) return;
    try {
      await createForeshadow({
        bookId: currentBook.id,
        name: newForeshadow.name.trim(),
        plot: newForeshadow.plot.trim() || null,
        buryChapterId: newForeshadow.chapterId || null,
        buryChapterTitle: chapters.find(c => c.id === newForeshadow.chapterId)?.title || null,
        buryContent: newForeshadow.summary.trim() || null,
      });
      setNewForeshadow({ name: '', plot: '', chapterId: '', summary: '' });
      setShowAddModal(false);
    } catch (error) {
      console.error('创建伏笔失败:', error);
    }
  };

  // 打开编辑弹窗
  const handleOpenEdit = (foreshadow, field, e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setEditPos({ x: rect.right + 8, y: rect.top - 100 });
    setEditingForeshadow(foreshadow);
    setEditField(field);
  };

  // 填写埋/圆章节
  const handleFillChapter = async (chapterId) => {
    if (!editingForeshadow || !editField) return;
    const chapter = chapters.find(c => c.id === chapterId);
    
    const updateData = editField === 'bury'
      ? {
          bury_chapter_id: chapterId,
          bury_chapter_title: chapter?.title || null,
        }
      : {
          resolve_chapter_id: chapterId,
          resolve_chapter_title: chapter?.title || null,
        };
    
    // 检查是否两个都填好了
    const willBeResolved = 
      (editField === 'bury' ? chapterId : editingForeshadow.bury_chapter_id) &&
      (editField === 'resolve' ? chapterId : editingForeshadow.resolve_chapter_id);
    
    if (willBeResolved) {
      updateData.status = 'resolved';
    }
    
    await updateForeshadow(editingForeshadow.id, updateData);
    setEditingForeshadow(null);
    setEditField(null);
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
          🎯 伏笔（{incompleteForeshadows.length}）
        </span>
        <button
          onClick={handleOpenAdd}
          className="p-1 text-xs text-primary hover:bg-primary/10 rounded"
          title="添加伏笔"
        >
          +
        </button>
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto">
        {incompleteForeshadows.length === 0 ? (
          <p className="text-xs text-gray-400 italic px-3 py-2 text-center">
            ✅ 所有伏笔都已完成
          </p>
        ) : (
          incompleteForeshadows.map((foreshadow) => (
            <div
              key={foreshadow.id}
              className="group px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {/* 伏笔名称 */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400">▫</span>
                <span className="flex-1 truncate font-medium">{foreshadow.name}</span>
              </div>
              
              {/* 埋/圆状态 */}
              <div className="flex items-center gap-2 mt-1 text-xs">
                {/* 埋 */}
                <button
                  onClick={(e) => handleOpenEdit(foreshadow, 'bury', e)}
                  className={`px-2 py-0.5 rounded border transition ${
                    foreshadow.bury_chapter_title
                      ? 'border-success text-success hover:bg-success/10'
                      : 'border-gray-300 text-gray-400 hover:border-primary hover:text-primary'
                  }`}
                >
                  埋: {foreshadow.bury_chapter_title?.replace(/第(\d+)章/, '第$1章').slice(0, 8) || '点击填写'}
                </button>
                
                {/* 箭头 */}
                <span className="text-gray-300">→</span>
                
                {/* 圆 */}
                <button
                  onClick={(e) => handleOpenEdit(foreshadow, 'resolve', e)}
                  className={`px-2 py-0.5 rounded border transition ${
                    foreshadow.resolve_chapter_title
                      ? 'border-success text-success hover:bg-success/10'
                      : 'border-gray-300 text-gray-400 hover:border-primary hover:text-primary'
                  }`}
                >
                  圆: {foreshadow.resolve_chapter_title?.replace(/第(\d+)章/, '第$1章').slice(0, 8) || '点击填写'}
                </button>
              </div>
              
              {/* 关联情节摘要 */}
              {foreshadow.bury_content && (
                <p className="text-xs text-gray-400 mt-1 truncate pl-4">
                  {foreshadow.bury_content}
                </p>
              )}
              
              {/* 操作按钮（hover时显示） */}
              <div className="hidden group-hover:flex gap-2 mt-1 pt-1 border-t border-gray-100 dark:border-gray-600">
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

      {/* 添加伏笔弹窗 - 贴近按钮 */}
      {showAddModal && (
        <>
          <div
            className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border p-4 w-72"
            style={{
              left: `${addButtonPos.x - 200}px`,
              top: `${addButtonPos.y + 4}px`,
            }}
          >
            <h3 className="text-base font-medium text-gray-800 dark:text-white mb-3">
              添加伏笔
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">伏笔名称 *</label>
                <input
                  type="text"
                  value={newForeshadow.name}
                  onChange={(e) => setNewForeshadow({ ...newForeshadow, name: e.target.value })}
                  placeholder="输入伏笔名称..."
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">关联情节</label>
                <input
                  type="text"
                  value={newForeshadow.plot}
                  onChange={(e) => setNewForeshadow({ ...newForeshadow, plot: e.target.value })}
                  placeholder="关联的情节（如：主角获得宝剑）"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">埋伏章节</label>
                <select
                  value={newForeshadow.chapterId}
                  onChange={(e) => setNewForeshadow({ ...newForeshadow, chapterId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                >
                  <option value="">选择章节（可选）</option>
                  {chapters.map((ch) => (
                    <option key={ch.id} value={ch.id}>{ch.title}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">文本摘要</label>
                <textarea
                  value={newForeshadow.summary}
                  onChange={(e) => setNewForeshadow({ ...newForeshadow, summary: e.target.value })}
                  placeholder="伏笔内容摘要..."
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm resize-none"
                  rows={2}
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCreateForeshadow}
                disabled={!newForeshadow.name.trim()}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm"
              >
                创建
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewForeshadow({ name: '', plot: '', chapterId: '', summary: '' });
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
              >
                取消
              </button>
            </div>
          </div>
          {/* 点击外部关闭 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setShowAddModal(false);
              setNewForeshadow({ name: '', plot: '', chapterId: '', summary: '' });
            }}
          />
        </>
      )}

      {/* 编辑埋/圆弹窗 - 贴近按钮 */}
      {editingForeshadow && editField && (
        <>
          <div
            className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border p-3 w-64"
            style={{
              left: `${editPos.x}px`,
              top: `${editPos.y}px`,
            }}
          >
            <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-2">
              选择{editField === 'bury' ? '埋' : '圆'}伏章节
            </h4>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {chapters.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => handleFillChapter(ch.id)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  {ch.title}
                </button>
              ))}
              <button
                onClick={() => {
                  setEditingForeshadow(null);
                  setEditField(null);
                }}
                className="w-full px-3 py-2 text-center text-xs text-secondary hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                取消
              </button>
            </div>
          </div>
          {/* 点击外部关闭 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setEditingForeshadow(null);
              setEditField(null);
            }}
          />
        </>
      )}
    </div>
  );
}

export default ForeshadowList;

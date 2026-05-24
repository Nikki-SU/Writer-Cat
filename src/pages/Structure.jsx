// 结构页（伏笔 + 世界观）
import { Link } from 'react-router-dom';
import { useBookStore } from '../stores/useBookStore';
import { useEffect, useState } from 'react';

function Structure() {
  const { currentBook, chapters, loadBooks, selectBook } = useBookStore();
  const [foreshadows, setForeshadows] = useState([]);
  const [worldviews, setWorldviews] = useState([]);
  const [activeTab, setActiveTab] = useState('foreshadow'); // 'foreshadow' | 'worldview'
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // TODO: 从API加载数据
  useEffect(() => {
    if (currentBook) {
      setForeshadows([]);
      setWorldviews([]);
    }
  }, [currentBook]);

  const handleAddForeshadow = async () => {
    if (!newItemName.trim()) return;
    const newForeshadow = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      bury_content: newItemDesc.trim(),
      completed: false,
    };
    setForeshadows((prev) => [...prev, newForeshadow]);
    setNewItemName('');
    setNewItemDesc('');
    setShowAddModal(false);
  };

  const handleAddWorldview = async () => {
    if (!newItemName.trim()) return;
    const newWorldview = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      description: newItemDesc.trim(),
    };
    setWorldviews((prev) => [...prev, newWorldview]);
    setNewItemName('');
    setNewItemDesc('');
    setShowAddModal(false);
  };

  const handleToggleComplete = async (foreshadowId) => {
    setForeshadows((prev) =>
      prev.map((f) =>
        f.id === foreshadowId ? { ...f, completed: !f.completed } : f
      )
    );
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

  const incompleteForeshadows = foreshadows.filter((f) => !f.completed);
  const completedForeshadows = foreshadows.filter((f) => f.completed);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            ← 返回
          </Link>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">结构</h1>
        </div>
      </header>

      {/* 标签切换 */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex gap-4 border-b dark:border-gray-700">
          <button
            onClick={() => setActiveTab('foreshadow')}
            className={`pb-2 px-2 font-medium transition-colors ${
              activeTab === 'foreshadow'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            伏笔
          </button>
          <button
            onClick={() => setActiveTab('worldview')}
            className={`pb-2 px-2 font-medium transition-colors ${
              activeTab === 'worldview'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            世界观
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <main className="max-w-4xl mx-auto px-4 pb-8">
        {activeTab === 'foreshadow' && (
          <div className="space-y-6">
            {/* 未完成伏笔 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <span>⏳</span> 未完成 ({incompleteForeshadows.length})
              </h2>
              <div className="space-y-3">
                {incompleteForeshadows.map((f) => (
                  <div
                    key={f.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800 dark:text-white flex items-center gap-2">
                          🪝 {f.name}
                        </h3>
                        {f.bury_content && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                            {f.bury_content}
                          </p>
                        )}
                        {f.reveal_content && (
                          <p className="text-sm text-green-600 dark:text-green-400 mt-1 pl-4 border-l-2 border-green-400">
                            圆: {f.reveal_content}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button className="px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded">
                          圆伏笔
                        </button>
                        <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          编辑
                        </button>
                        <button className="px-3 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {incompleteForeshadows.length === 0 && (
                  <p className="text-gray-400 italic text-sm">暂无未完成的伏笔</p>
                )}
              </div>
            </section>

            {/* 已完成伏笔 */}
            {completedForeshadows.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span>✅</span> 已完成 ({completedForeshadows.length})
                </h2>
                <div className="space-y-3">
                  {completedForeshadows.map((f) => (
                    <div
                      key={f.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 opacity-70"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            🔗 {f.name}
                          </h3>
                        </div>
                        <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          编辑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 添加按钮 */}
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors"
            >
              + 添加伏笔
            </button>
          </div>
        )}

        {activeTab === 'worldview' && (
          <div className="space-y-4">
            {worldviews.map((w) => (
              <div
                key={w.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white flex items-center gap-2">
                      🌍 {w.name}
                    </h3>
                    {w.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {w.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      编辑
                    </button>
                    <button className="px-3 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {worldviews.length === 0 && (
              <p className="text-gray-400 italic text-sm text-center py-8">
                暂无世界观条目
              </p>
            )}

            {/* 添加按钮 */}
            <button
              onClick={() => {
                setNewItemName('');
                setNewItemDesc('');
                setShowAddModal(true);
              }}
              className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors"
            >
              + 添加世界观条目
            </button>
          </div>
        )}
      </main>

      {/* 添加弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              {activeTab === 'foreshadow' ? '添加伏笔' : '添加世界观'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  名称
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="输入名称"
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  描述（可选）
                </label>
                <textarea
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder="输入描述"
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={activeTab === 'foreshadow' ? handleAddForeshadow : handleAddWorldview}
                disabled={!newItemName.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Structure;

// 结构页 - 伏笔管理 + 线索/长伏笔管理 + 世界观管理
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useBookStore } from '../stores/useBookStore';
import { useStructureStore } from '../stores/useStructureStore';
import ThreadFlow from '../components/common/ThreadFlow';

function Structure() {
  const { currentBook, chapters, loadBooks, selectBook } = useBookStore();
  const {
    foreshadows,
    worldviews,
    threads,
    threadNodes,
    loadForeshadows,
    loadWorldviews,
    loadThreads,
    loadThreadNodes,
    createForeshadow,
    updateForeshadow,
    deleteForeshadow,
    createWorldview,
    updateWorldview,
    deleteWorldview,
    attachWorldview,
    detachWorldview,
    createThread,
    updateThread,
    deleteThread,
    getIncompleteForeshadows,
    getCompletedForeshadows,
    getIncompleteThreads,
    getCompletedThreads,
  } = useStructureStore();

  const [activeTab, setActiveTab] = useState('foreshadow'); // 'foreshadow' | 'thread' | 'worldview'
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalType, setAddModalType] = useState('foreshadow'); // 'foreshadow' | 'worldview' | 'thread'
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newThreadType, setNewThreadType] = useState('linear');
  const [expandedForeshadow, setExpandedForeshadow] = useState(null);
  const [expandedThread, setExpandedThread] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // 加载数据
  useEffect(() => {
    if (currentBook) {
      loadForeshadows(currentBook.id);
      loadWorldviews(currentBook.id);
      loadThreads(currentBook.id);
    }
  }, [currentBook, loadForeshadows, loadWorldviews, loadThreads]);

  // 打开添加弹窗
  const openAddModal = (type) => {
    setAddModalType(type);
    setNewItemName('');
    setNewItemDesc('');
    setNewThreadType('linear');
    setShowAddModal(true);
  };

  // 添加伏笔
  const handleAddForeshadow = async () => {
    if (!newItemName.trim() || !currentBook) return;
    try {
      await createForeshadow({
        bookId: currentBook.id,
        name: newItemName.trim(),
        buryChapterId: null,
        buryChapterTitle: null,
        buryContent: null,
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('创建伏笔失败:', error);
    }
  };

  // 完成伏笔
  const handleCompleteForeshadow = async (foreshadowId) => {
    // TODO: 打开编辑弹窗让用户填写圆伏笔
    try {
      await updateForeshadow(foreshadowId, { completed: true });
    } catch (error) {
      console.error('完成伏笔失败:', error);
    }
  };

  // 添加世界观
  const handleAddWorldview = async () => {
    if (!newItemName.trim() || !currentBook) return;
    try {
      await createWorldview({
        bookId: currentBook.id,
        name: newItemName.trim(),
        description: newItemDesc.trim(),
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('创建世界观失败:', error);
    }
  };

  // 添加线索
  const handleAddThread = async () => {
    if (!newItemName.trim() || !currentBook) return;
    try {
      await createThread({
        bookId: currentBook.id,
        name: newItemName.trim(),
        threadType: newThreadType,
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('创建线索失败:', error);
    }
  };

  // 完成线索
  const handleResolveThread = async (threadId) => {
    try {
      await updateThread(threadId, { resolved: true });
    } catch (error) {
      console.error('完成线索失败:', error);
    }
  };

  // 展开线索节点
  const handleExpandThread = async (threadId) => {
    if (expandedThread === threadId) {
      setExpandedThread(null);
    } else {
      setExpandedThread(threadId);
      if (!threadNodes[threadId]) {
        await loadThreadNodes(threadId);
      }
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

  const incompleteForeshadows = getIncompleteForeshadows();
  const completedForeshadows = getCompletedForeshadows();
  const incompleteThreads = getIncompleteThreads();
  const completedThreads = getCompletedThreads();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            ← 返回
          </Link>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">结构</h1>
          <span className="text-gray-500">/ {currentBook.name}</span>
        </div>
      </header>

      {/* 标签切换 */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex gap-4 border-b dark:border-gray-700">
          {[
            { key: 'foreshadow', label: '🎯 伏笔', count: incompleteForeshadows.length },
            { key: 'thread', label: '🧵 线索', count: incompleteThreads.length },
            { key: 'worldview', label: '🌍 世界观', count: worldviews.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-2 px-2 font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 主内容 */}
      <main className="max-w-4xl mx-auto px-4 py-4">
        {/* 伏笔管理 */}
        {activeTab === 'foreshadow' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                未完成的伏笔 ({incompleteForeshadows.length})
              </h2>
              <button
                onClick={() => openAddModal('foreshadow')}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                + 添加伏笔
              </button>
            </div>

            <div className="space-y-2">
              {incompleteForeshadows.map((foreshadow) => (
                <div
                  key={foreshadow.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">▫</span>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {foreshadow.name}
                        </span>
                      </div>
                      {foreshadow.bury_chapter_title && (
                        <p className="text-sm text-gray-500 mt-1 ml-6">
                          埋: {foreshadow.bury_chapter_title}
                        </p>
                      )}
                      {foreshadow.bury_content && (
                        <p className="text-sm text-gray-400 mt-1 ml-6">
                          "{foreshadow.bury_content.slice(0, 50)}..."
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCompleteForeshadow(foreshadow.id)}
                        className="px-3 py-1 text-sm text-success hover:bg-success/10 rounded"
                      >
                        ✓ 圆
                      </button>
                      <button
                        onClick={() => deleteForeshadow(foreshadow.id)}
                        className="px-3 py-1 text-sm text-error hover:bg-error/10 rounded"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {incompleteForeshadows.length === 0 && (
                <p className="text-center text-gray-400 py-8">暂无未完成的伏笔</p>
              )}
            </div>

            {/* 已完成 */}
            {completedForeshadows.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <span>{showCompleted ? '▼' : '▶'}</span>
                  <span>已完成的伏笔 ({completedForeshadows.length})</span>
                </button>
                {showCompleted && (
                  <div className="mt-2 space-y-2 opacity-60">
                    {completedForeshadows.map((foreshadow) => (
                      <div
                        key={foreshadow.id}
                        className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 line-through"
                      >
                        <span className="text-gray-500">{foreshadow.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 线索管理 */}
        {activeTab === 'thread' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                未完成的线索 ({incompleteThreads.length})
              </h2>
              <button
                onClick={() => openAddModal('thread')}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                + 添加线索
              </button>
            </div>

            <div className="space-y-4">
              {incompleteThreads.map((thread) => {
                const nodes = threadNodes[thread.id] || [];
                const isExpanded = expandedThread === thread.id;
                const threadType = thread.thread_type || 'linear';

                return (
                  <div
                    key={thread.id}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <div
                      className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => handleExpandThread(thread.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {threadType === 'linear' ? '📍' : threadType === 'branch' ? '🌳' : '🔀'}
                        </span>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {thread.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({nodes.length} 节点)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolveThread(thread.id);
                          }}
                          className="px-2 py-1 text-xs text-success hover:bg-success/10 rounded"
                        >
                          完成
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteThread(thread.id);
                          }}
                          className="px-2 py-1 text-xs text-error hover:bg-error/10 rounded"
                        >
                          删除
                        </button>
                        <span className="text-gray-400">
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t dark:border-gray-700">
                        <ThreadFlow
                          thread={thread}
                          nodes={nodes}
                          onNodeClick={(node) => console.log('点击节点:', node)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
              {incompleteThreads.length === 0 && (
                <p className="text-center text-gray-400 py-8">暂无未完成的线索</p>
              )}
            </div>

            {/* 已完成 */}
            {completedThreads.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <span>{showCompleted ? '▼' : '▶'}</span>
                  <span>已完成的线索 ({completedThreads.length})</span>
                </button>
                {showCompleted && (
                  <div className="mt-2 space-y-2 opacity-60">
                    {completedThreads.map((thread) => (
                      <div
                        key={thread.id}
                        className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 line-through"
                      >
                        <span className="text-gray-500">{thread.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 世界观管理 */}
        {activeTab === 'worldview' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                世界观 ({worldviews.length})
              </h2>
              <button
                onClick={() => openAddModal('worldview')}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                + 添加世界观
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {worldviews.map((worldview) => (
                <div
                  key={worldview.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span>🌍</span>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {worldview.name}
                        </span>
                      </div>
                      {worldview.description && (
                        <p className="text-sm text-gray-500 mt-2">
                          {worldview.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteWorldview(worldview.id)}
                      className="text-error hover:bg-error/10 px-2 py-1 rounded text-sm"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {worldviews.length === 0 && (
              <p className="text-center text-gray-400 py-8">暂无世界观</p>
            )}
          </div>
        )}
      </main>

      {/* 添加弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
              {addModalType === 'foreshadow' && '添加伏笔'}
              {addModalType === 'worldview' && '添加世界观'}
              {addModalType === 'thread' && '添加线索'}
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
                  placeholder="输入名称..."
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  autoFocus
                />
              </div>

              {addModalType === 'worldview' && (
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    描述
                  </label>
                  <textarea
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    placeholder="输入描述..."
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                    rows={3}
                  />
                </div>
              )}

              {addModalType === 'thread' && (
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    类型
                  </label>
                  <div className="flex gap-2">
                    {[
                      { key: 'linear', icon: '📍', label: '线性' },
                      { key: 'branch', icon: '🌳', label: '分支' },
                      { key: 'converge', icon: '🔀', label: '收束' },
                    ].map((type) => (
                      <button
                        key={type.key}
                        onClick={() => setNewThreadType(type.key)}
                        className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                          newThreadType === type.key
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {type.icon} {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={
                  addModalType === 'foreshadow'
                    ? handleAddForeshadow
                    : addModalType === 'worldview'
                    ? handleAddWorldview
                    : handleAddThread
                }
                disabled={!newItemName.trim()}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                创建
              </button>
              <button
                onClick={() => setShowAddModal(false)}
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

export default Structure;

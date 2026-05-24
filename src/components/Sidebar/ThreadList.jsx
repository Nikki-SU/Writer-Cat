// 线索/长伏笔列表组件
import { useState, useEffect } from 'react';
import { useStructureStore } from '../../stores/useStructureStore';
import { useBookStore } from '../../stores/useBookStore';

// 线索类型配置
const THREAD_TYPES = {
  linear: { icon: '📍', label: '线性' },
  branch: { icon: '🌳', label: '分支' },
  converge: { icon: '🔀', label: '收束' },
};

function ThreadList() {
  const { currentBook } = useBookStore();
  const {
    threads,
    threadNodes,
    loadThreads,
    loadThreadNodes,
    createThread,
    updateThread,
    deleteThread,
    getIncompleteThreads,
  } = useStructureStore();
  
  const [expandedThreads, setExpandedThreads] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newThreadName, setNewThreadName] = useState('');
  const [newThreadType, setNewThreadType] = useState('linear');
  const [editingThread, setEditingThread] = useState(null);

  // 加载线索数据
  useEffect(() => {
    if (currentBook) {
      loadThreads(currentBook.id);
    }
  }, [currentBook, loadThreads]);

  // 获取未完成的线索
  const incompleteThreads = getIncompleteThreads();

  // 展开/收起线索
  const toggleExpand = async (threadId) => {
    const newExpanded = { ...expandedThreads };
    if (newExpanded[threadId]) {
      delete newExpanded[threadId];
    } else {
      newExpanded[threadId] = true;
      // 加载节点
      if (!threadNodes[threadId]) {
        await loadThreadNodes(threadId);
      }
    }
    setExpandedThreads(newExpanded);
  };

  // 创建线索
  const handleCreateThread = async () => {
    if (!newThreadName.trim() || !currentBook) return;
    try {
      await createThread({
        bookId: currentBook.id,
        name: newThreadName.trim(),
        threadType: newThreadType,
      });
      setNewThreadName('');
      setNewThreadType('linear');
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

  // 删除线索
  const handleDeleteThread = async (threadId) => {
    if (!window.confirm('确定要删除这条线索吗？')) return;
    try {
      await deleteThread(threadId);
    } catch (error) {
      console.error('删除线索失败:', error);
    }
  };

  // 标记节点完成
  const handleToggleNodeComplete = (threadId, nodeId, completed) => {
    // TODO: 调用API更新节点
    console.log('切换节点完成状态:', threadId, nodeId, completed);
  };

  if (!currentBook) {
    return null;
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          🧵 线索/长伏笔
        </span>
        <button
          onClick={() => setShowAddModal(true)}
          className="p-1 text-xs text-primary hover:bg-primary/10 rounded"
          title="添加线索"
        >
          +
        </button>
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto">
        {incompleteThreads.length === 0 ? (
          <p className="text-xs text-gray-400 italic px-3 py-2">暂无线索</p>
        ) : (
          incompleteThreads.map((thread) => {
            const nodes = threadNodes[thread.id] || [];
            const isExpanded = expandedThreads[thread.id];
            const completedCount = nodes.filter((n) => n.completed).length;
            const typeConfig = THREAD_TYPES[thread.thread_type] || THREAD_TYPES.linear;

            return (
              <div key={thread.id} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                {/* 线索头部 */}
                <div
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => toggleExpand(thread.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{typeConfig.icon}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {thread.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {completedCount}/{nodes.length}节点
                      </span>
                      <span className="text-gray-400">
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 节点列表 */}
                {isExpanded && (
                  <div className="px-3 py-2 bg-white dark:bg-gray-800">
                    {nodes.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">暂无节点</p>
                    ) : (
                      <div className="space-y-1">
                        {nodes.map((node, index) => (
                          <div
                            key={node.id}
                            className={`flex items-start gap-2 px-2 py-1 rounded text-sm ${
                              node.completed
                                ? 'bg-success/10 text-gray-400'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            <span className="text-gray-400">{index + 1}.</span>
                            <span className={`flex-1 ${node.completed ? 'line-through' : ''}`}>
                              {node.content || '未填写内容'}
                            </span>
                            {node.chapter_title && (
                              <span className="text-xs text-gray-400">
                                {node.chapter_title}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* 操作按钮 */}
                    <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() => handleResolveThread(thread.id)}
                        className="px-2 py-1 text-xs text-success hover:bg-success/10 rounded"
                      >
                        ✓ 完成
                      </button>
                      <button
                        onClick={() => handleDeleteThread(thread.id)}
                        className="px-2 py-1 text-xs text-error hover:bg-error/10 rounded"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 添加线索弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-80 shadow-xl">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
              添加线索/长伏笔
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  名称
                </label>
                <input
                  type="text"
                  value={newThreadName}
                  onChange={(e) => setNewThreadName(e.target.value)}
                  placeholder="输入线索名称..."
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  类型
                </label>
                <div className="flex gap-2">
                  {Object.entries(THREAD_TYPES).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setNewThreadType(key)}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                        newThreadType === key
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      {config.icon} {config.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCreateThread}
                disabled={!newThreadName.trim()}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                创建
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewThreadName('');
                  setNewThreadType('linear');
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

export default ThreadList;

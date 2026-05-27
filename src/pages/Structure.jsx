// 结构页 - 伏笔双向互锁 + 世界观
import { useEffect, useState } from 'react';
import useBookStore from '../stores/useBookStore';
import useStructureStore from '../stores/useStructureStore';

export default function Structure() {
  const { currentBook, chapters } = useBookStore();
  const {
    foreshadows, worldviews, threads,
    loadStructures, createForeshadow, resolveForeshadow, deleteForeshadow,
    createWorldview, deleteWorldview, mountWorldview,
    createThread, deleteThread
  } = useStructureStore();
  
  const [activeTab, setActiveTab] = useState('foreshadow');
  const [showCreateFS, setShowCreateFS] = useState(false);
  const [newFSTitle, setNewFSTitle] = useState('');
  const [newFSDesc, setNewFSDesc] = useState('');

  useEffect(() => {
    if (currentBook) {
      loadStructures(currentBook.id);
    }
  }, [currentBook]);

  // 获取章节标题
  const getChapterTitle = (chapterId) => {
    const ch = chapters.find(c => c.id === chapterId);
    return ch ? ch.title : '未关联';
  };

  const handleCreateForeshadow = async () => {
    if (!newFSTitle.trim()) return;
    try {
      await createForeshadow(currentBook.id, newFSTitle.trim(), newFSDesc.trim() || null, null);
      setShowCreateFS(false);
      setNewFSTitle('');
      setNewFSDesc('');
    } catch (e) {
      console.error('创建伏笔失败:', e);
    }
  };

  const handleResolveForeshadow = async (fsId) => {
    // 简单处理：随机选择一个章节作为解决章节
    if (chapters.length > 0) {
      const randomChapter = chapters[Math.floor(Math.random() * chapters.length)];
      await resolveForeshadow(fsId, randomChapter.id);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* 标签页 */}
      <div className="flex gap-4 border-b mb-4">
        {[
          { key: 'foreshadow', label: '📌 伏笔' },
          { key: 'worldview', label: '🌍 世界观' },
          { key: 'thread', label: '🔗 线索' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 font-medium transition ${
              activeTab === tab.key
                ? 'text-primary border-b-2 border-primary'
                : 'text-secondary hover:text-body'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 伏笔面板 */}
      {activeTab === 'foreshadow' && (
        <div className="flex-1 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">伏笔列表</h2>
            <button
              onClick={() => setShowCreateFS(true)}
              className="px-3 py-1 bg-primary text-white rounded-lg text-sm"
            >
              + 新建伏笔
            </button>
          </div>

          {/* 伏笔卡片列表 */}
          <div className="space-y-3">
            {foreshadows.map(fs => (
              <div
                key={fs.id}
                className={`p-4 rounded-lg border ${
                  fs.status === 'resolved' ? 'border-success/50 bg-success/5' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{fs.title}</h3>
                      {fs.status === 'resolved' && (
                        <span className="px-2 py-0.5 bg-success text-white text-xs rounded">
                          已解决
                        </span>
                      )}
                    </div>
                    {fs.description && (
                      <p className="text-sm text-secondary mt-1">{fs.description}</p>
                    )}
                    
                    {/* 双向互锁显示 */}
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-secondary">
                        🕳️ 埋: {getChapterTitle(fs.buried_chapter_id)}
                      </span>
                      {fs.resolved_chapter_id && (
                        <>
                          <span>→</span>
                          <span className="text-success">
                            ✨ 圆: {getChapterTitle(fs.resolved_chapter_id)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {fs.status !== 'resolved' && (
                      <button
                        onClick={() => handleResolveForeshadow(fs.id)}
                        className="px-2 py-1 text-sm bg-success text-white rounded hover:bg-success/90"
                      >
                        标记解决
                      </button>
                    )}
                    <button
                      onClick={() => deleteForeshadow(fs.id)}
                      className="px-2 py-1 text-sm text-error hover:bg-error/10 rounded"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {foreshadows.length === 0 && (
            <div className="text-center py-12 text-secondary">
              <p>还没有伏笔，开始埋下你的第一个伏笔吧！</p>
            </div>
          )}
        </div>
      )}

      {/* 世界观面板 */}
      {activeTab === 'worldview' && (
        <div className="flex-1 overflow-auto">
          <WorldviewPanel
            worldviews={worldviews}
            chapters={chapters}
            onCreate={(title, content, category) => 
              createWorldview(currentBook.id, title, content, category)
            }
            onDelete={deleteWorldview}
            onMount={mountWorldview}
          />
        </div>
      )}

      {/* 线索面板 */}
      {activeTab === 'thread' && (
        <div className="flex-1 overflow-auto">
          <ThreadPanel
            threads={threads}
            chapters={chapters}
            onCreate={(title, type) => createThread(currentBook.id, title, type)}
            onDelete={deleteThread}
          />
        </div>
      )}

      {/* 新建伏笔弹窗 */}
      {showCreateFS && (
        <div className="fixed inset-0 z-50" onClick={() => setShowCreateFS(false)}>
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white rounded-xl p-6 w-96 shadow-2xl border" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">新建伏笔</h2>
            <input
              type="text"
              placeholder="伏笔标题"
              value={newFSTitle}
              onChange={(e) => setNewFSTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <textarea
              placeholder="伏笔描述（可选）"
              value={newFSDesc}
              onChange={(e) => setNewFSDesc(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCreateFS(false)} className="px-4 py-2 text-secondary">
                取消
              </button>
              <button onClick={handleCreateForeshadow} className="px-4 py-2 bg-primary text-white rounded-lg">
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 世界观子组件
function WorldviewPanel({ worldviews, chapters, onCreate, onDelete, onMount }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await onCreate(newTitle.trim(), newContent.trim() || null, newCategory.trim() || null);
    setShowCreate(false);
    setNewTitle('');
    setNewContent('');
    setNewCategory('');
  };

  // 按分类分组
  const grouped = worldviews.reduce((acc, w) => {
    const cat = w.category || '未分类';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(w);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">世界观设定</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="px-3 py-1 bg-primary text-white rounded-lg text-sm"
        >
          + 新建条目
        </button>
      </div>

      {showCreate && (
        <div className="p-4 bg-gray-50 rounded-lg mb-4">
          <input
            type="text"
            placeholder="分类"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg mb-2"
          />
          <input
            type="text"
            placeholder="标题"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg mb-2"
            autoFocus
          />
          <textarea
            placeholder="内容"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg mb-3"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowCreate(false)} className="px-3 py-1 text-secondary">取消</button>
            <button onClick={handleCreate} className="px-3 py-1 bg-primary text-white rounded-lg">保存</button>
          </div>
        </div>
      )}

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mb-4">
          <h3 className="text-sm font-bold text-secondary mb-2">{category}</h3>
          <div className="space-y-2">
            {items.map(w => (
              <div key={w.id} className="p-3 bg-white rounded-lg border">
                <div className="flex justify-between">
                  <span className="font-medium">{w.title}</span>
                  <button onClick={() => onDelete(w.id)} className="text-error text-sm">删除</button>
                </div>
                {w.content && <p className="text-sm text-secondary mt-1">{w.content}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// 线索子组件
function ThreadPanel({ threads, chapters, onCreate, onDelete }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('linear');

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await onCreate(newTitle.trim(), newType);
    setShowCreate(false);
    setNewTitle('');
  };

  const typeLabels = {
    linear: '线性',
    branch: '分支',
    converge: '收束',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">线索/长伏笔</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="px-3 py-1 bg-primary text-white rounded-lg text-sm"
        >
          + 新建线索
        </button>
      </div>

      {showCreate && (
        <div className="p-4 bg-gray-50 rounded-lg mb-4">
          <input
            type="text"
            placeholder="线索标题"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg mb-2"
            autoFocus
          />
          <div className="flex gap-4 mb-3">
            {[
              { key: 'linear', label: '🔗 线性' },
              { key: 'branch', label: '🌳 分支' },
              { key: 'converge', label: '🔄 收束' },
            ].map(t => (
              <label key={t.key} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="threadType"
                  value={t.key}
                  checked={newType === t.key}
                  onChange={(e) => setNewType(e.target.value)}
                />
                {t.label}
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowCreate(false)} className="px-3 py-1 text-secondary">取消</button>
            <button onClick={handleCreate} className="px-3 py-1 bg-primary text-white rounded-lg">创建</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {threads.map(t => (
          <div key={t.id} className="p-4 bg-white rounded-lg border">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold">{t.title}</span>
                <span className="ml-2 text-sm text-secondary">
                  {typeLabels[t.thread_type] || '线性'}
                </span>
              </div>
              <button onClick={() => onDelete(t.id)} className="text-error text-sm">删除</button>
            </div>
            {/* 节点列表 */}
            {t.nodes?.length > 0 && (
              <div className="mt-2 pl-4 border-l-2 border-primary/30">
                {t.nodes.map(node => (
                  <div key={node.id} className="text-sm py-1">
                    • {node.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// 情节页 - 网格卡片布局，从后端加载真实数据
import { useEffect, useState } from 'react';
import useBookStore from '../stores/useBookStore';
import useStructureStore from '../stores/useStructureStore';
import { plotApi } from '../api/plot';
import EmotionCircle from '../components/common/EmotionCircle';

export default function Plot() {
  const { currentBook, chapters } = useBookStore();
  const { foreshadows, loadStructures } = useStructureStore();
  const [plots, setPlots] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // 加载情节数据
  useEffect(() => {
    if (currentBook) {
      loadStructures(currentBook.id);
      loadPlots();
    }
  }, [currentBook]);

  const loadPlots = async () => {
    if (!currentBook) return;
    try {
      const data = await plotApi.getPlots(currentBook.id);
      setPlots(data);
    } catch (e) {
      console.error('加载情节失败:', e);
    }
  };

  // 创建情节
  const handleCreate = async () => {
    if (!newTitle.trim() || !currentBook) return;
    try {
      await plotApi.createPlot({
        book_id: currentBook.id,
        title: newTitle.trim(),
        description: newDesc.trim() || null,
        chapter_id: null,
        target_word_count: 3000,
      });
      setNewTitle('');
      setNewDesc('');
      setShowCreate(false);
      loadPlots();
    } catch (e) {
      console.error('创建情节失败:', e);
    }
  };

  // 删除情节
  const handleDelete = async (id) => {
    try {
      await plotApi.deletePlot(id);
      loadPlots();
    } catch (e) {
      console.error('删除情节失败:', e);
    }
  };

  // 计算字数是否达标
  const isWordCountOk = (plot) => (plot.actual_word_count || 0) >= (plot.target_word_count || 3000);

  // 获取章节对应的伏笔数量
  const getForeshadowCount = (chapterId) => {
    if (!chapterId) return 0;
    return foreshadows.filter(f =>
      f.buried_chapter_id === chapterId || f.resolved_chapter_id === chapterId
    ).length;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-body">情节总览</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        >
          + 添加情节
        </button>
      </div>

      {/* 情节网格 - 每章一个正方形格子 */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {plots.map((plot, index) => (
          <div
            key={plot.id}
            className="aspect-square rounded-xl border-2 p-3 cursor-pointer transition hover:shadow-lg group relative"
            style={{
              borderColor: plot.status === 'resolved' ? '#00A087' :
                          plot.status === 'active' ? '#4DBBD5' : '#8491B4'
            }}
          >
            {/* 情绪圆环 */}
            <div className="flex justify-center mb-2">
              <EmotionCircle
                expected={3}
                actual={3}
                size={60}
              />
            </div>

            {/* 情节信息 */}
            <div className="text-center">
              <div className="text-xs text-secondary mb-1 truncate">
                {plot.chapter_id ? `第${index + 1}章` : '未关联章节'}
              </div>
              <div className="font-medium text-body truncate" title={plot.title}>
                {plot.title}
              </div>
              <div className={`text-xs mt-1 ${isWordCountOk(plot) ? 'text-success' : 'text-error'}`}>
                {(plot.actual_word_count || 0).toLocaleString()}字
              </div>
              {/* 伏笔标记 */}
              {plot.chapter_id && getForeshadowCount(plot.chapter_id) > 0 && (
                <div className="text-xs text-warning mt-1">
                  📌 {getForeshadowCount(plot.chapter_id)}
                </div>
              )}
            </div>

            {/* 删除按钮 */}
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(plot.id); }}
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-error transition"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* 新建情节弹窗 */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 shadow-xl animate-fadeIn">
            <h2 className="text-xl font-bold mb-4">添加情节</h2>
            <input
              type="text"
              placeholder="情节标题"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <textarea
              placeholder="情节描述（可选）"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowCreate(false); setNewTitle(''); setNewDesc(''); }}
                className="px-4 py-2 text-secondary"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-primary text-white rounded-lg"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {plots.length === 0 && currentBook && (
        <div className="text-center py-16 text-secondary">
          <p className="text-4xl mb-4">📝</p>
          <p>还没有情节，点击上方按钮添加！</p>
        </div>
      )}
    </div>
  );
}

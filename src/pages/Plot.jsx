// 情节页 - 网格卡片布局
import { useEffect, useState } from 'react';
import useBookStore from '../stores/useBookStore';
import useStructureStore from '../stores/useStructureStore';
import EmotionCircle from '../components/common/EmotionCircle';

export default function Plot() {
  const { currentBook, chapters } = useBookStore();
  const { foreshadows, loadStructures } = useStructureStore();
  const [plots, setPlots] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    if (currentBook) {
      loadStructures(currentBook.id);
      // 模拟加载情节数据
      setPlots(chapters.map((ch, i) => ({
        id: ch.id,
        title: ch.title,
        word_count: ch.word_count,
        status: ch.status,
        expected: 3,
        actual: 3,
      })));
    }
  }, [currentBook]);

  // 计算字数是否达标
  const isWordCountOk = (plot) => plot.word_count >= 3000;

  // 获取章节对应的伏笔数量
  const getForeshadowCount = (chapterId) => {
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

      {/* 情节网格 */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {plots.map((plot, index) => (
          <div
            key={plot.id}
            className="aspect-square rounded-xl border-2 p-3 cursor-pointer transition hover:shadow-lg group"
            style={{
              borderColor: plot.status === 'completed' ? '#00A087' : 
                          plot.status === 'writing' ? '#4DBBD5' : '#8491B4'
            }}
          >
            {/* 情绪圆环 */}
            <div className="flex justify-center mb-2">
              <EmotionCircle
                expected={plot.expected}
                actual={plot.actual}
                size={60}
              />
            </div>
            
            {/* 章节信息 */}
            <div className="text-center">
              <div className="text-xs text-secondary mb-1">
                第{index + 1}章
              </div>
              <div className="font-medium text-body truncate" title={plot.title}>
                {plot.title}
              </div>
              <div className={`text-xs mt-1 ${isWordCountOk(plot) ? 'text-success' : 'text-error'}`}>
                {plot.word_count.toLocaleString()}字
              </div>
              {/* 伏笔标记 */}
              {getForeshadowCount(plot.id) > 0 && (
                <div className="text-xs text-warning mt-1">
                  📌 {getForeshadowCount(plot.id)}
                </div>
              )}
            </div>
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
              className="w-full px-3 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-secondary"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setShowCreate(false);
                  setNewTitle('');
                }}
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
          <p>还没有情节，先去写作页创建章节吧！</p>
        </div>
      )}
    </div>
  );
}

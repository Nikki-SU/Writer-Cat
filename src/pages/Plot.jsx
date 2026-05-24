// 情节页
import { Link } from 'react-router-dom';
import { useBookStore } from '../stores/useBookStore';
import { useEffect, useState } from 'react';
import { EMOTION_COLORS } from '../utils/constants';

function Plot() {
  const { currentBook, chapters, loadBooks, selectBook } = useBookStore();
  const [plots, setPlots] = useState({}); // { chapterId: [plotItem, ...] }
  const [editingPlot, setEditingPlot] = useState(null);
  const [newPlotContent, setNewPlotContent] = useState('');

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // 加载每个章节的情节
  useEffect(() => {
    if (currentBook && chapters.length > 0) {
      // TODO: 从API加载情节数据
      // 暂时使用空数据
      const plotsData = {};
      chapters.forEach((ch) => {
        plotsData[ch.id] = [];
      });
      setPlots(plotsData);
    }
  }, [currentBook, chapters]);

  const handleAddPlot = async (chapterId) => {
    if (!newPlotContent.trim()) return;
    // TODO: 调用API创建情节
    const newPlot = {
      id: Date.now().toString(),
      content: newPlotContent.trim(),
      completed: false,
      orderIndex: (plots[chapterId] || []).length,
    };
    setPlots((prev) => ({
      ...prev,
      [chapterId]: [...(prev[chapterId] || []), newPlot],
    }));
    setNewPlotContent('');
  };

  const handleToggleComplete = async (chapterId, plotId) => {
    setPlots((prev) => ({
      ...prev,
      [chapterId]: (prev[chapterId] || []).map((p) =>
        p.id === plotId ? { ...p, completed: !p.completed } : p
      ),
    }));
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              ← 返回
            </Link>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">情节</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-300">
              当前: {currentBook.name}
            </span>
          </div>
        </div>
      </header>

      {/* 提示信息 */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          💡 情节写完划掉，在这里不可以划，在写作页划
        </p>
      </div>

      {/* 章节网格卡片 */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 min-h-[200px] flex flex-col"
            >
              {/* 章节标题和目标字数 */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  第{index + 1}章
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  目标: {chapter.target_word_count || 3000}
                </span>
              </div>

              {/* 情节列表 */}
              <div className="flex-1 space-y-2 mb-3">
                {(plots[chapter.id] || []).map((plot) => (
                  <div
                    key={plot.id}
                    className={`flex items-center gap-2 text-sm ${
                      plot.completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        plot.completed ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    />
                    <span className="flex-1 truncate">{plot.content}</span>
                  </div>
                ))}
                {(plots[chapter.id] || []).length === 0 && (
                  <p className="text-sm text-gray-400 italic">暂无情节</p>
                )}
              </div>

              {/* 添加情节 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editingPlot === chapter.id ? newPlotContent : ''}
                  onChange={(e) => {
                    setEditingPlot(chapter.id);
                    setNewPlotContent(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddPlot(chapter.id);
                      setEditingPlot(null);
                    }
                  }}
                  placeholder="添加情节..."
                  className="flex-1 px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button
                  onClick={() => {
                    handleAddPlot(chapter.id);
                    setEditingPlot(null);
                  }}
                  className="px-2 py-1 text-sm text-primary hover:bg-primary/10 rounded"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 情绪颜色说明 */}
      <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 text-sm">
        <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">◉ 圆形标记示意：</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-4 h-8 rounded border border-gray-300 overflow-hidden">
              <div className="h-1/3 bg-green-500" />
              <div className="h-1/3 bg-blue-400" />
              <div className="h-1/3 bg-red-300" />
            </div>
            <span className="text-gray-600 dark:text-gray-400">情绪三段色</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          深蓝(负面强) → 浅蓝(负面) → 白(中性) → 浅红(正面) → 深红(正面强)
        </p>
      </div>
    </div>
  );
}

export default Plot;

// 情节页 - 网格卡片布局
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useBookStore } from '../stores/useBookStore';
import EmotionCircle from '../components/common/EmotionCircle';

function Plot() {
  const navigate = useNavigate();
  const { currentBook, chapters, loadBooks, selectBook } = useBookStore();
  const [plots, setPlots] = useState({}); // { chapterId: [plotItem] }
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [editingChapter, setEditingChapter] = useState(null);
  const [newPlotContent, setNewPlotContent] = useState('');

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // 加载每个章节的情节
  useEffect(() => {
    if (currentBook && chapters.length > 0) {
      // TODO: 从API加载情节数据
      const plotsData = {};
      chapters.forEach((ch) => {
        plotsData[ch.id] = ch.plots || [];
      });
      setPlots(plotsData);
    }
  }, [currentBook, chapters]);

  const handleAddPlot = async (chapterId) => {
    if (!newPlotContent.trim()) return;
    const newPlot = {
      id: Date.now().toString(),
      content: newPlotContent.trim(),
      completed: false,
      orderIndex: (plots[chapterId] || []).length,
      emotionColors: {
        wordCount: 'white',
        expected: 'white',
        actual: 'white',
      },
      wordCountActual: 0,
      wordCountTarget: 3000,
    };
    setPlots((prev) => ({
      ...prev,
      [chapterId]: [...(prev[chapterId] || []), newPlot],
    }));
    setNewPlotContent('');
  };

  const handleToggleComplete = (chapterId, plotId) => {
    setPlots((prev) => ({
      ...prev,
      [chapterId]: (prev[chapterId] || []).map((p) =>
        p.id === plotId ? { ...p, completed: !p.completed } : p
      ),
    }));
  };

  const handleEmotionChange = (chapterId, plotId, type, colorId) => {
    setPlots((prev) => ({
      ...prev,
      [chapterId]: (prev[chapterId] || []).map((p) =>
        p.id === plotId
          ? {
              ...p,
              emotionColors: { ...p.emotionColors, [type]: colorId },
            }
          : p
      ),
    }));
  };

  const handleChapterClick = (chapter) => {
    selectBook(currentBook.id);
    navigate('/writer', { state: { chapterId: chapter.id } });
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
          <div className="flex items-center gap-4">
            <span className="text-gray-600 dark:text-gray-300">
              {currentBook.name}
            </span>
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 text-sm ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
              >
                网格
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-sm ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
              >
                列表
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 提示信息 */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          💡 情节写完划掉，在这里不可以划，在写作页划
        </p>
      </div>

      {/* 章节网格/列表 */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {chapters.map((chapter, index) => {
              const chapterPlots = plots[chapter.id] || [];
              const completedCount = chapterPlots.filter((p) => p.completed).length;
              const totalCount = chapterPlots.length;

              return (
                <div
                  key={chapter.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleChapterClick(chapter)}
                >
                  {/* 章节标题 */}
                  <div className="px-4 py-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <h3 className="font-medium text-gray-800 dark:text-white truncate">
                      第{index + 1}章 {chapter.title || ''}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {totalCount > 0 ? `${completedCount}/${totalCount} 情节完成` : '暂无情节'}
                    </p>
                  </div>

                  {/* 情节列表 */}
                  <div className="p-3 max-h-48 overflow-y-auto">
                    {chapterPlots.length === 0 ? (
                      <p className="text-xs text-gray-400 italic text-center py-4">
                        点击进入添加情节
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {chapterPlots.slice(0, 5).map((plot, plotIndex) => (
                          <div
                            key={plot.id}
                            className={`flex items-start gap-2 text-sm ${
                              plot.completed ? 'opacity-50' : ''
                            }`}
                          >
                            <span className="text-gray-400 w-4 flex-shrink-0">
                              {plotIndex + 1}.
                            </span>
                            <span
                              className={`flex-1 ${
                                plot.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {plot.content.slice(0, 20)}
                              {plot.content.length > 20 ? '...' : ''}
                            </span>
                            <EmotionCircle
                              wordCountMet={plot.wordCountActual >= plot.wordCountTarget}
                              expectedEmotion={plot.emotionColors?.expected || 'white'}
                              actualEmotion={plot.emotionColors?.actual || 'white'}
                              size="small"
                              onEmotionChange={(type, colorId) =>
                                handleEmotionChange(chapter.id, plot.id, type, colorId)
                              }
                            />
                          </div>
                        ))}
                        {chapterPlots.length > 5 && (
                          <p className="text-xs text-gray-400 text-center">
                            还有 {chapterPlots.length - 5} 条...
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // 列表视图
          <div className="space-y-4">
            {chapters.map((chapter, index) => {
              const chapterPlots = plots[chapter.id] || [];
              const completedCount = chapterPlots.filter((p) => p.completed).length;

              return (
                <div
                  key={chapter.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
                >
                  <div
                    className="px-4 py-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between cursor-pointer"
                    onClick={() => handleChapterClick(chapter)}
                  >
                    <h3 className="font-medium text-gray-800 dark:text-white">
                      第{index + 1}章 {chapter.title || ''}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {completedCount}/{chapterPlots.length} 完成
                    </span>
                  </div>

                  {chapterPlots.length > 0 && (
                    <div className="p-4">
                      <div className="space-y-2">
                        {chapterPlots.map((plot, plotIndex) => (
                          <div
                            key={plot.id}
                            className={`flex items-start gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0 ${
                              plot.completed ? 'opacity-50' : ''
                            }`}
                          >
                            <span className="text-gray-400 w-6">
                              {plotIndex + 1}.
                            </span>
                            <span
                              className={`flex-1 ${
                                plot.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {plot.content}
                            </span>
                            <EmotionCircle
                              wordCountMet={plot.wordCountActual >= plot.wordCountTarget}
                              expectedEmotion={plot.emotionColors?.expected || 'white'}
                              actualEmotion={plot.emotionColors?.actual || 'white'}
                              size="small"
                              onEmotionChange={(type, colorId) =>
                                handleEmotionChange(chapter.id, plot.id, type, colorId)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Plot;

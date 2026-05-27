// 章节卡片组件
import { useState } from 'react';
import EmotionCircle from '../common/EmotionCircle';

function ChapterCard({ chapter, chapterNumber, plots, onUpdatePlot, onAddPlot }) {
  const [newPlotContent, setNewPlotContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddPlot = () => {
    if (!newPlotContent.trim()) return;
    onAddPlot(chapter.id, newPlotContent.trim());
    setNewPlotContent('');
    setIsAdding(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 min-h-[200px] flex flex-col">
      {/* 章节标题和目标字数 */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b dark:border-gray-700">
        <h3 className="font-semibold text-gray-800 dark:text-white">
          第{chapterNumber}章
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          目标: {chapter.target_word_count || 3000}
        </span>
      </div>

      {/* 情节列表 */}
      <div className="flex-1 space-y-2 mb-3">
        {plots.map((plot) => (
          <div
            key={plot.id}
            className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
          >
            <span className="flex-1 truncate">{plot.content}</span>
            <EmotionCircle emotions={plot.emotions} />
          </div>
        ))}
        {plots.length === 0 && (
          <p className="text-sm text-gray-400 italic">暂无情节</p>
        )}
      </div>

      {/* 添加情节 */}
      <div className="mt-auto">
        {isAdding ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newPlotContent}
              onChange={(e) => setNewPlotContent(e.target.value)}
              placeholder="情节内容..."
              className="flex-1 px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddPlot();
                if (e.key === 'Escape') setIsAdding(false);
              }}
            />
            <button
              onClick={handleAddPlot}
              className="px-2 py-1 text-sm text-primary"
            >
              ✓
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-2 py-1 text-sm text-gray-400"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-1 text-sm text-primary hover:bg-primary/10 rounded"
          >
            + 添加
          </button>
        )}
      </div>
    </div>
  );
}

export default ChapterCard;

// 情节-情绪卡片（写作页使用，可划掉已完成情节）
import { useBookStore } from '../../stores/useBookStore';
import { useEffect, useState } from 'react';

function PlotCard() {
  const { currentBook, currentChapter, chapters } = useBookStore();
  const [plots, setPlots] = useState([]);

  useEffect(() => {
    // TODO: 从API加载当前章节的情节数据
    if (currentChapter) {
      setPlots([]);
    }
  }, [currentChapter]);

  const handleToggleComplete = (plotId) => {
    setPlots((prev) =>
      prev.map((p) =>
        p.id === plotId ? { ...p, completed: !p.completed } : p
      )
    );
  };

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          📝 情节-情绪
        </span>
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto">
        {plots.map((plot) => (
          <div
            key={plot.id}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
              plot.completed
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => handleToggleComplete(plot.id)}
          >
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                plot.completed ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
            <span className={plot.completed ? 'line-through' : ''}>
              {plot.content}
            </span>
          </div>
        ))}
        {plots.length === 0 && (
          <p className="text-xs text-gray-400 italic px-3">暂无情节</p>
        )}
      </div>
    </div>
  );
}

export default PlotCard;

// 情节-情绪卡片（写作页使用，可划掉已完成情节，圆形3段标记）
import { useState, useEffect, useRef } from 'react';
import { useBookStore } from '../../stores/useBookStore';
import { EMOTION_COLORS } from '../../utils/constants';

// 情绪颜色
const EMOTION_MAP = {
  'deep-blue': '#1e3a5f',
  'light-blue': '#93c5fd',
  'white': '#f8fafc',
  'light-red': '#fca5a5',
  'deep-red': '#dc2626',
};

function PlotCard() {
  const { currentBook, currentChapter } = useBookStore();
  const [plots, setPlots] = useState([]);
  const [editingPlotId, setEditingPlotId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(null); // { plotId, type }
  
  // 模拟数据（实际应从API加载）
  useEffect(() => {
    if (currentChapter) {
      // TODO: 从plot store加载当前章节的情节
      setPlots([]);
    }
  }, [currentChapter]);

  // 切换完成状态
  const handleToggleComplete = (plotId) => {
    setPlots((prev) =>
      prev.map((p) =>
        p.id === plotId ? { ...p, completed: !p.completed } : p
      )
    );
  };

  // 开始编辑
  const handleStartEdit = (plot) => {
    setEditingPlotId(plot.id);
    setEditingContent(plot.content);
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (!editingContent.trim()) return;
    setPlots((prev) =>
      prev.map((p) =>
        p.id === editingPlotId ? { ...p, content: editingContent.trim() } : p
      )
    );
    setEditingPlotId(null);
    setEditingContent('');
  };

  // 删除情节
  const handleDelete = (plotId) => {
    if (!window.confirm('确定要删除这个情节吗？')) return;
    setPlots((prev) => prev.filter((p) => p.id !== plotId));
  };

  // 更新情绪颜色
  const handleEmotionChange = (plotId, type, colorId) => {
    setPlots((prev) =>
      prev.map((p) =>
        p.id === plotId
          ? {
              ...p,
              emotionColors: {
                ...p.emotionColors,
                [type]: colorId,
              },
            }
          : p
      )
    );
    setShowColorPicker(null);
  };

  // 添加新情节
  const handleAddPlot = () => {
    const newPlot = {
      id: Date.now().toString(),
      content: '',
      completed: false,
      orderIndex: plots.length,
      emotionColors: {
        wordCount: 'white',     // 字数达标
        expected: 'white',      // 预计情绪
        actual: 'white',        // 实际情绪
      },
      wordCountTarget: 3000,
      wordCountActual: 0,
    };
    setPlots((prev) => [...prev, newPlot]);
    setEditingPlotId(newPlot.id);
    setEditingContent('');
  };

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          📝 情节-情绪
        </span>
        <button
          onClick={handleAddPlot}
          className="p-1 text-xs text-primary hover:bg-primary/10 rounded"
          title="添加情节"
        >
          +
        </button>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {plots.map((plot, index) => {
          const isEditing = editingPlotId === plot.id;
          const emotionColors = plot.emotionColors || {
            wordCount: 'white',
            expected: 'white',
            actual: 'white',
          };
          const isWordCountMet = plot.wordCountActual >= plot.wordCountTarget;
          
          return (
            <div
              key={plot.id}
              className={`flex items-start gap-2 px-3 py-2 rounded-lg transition-colors ${
                plot.completed
                  ? 'bg-gray-100 dark:bg-gray-700/50'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {/* 序号 */}
              <span className="text-xs text-gray-400 w-4 flex-shrink-0 mt-0.5">
                {index + 1}.
              </span>
              
              {/* 内容 */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    onBlur={handleSaveEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSaveEdit();
                      }
                      if (e.key === 'Escape') {
                        setEditingPlotId(null);
                      }
                    }}
                    className="w-full px-2 py-1 text-sm border border-primary rounded resize-none dark:bg-gray-700 dark:text-white"
                    rows={2}
                    autoFocus
                    placeholder="输入情节内容..."
                  />
                ) : (
                  <span
                    onClick={() => handleStartEdit(plot)}
                    className={`text-sm cursor-pointer block ${
                      plot.completed
                        ? 'line-through text-gray-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {plot.content || <span className="italic text-gray-400">点击添加内容...</span>}
                  </span>
                )}
              </div>
              
              {/* 圆形3段标记 */}
              <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                {/* 上段：字数达标 */}
                <button
                  onClick={() => setShowColorPicker({ plotId: plot.id, type: 'wordCount' })}
                  className="w-4 h-2 rounded-t-full border border-gray-300"
                  style={{ backgroundColor: EMOTION_MAP[emotionColors.wordCount] }}
                  title={`字数: ${plot.wordCountActual || 0}/${plot.wordCountTarget || 3000}`}
                />
                {/* 中段：预计情绪 */}
                <button
                  onClick={() => setShowColorPicker({ plotId: plot.id, type: 'expected' })}
                  className="w-4 h-2 border-x border-gray-300"
                  style={{ backgroundColor: EMOTION_MAP[emotionColors.expected] }}
                  title="预计情绪"
                />
                {/* 下段：实际情绪 */}
                <button
                  onClick={() => setShowColorPicker({ plotId: plot.id, type: 'actual' })}
                  className="w-4 h-2 rounded-b-full border border-gray-300"
                  style={{ backgroundColor: EMOTION_MAP[emotionColors.actual] }}
                  title="实际情绪"
                />
              </div>
              
              {/* 完成勾选 */}
              <button
                onClick={() => handleToggleComplete(plot.id)}
                className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                  plot.completed
                    ? 'bg-success border-success text-white'
                    : 'border-gray-300 hover:border-success'
                }`}
              >
                {plot.completed && '✓'}
              </button>
              
              {/* 删除按钮 */}
              <button
                onClick={() => handleDelete(plot.id)}
                className="w-5 h-5 text-gray-400 hover:text-error flex-shrink-0"
              >
                ×
              </button>
              
              {/* 颜色选择器 */}
              {showColorPicker?.plotId === plot.id && (
                <div className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-2 z-50 flex gap-1">
                  {EMOTION_COLORS.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => handleEmotionChange(plot.id, showColorPicker.type, color.id)}
                      className="w-6 h-6 rounded-full border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color.color }}
                      title={color.name}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {plots.length === 0 && (
          <p className="text-xs text-gray-400 italic px-3 py-2 text-center">
            暂无情节，点击+添加
          </p>
        )}
      </div>
    </div>
  );
}

export default PlotCard;

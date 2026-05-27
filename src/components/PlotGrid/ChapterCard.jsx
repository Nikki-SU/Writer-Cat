// 章节卡片组件 - 正方形格子，格子内竖向列情节+右侧情绪圆
import { useState, useRef, useEffect } from 'react';
import EmotionCircle from '../common/EmotionCircle';
import { plotApi } from '../../api/plot';

function ChapterCard({
  chapter,
  chapterNumber,
  plots,
  isWordCountMet,
  expectedEmotion,
  actualEmotion,
  foreshadowCount,
  totalWordCount,
  targetWordCount,
  onDelete,
  onUpdateEmotion,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [newPlotContent, setNewPlotContent] = useState('');
  const [showEmotionPicker, setShowEmotionPicker] = useState(false);
  const emotionButtonRef = useRef(null);
  const [pickerPos, setPickerPos] = useState({ x: 0, y: 0 });

  // 状态边框颜色
  const getBorderColor = () => {
    if (plots.some(p => p.status === 'resolved')) return '#00A087'; // 已完成
    if (plots.length > 0) return '#4DBBD5'; // 进行中
    return '#8491B4'; // 空
  };

  // 添加新情节
  const handleAddPlot = async () => {
    if (!newPlotContent.trim()) return;
    try {
      await plotApi.createPlot({
        book_id: chapter.book_id,
        title: newPlotContent.trim(),
        description: '',
        chapter_id: chapter.id,
        target_word_count: 3000,
      });
      setNewPlotContent('');
      setIsEditing(false);
      // 触发父组件刷新
      window.location.reload();
    } catch (e) {
      console.error('添加情节失败:', e);
    }
  };

  // 打开情绪选择器（贴近情绪圆位置）
  const handleOpenEmotionPicker = (e) => {
    e.stopPropagation();
    const rect = emotionButtonRef.current?.getBoundingClientRect();
    if (rect) {
      setPickerPos({ x: rect.right + 8, y: rect.top - 60 });
    }
    setShowEmotionPicker(!showEmotionPicker);
  };

  // 选择情绪
  const handleSelectEmotion = (type, emotion) => {
    // 更新所有情节的情绪
    plots.forEach(plot => {
      onUpdateEmotion(plot.id, type, emotion);
    });
    setShowEmotionPicker(false);
  };

  return (
    <div
      className="aspect-square rounded-xl border-2 p-2 flex flex-col cursor-pointer transition hover:shadow-lg group relative bg-white"
      style={{
        borderColor: getBorderColor(),
      }}
      onClick={() => setIsEditing(!isEditing)}
    >
      {/* 章节标题 */}
      <div className="flex items-center justify-between mb-1 flex-shrink-0">
        <h4 className="text-xs font-medium text-body truncate flex-1">
          第{chapterNumber}章
        </h4>
        {/* 伏笔标记 */}
        {foreshadowCount > 0 && (
          <span className="text-xs text-warning ml-1" title={`${foreshadowCount}个伏笔`}>
            📌{foreshadowCount}
          </span>
        )}
      </div>

      {/* 章节名称 */}
      <div className="text-xs text-secondary truncate mb-1 flex-shrink-0">
        {chapter.title || '未命名'}
      </div>

      {/* 情节列表 - 竖向排列 */}
      <div className="flex-1 overflow-hidden">
        {plots.slice(0, 4).map((plot, idx) => (
          <div
            key={plot.id}
            className="text-xs text-gray-600 truncate py-0.5 pl-1 border-l-2 border-gray-200"
            title={plot.title}
          >
            {plot.title}
          </div>
        ))}
        {plots.length > 4 && (
          <div className="text-xs text-gray-400 truncate py-0.5 pl-1">
            ...+{plots.length - 4}更多
          </div>
        )}
        {plots.length === 0 && (
          <div className="text-xs text-gray-400 italic py-2 pl-1">
            点击添加情节
          </div>
        )}
      </div>

      {/* 底部：字数统计 + 情绪圆 */}
      <div className="flex items-end justify-between mt-1 flex-shrink-0">
        {/* 字数统计 */}
        <div className="text-xs">
          <span className={isWordCountMet ? 'text-success' : 'text-error'}>
            {totalWordCount.toLocaleString()}
          </span>
          <span className="text-gray-400">/{targetWordCount}</span>
        </div>

        {/* 情绪圆 - 格子内 */}
        <div ref={emotionButtonRef} onClick={handleOpenEmotionPicker}>
          <EmotionCircle
            expected={expectedEmotion}
            actual={actualEmotion}
            wordCountMet={isWordCountMet}
            size={32}
          />
        </div>
      </div>

      {/* 删除按钮 - hover显示 */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(chapter.id); }}
        className="absolute top-1 right-1 w-5 h-5 opacity-0 group-hover:opacity-100 bg-red-100 text-red-500 rounded-full text-xs flex items-center justify-center transition"
      >
        ×
      </button>

      {/* 情绪选择器 - 贴近情绪圆 */}
      {showEmotionPicker && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-xl border p-3"
          style={{
            left: `${pickerPos.x}px`,
            top: `${pickerPos.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-xs text-gray-500 mb-2">预计情绪:</div>
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map(emotion => (
              <button
                key={`exp-${emotion}`}
                onClick={() => handleSelectEmotion('expected', emotion)}
                className="w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform"
                style={{
                  backgroundColor: emotion === 1 ? '#1A237E' :
                    emotion === 2 ? '#64B5F6' :
                    emotion === 3 ? '#FFFFFF' :
                    emotion === 4 ? '#EF9A9A' : '#B71C1C',
                  borderColor: expectedEmotion === emotion ? '#4DBBD5' : '#e5e7eb',
                }}
              />
            ))}
          </div>
          <div className="text-xs text-gray-500 mb-2">实际情绪:</div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(emotion => (
              <button
                key={`act-${emotion}`}
                onClick={() => handleSelectEmotion('actual', emotion)}
                className="w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform"
                style={{
                  backgroundColor: emotion === 1 ? '#1A237E' :
                    emotion === 2 ? '#64B5F6' :
                    emotion === 3 ? '#FFFFFF' :
                    emotion === 4 ? '#EF9A9A' : '#B71C1C',
                  borderColor: actualEmotion === emotion ? '#4DBBD5' : '#e5e7eb',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* 点击外部关闭选择器 */}
      {showEmotionPicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={(e) => { e.stopPropagation(); setShowEmotionPicker(false); }}
        />
      )}
    </div>
  );
}

export default ChapterCard;

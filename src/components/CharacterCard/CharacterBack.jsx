// 人物卡片反面 - 时间线
import { useState, useEffect } from 'react';

function CharacterBack({ character, onFlip, onUpdate }) {
  const [timeline, setTimeline] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ chapter: '', content: '' });

  useEffect(() => {
    setTimeline(character.timeline || []);
  }, [character.id]);

  const handleAiGenerate = async () => {
    setIsGenerating(true);
    // TODO: 调用AI生成时间线
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  const handleAddEvent = () => {
    if (!newEvent.content.trim()) return;
    const event = {
      id: Date.now().toString(),
      chapter: newEvent.chapter,
      content: newEvent.content,
    };
    const updatedTimeline = [...timeline, event];
    setTimeline(updatedTimeline);
    if (onUpdate) {
      onUpdate({ timeline: updatedTimeline });
    }
    setNewEvent({ chapter: '', content: '' });
    setShowAddEvent(false);
  };

  const handleDeleteEvent = (eventId) => {
    const updatedTimeline = timeline.filter((e) => e.id !== eventId);
    setTimeline(updatedTimeline);
    if (onUpdate) {
      onUpdate({ timeline: updatedTimeline });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 h-full overflow-y-auto">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {character.name} · 时间线
        </h2>
        <button
          onClick={onFlip}
          className="text-sm text-primary hover:underline"
        >
          ← 正面
        </button>
      </div>

      {/* 时间线 */}
      <div className="space-y-4">
        {timeline.map((event, index) => (
          <div
            key={event.id || index}
            className="relative pl-6 pb-4 border-l-2 border-gray-200 dark:border-gray-700 last:border-0"
          >
            <div className="absolute left-0 top-0 w-3 h-3 -translate-x-1.5 rounded-full bg-primary" />
            <div>
              {event.chapter && (
                <h4 className="font-medium text-gray-800 dark:text-white">
                  {event.chapter}
                </h4>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {event.content}
              </p>
            </div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => handleDeleteEvent(event.id || index)}
                className="text-xs text-red-500 hover:text-red-600"
              >
                删除
              </button>
            </div>
          </div>
        ))}

        {timeline.length === 0 && !showAddEvent && (
          <p className="text-sm text-gray-400 italic text-center py-8">
            暂无时间线记录
          </p>
        )}
      </div>

      {/* 添加事件表单 */}
      {showAddEvent && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <input
            type="text"
            value={newEvent.chapter}
            onChange={(e) => setNewEvent({ ...newEvent, chapter: e.target.value })}
            placeholder="章节（如：第3章）"
            className="w-full px-3 py-2 mb-2 text-sm border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
          />
          <textarea
            value={newEvent.content}
            onChange={(e) => setNewEvent({ ...newEvent, content: e.target.value })}
            placeholder="事件内容..."
            className="w-full px-3 py-2 mb-2 text-sm border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white resize-none"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddEvent}
              className="flex-1 px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90"
            >
              添加
            </button>
            <button
              onClick={() => setShowAddEvent(false)}
              className="flex-1 px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="mt-6 pt-6 border-t dark:border-gray-700 space-y-2">
        <button
          onClick={() => setShowAddEvent(true)}
          className="w-full px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
        >
          + 手动添加事件
        </button>
        <button
          onClick={handleAiGenerate}
          disabled={isGenerating}
          className="w-full px-4 py-2 text-sm bg-primary text-white hover:bg-primary/90 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <span className="animate-spin">⏳</span>
              AI生成中...
            </>
          ) : (
            <>
              🧠 AI生成时间线
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default CharacterBack;

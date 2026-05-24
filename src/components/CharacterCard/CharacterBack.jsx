// 人物卡片反面 - 时间线
import { useState, useEffect } from 'react';

function CharacterBack({ character, onFlip }) {
  const [timeline, setTimeline] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // TODO: 从API加载时间线数据
    setTimeline([]);
  }, [character.id]);

  const handleAiGenerate = async () => {
    setIsGenerating(true);
    // TODO: 调用AI生成时间线
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  const handleAddEvent = () => {
    // TODO: 打开添加事件弹窗
    console.log('添加事件');
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
          ← 翻回正面
        </button>
      </div>

      {/* 时间线 */}
      <div className="space-y-4">
        {timeline.map((event, index) => (
          <div key={event.id} className="relative pl-6 pb-4 border-l-2 border-gray-200 dark:border-gray-700 last:border-0">
            <div className="absolute left-0 top-0 w-3 h-3 -translate-x-1.5 rounded-full bg-primary" />
            <div>
              <h4 className="font-medium text-gray-800 dark:text-white">
                {event.chapter_title}
              </h4>
              <ul className="mt-2 space-y-1">
                {event.events.map((e, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span>·</span>
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
              {event.personality_change && (
                <p className="mt-2 text-xs text-primary italic">
                  性格变化: {event.personality_change}
                </p>
              )}
            </div>
            <div className="mt-2 flex gap-2">
              <button className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                编辑
              </button>
              <button className="text-xs text-red-500 hover:text-red-600">
                删除
              </button>
            </div>
          </div>
        ))}

        {timeline.length === 0 && (
          <p className="text-sm text-gray-400 italic text-center py-8">
            暂无时间线记录
          </p>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="mt-6 pt-6 border-t dark:border-gray-700 space-y-2">
        <button
          onClick={handleAddEvent}
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
              🤖 AI生成时间线
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default CharacterBack;

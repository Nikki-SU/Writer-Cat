// fix: 双面人物卡片（规格书要求）
// 正面=基本信息，反面=人物时间线（调用API加载真实时间线）
import { useState, useEffect } from 'react';
import { characterApi } from '../../api/character';

export default function CharacterCard({
  character,
  isSelected,
  onClick,
  onDelete,
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  // 加载时间线
  useEffect(() => {
    if (isFlipped && character?.id) {
      loadTimeline();
    }
  }, [isFlipped, character?.id]);

  const loadTimeline = async () => {
    if (!character?.id) return;
    setLoadingTimeline(true);
    try {
      const events = await characterApi.getTimelineEvents(character.id);
      setTimeline(events || []);
    } catch (e) {
      console.error('加载时间线失败:', e);
      setTimeline([]);
    }
    setLoadingTimeline(false);
  };

  const handleFlip = (e) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className={`relative h-40 cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onClick}
      style={{
        perspective: '1000px',
      }}
    >
      <div
        className="relative w-full h-full transition-transform duration-300"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* 正面 */}
        <div
          className="absolute inset-0 p-4 rounded-xl border bg-white shadow-sm overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-body">{character.name}</h3>
              {character.nickname && (
                <p className="text-xs text-secondary">({character.nickname})</p>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-secondary hover:text-error text-sm"
            >
              ×
            </button>
          </div>

          <div className="mt-3 space-y-1 text-xs">
            {character.gender && (
              <p className="text-secondary">性别: {character.gender}</p>
            )}
            {character.age && (
              <p className="text-secondary">年龄: {character.age}</p>
            )}
            {character.role && (
              <p className="text-secondary">角色: {character.role}</p>
            )}
          </div>

          <button
            onClick={handleFlip}
            className="absolute bottom-2 right-2 text-xs text-secondary hover:text-primary"
          >
            时间线 →
          </button>
        </div>

        {/* 反面 - 时间线 */}
        <div
          className="absolute inset-0 p-4 rounded-xl border bg-primary/5 shadow-sm overflow-auto"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-primary text-sm">{character.name}</h3>
            <button
              onClick={handleFlip}
              className="text-xs text-secondary hover:text-primary"
            >
              ← 基本信息
            </button>
          </div>

          {loadingTimeline ? (
            <div className="text-center py-4">
              <span className="animate-spin">⏳</span>
              <p className="text-xs text-secondary mt-1">加载中...</p>
            </div>
          ) : timeline.length > 0 ? (
            <div className="space-y-1 text-xs">
              {timeline.slice(0, 5).map((event, idx) => (
                <div
                  key={event.id || idx}
                  className="flex items-start gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    {event.chapter && (
                      <span className="text-primary font-medium">{event.chapter}</span>
                    )}
                    <p className="text-secondary truncate">{event.content}</p>
                    {event.personality_change && (
                      <p className="text-warning text-[10px]">
                        性格变化: {event.personality_change}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {timeline.length > 5 && (
                <p className="text-xs text-gray-400 italic text-center">
                  + 还有 {timeline.length - 5} 条记录
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-secondary">
              <p className="text-xs">暂无时间线记录</p>
              <p className="text-[10px] mt-1">在写作过程中自动生成</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

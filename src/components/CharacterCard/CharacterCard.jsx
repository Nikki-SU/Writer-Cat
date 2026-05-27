// 双面人物卡片
import { useState } from 'react';

export default function CharacterCard({ character, isSelected, onClick, onDelete }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = (e) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className={`relative h-40 cursor-pointer perspective-1000 ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onClick}
    >
      <div
        className={`relative w-full h-full transition-transform duration-300 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* 正面 */}
        <div
          className="absolute inset-0 p-4 rounded-xl border bg-white backface-hidden"
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
              ✕
            </button>
          </div>

          <div className="mt-3 space-y-1 text-xs">
            {character.gender && (
              <p className="text-secondary">性别: {character.gender}</p>
            )}
            {character.age && (
              <p className="text-secondary">年龄: {character.age}</p>
            )}
          </div>

          <button
            onClick={handleFlip}
            className="absolute bottom-2 right-2 text-xs text-secondary hover:text-primary"
          >
            时间线 →
          </button>
        </div>

        {/* 反面 */}
        <div
          className="absolute inset-0 p-4 rounded-xl border bg-primary/5 backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-primary">{character.name}</h3>
            <button
              onClick={handleFlip}
              className="text-xs text-secondary hover:text-primary"
            >
              ← 基本信息
            </button>
          </div>

          <div className="mt-3 text-xs text-secondary max-h-24 overflow-auto">
            {character.background ? (
              <p className="whitespace-pre-wrap">{character.background}</p>
            ) : (
              <p>暂无时间线信息</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

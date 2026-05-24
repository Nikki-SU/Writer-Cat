// 伏笔列表（只显示未完成的伏笔）
import { useEffect, useState } from 'react';

function ForeshadowList() {
  const [foreshadows, setForeshadows] = useState([]);

  useEffect(() => {
    // TODO: 从API加载未完成的伏笔数据
    setForeshadows([]);
  }, []);

  const handleRevealForeshadow = (foreshadowId) => {
    // 打开圆伏笔编辑
    console.log('圆伏笔:', foreshadowId);
  };

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          🎯 伏笔（未完成）
        </span>
      </div>

      <div className="space-y-1 max-h-48 overflow-y-auto">
        {foreshadows.map((f) => (
          <div
            key={f.id}
            className="px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-gray-700"
          >
            <div className="flex items-start justify-between">
              <span className="text-gray-700 dark:text-gray-300">
                ▫ {f.name}
              </span>
              <button
                onClick={() => handleRevealForeshadow(f.id)}
                className="text-xs text-primary hover:underline whitespace-nowrap"
              >
                圆伏笔
              </button>
            </div>
            {f.bury_chapter_title && (
              <p className="text-xs text-gray-400 mt-1">
                埋: {f.bury_chapter_title}
              </p>
            )}
          </div>
        ))}
        {foreshadows.length === 0 && (
          <p className="text-xs text-gray-400 italic px-3">暂无未完成的伏笔</p>
        )}
      </div>
    </div>
  );
}

export default ForeshadowList;

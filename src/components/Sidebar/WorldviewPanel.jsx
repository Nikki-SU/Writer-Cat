// 世界观面板（可检索）
import { useState, useEffect } from 'react';

function WorldviewPanel({ editorRef }) {
  const [worldviews, setWorldviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // TODO: 从API加载世界观数据
    setWorldviews([]);
  }, []);

  const filteredWorldviews = worldviews.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleWorldviewClick = (worldview) => {
    // TODO: 显示世界观详情
    console.log('点击世界观:', worldview);
  };

  return (
    <div className="px-4 py-2">
      {/* 搜索框 */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="搜索世界观..."
        className="w-full px-3 py-1.5 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-2"
      />

      {/* 世界观列表 */}
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {filteredWorldviews.map((w) => (
          <div
            key={w.id}
            onClick={() => handleWorldviewClick(w)}
            className="px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
          >
            🌍 {w.name}
          </div>
        ))}
        {filteredWorldviews.length === 0 && (
          <p className="text-xs text-gray-400 italic text-center py-2">
            暂无世界观
          </p>
        )}
      </div>
    </div>
  );
}

export default WorldviewPanel;

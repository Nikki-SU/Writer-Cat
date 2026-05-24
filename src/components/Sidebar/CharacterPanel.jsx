// 人物面板（可检索）
import { useState, useEffect } from 'react';

function CharacterPanel({ editorRef }) {
  const [characters, setCharacters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedCharacters, setHighlightedCharacters] = useState([]);

  useEffect(() => {
    // TODO: 从API加载人物数据
    setCharacters([]);
  }, []);

  const filteredCharacters = characters.filter((char) =>
    char.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCharacterClick = (character) => {
    // TODO: 在左边栏展开人物卡片（不弹窗）
    console.log('点击人物:', character);
  };

  const handleAiFindCharacters = async () => {
    // TODO: 调用AI识别当前章节的人物
    console.log('AI查找人物');
  };

  return (
    <div className="px-4 py-2">
      {/* 搜索框 */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="搜索人物..."
        className="w-full px-3 py-1.5 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-2"
      />

      {/* 人物列表 */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {filteredCharacters.map((char) => (
          <div
            key={char.id}
            onClick={() => handleCharacterClick(char)}
            className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
              highlightedCharacters.includes(char.id)
                ? 'bg-primary/10 ring-1 ring-primary'
                : 'hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm">
              {char.avatar || '👤'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                {char.name}
              </p>
              {char.lastChapter && (
                <p className="text-xs text-gray-400">
                  上次: {char.lastChapter}
                </p>
              )}
            </div>
            {highlightedCharacters.includes(char.id) && (
              <span className="text-xs text-primary">📌本章节出现</span>
            )}
          </div>
        ))}
        {filteredCharacters.length === 0 && (
          <p className="text-xs text-gray-400 italic text-center py-2">
            暂无人物
          </p>
        )}
      </div>

      {/* AI查找人物按钮 */}
      <button
        onClick={handleAiFindCharacters}
        className="w-full mt-2 px-3 py-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg"
      >
        👤 AI查找人物
      </button>
    </div>
  );
}

export default CharacterPanel;

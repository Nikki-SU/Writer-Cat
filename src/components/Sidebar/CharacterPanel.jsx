// fix: 人物面板（可检索，标记本章节出现的人物）
import { useState, useEffect, useCallback } from 'react';

function CharacterPanel({ editorRef }) {
  const [characters, setCharacters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedCharacters, setHighlightedCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  // 从API加载人物数据（实际应从store获取）
  useEffect(() => {
    // TODO: 从character store或API加载
    setCharacters([]);
  }, []);

  // 检测当前章节出现的人物
  const detectCharactersInChapter = useCallback(async () => {
    // TODO: 调用AI检测
    const detected = [];
    characters.forEach((char) => {
      // 实际应从编辑器获取内容
      // if (content.includes(char.name)) {
      //   detected.push(char.id);
      // }
    });
    setHighlightedCharacters(detected);
  }, [characters]);

  // 搜索过滤
  const filteredCharacters = characters.filter((char) =>
    char.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 点击人物 - 在左边栏展开卡片
  const handleCharacterClick = (character) => {
    setSelectedCharacter(selectedCharacter?.id === character.id ? null : character);
  };

  return (
    <div className="px-4 py-2">
      {/* 搜索框 */}
      <div className="relative mb-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索人物..."
          className="w-full px-3 py-1.5 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-8"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {/* 人物列表 */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {filteredCharacters.map((char) => {
          const isHighlighted = highlightedCharacters.includes(char.id);
          const isSelected = selectedCharacter?.id === char.id;
          
          return (
            <div key={char.id}>
              <div
                onClick={() => handleCharacterClick(char)}
                className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                  isSelected
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
                      {char.lastChapter}
                    </p>
                  )}
                </div>
                {isHighlighted && (
                  <span className="text-xs text-primary" title="本章节出现">
                    📌
                  </span>
                )}
              </div>
              
              {/* 展开的人物卡片 */}
              {isSelected && (
                <div className="mt-2 p-3 bg-white dark:bg-gray-700 rounded-lg border border-primary/20">
                  <div className="space-y-2 text-sm">
                    {char.gender && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">性别:</span>
                        <span>{char.gender === 'male' ? '男' : char.gender === 'female' ? '女' : '其他'}</span>
                      </div>
                    )}
                    {char.age > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">年龄:</span>
                        <span>{char.age}</span>
                      </div>
                    )}
                    {char.intro && (
                      <div>
                        <span className="text-gray-400">简介:</span>
                        <p className="mt-1 text-gray-700 dark:text-gray-300">{char.intro}</p>
                      </div>
                    )}
                    {char.personality && (
                      <div>
                        <span className="text-gray-400">性格:</span>
                        <p className="mt-1 text-gray-700 dark:text-gray-300">{char.personality}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filteredCharacters.length === 0 && (
          <p className="text-xs text-gray-400 italic text-center py-2">
            {characters.length === 0 ? '暂无人物' : '无匹配人物'}
          </p>
        )}
      </div>

      {/* AI检测按钮 */}
      <button
        onClick={detectCharactersInChapter}
        className="w-full mt-2 px-3 py-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg border border-primary/20"
      >
        🔍 检测本章人物
      </button>
    </div>
  );
}

export default CharacterPanel;

// fix: 左侧栏组件
import { useState } from 'react';

export default function Sidebar({
  chapters,
  currentChapter,
  foreshadows,
  worldviews,
  threads,
  activeTab,
  onTabChange,
  onSelectChapter,
  onCreateChapter,
}) {
  const [worldviewExpanded, setWorldviewExpanded] = useState(false);
  const [characterExpanded, setCharacterExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { key: 'chapters', label: '章节', icon: '📑' },
    { key: 'plot', label: '情节', icon: '📊' },
    { key: 'foreshadow', label: '伏笔', icon: '📌' },
    { key: 'thread', label: '线索', icon: '🔗' },
    { key: 'character', label: '人物', icon: '👤' },
    { key: 'worldview', label: '世界观', icon: '🌍' },
  ];

  // 过滤函数
  const filterBySearch = (items, searchKey) => {
    if (!searchQuery) return items;
    return items.filter(item =>
      (item[searchKey] || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="w-64 border-r bg-white flex flex-col">
      {/* 标签栏 */}
      <div className="flex flex-wrap gap-1 p-2 border-b">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`px-2 py-1 text-xs rounded transition ${
              activeTab === tab.key
                ? 'bg-primary text-white'
                : 'text-secondary hover:bg-gray-100'
            }`}
            title={tab.label}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      {/* 搜索框（人物和世界观可用） */}
      {(activeTab === 'character' || activeTab === 'worldview') && (
        <div className="p-2 border-b">
          <input
            type="text"
            placeholder="搜索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      {/* 内容区域 */}
      <div className="flex-1 overflow-auto p-2">
        {/* 章节 */}
        {activeTab === 'chapters' && (
          <div>
            <button
              onClick={onCreateChapter}
              className="w-full px-3 py-2 text-sm text-left text-primary hover:bg-primary/5 rounded transition"
            >
              + 新建章节
            </button>
            {chapters.map((ch, i) => (
              <div
                key={ch.id}
                onClick={() => onSelectChapter(ch)}
                className={`px-3 py-2 text-sm cursor-pointer rounded transition ${
                  currentChapter?.id === ch.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-body hover:bg-gray-100'
                }`}
              >
                <div className="flex justify-between">
                  <span className="truncate">{ch.title}</span>
                  <span className="text-xs text-secondary ml-2">{ch.word_count}字</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 情节 */}
        {activeTab === 'plot' && (
          <div className="text-sm text-secondary">
            {chapters.length === 0 ? '暂无章节' : `共 ${chapters.length} 章`}
          </div>
        )}

        {/* 伏笔 */}
        {activeTab === 'foreshadow' && (
          <div>
            {foreshadows.map(fs => (
              <div
                key={fs.id}
                className={`px-3 py-2 text-sm rounded transition ${
                  fs.status === 'resolved'
                    ? 'text-success'
                    : 'text-body'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>📌</span>
                  <span className="truncate">{fs.title}</span>
                </div>
              </div>
            ))}
            {foreshadows.length === 0 && (
              <div className="text-sm text-secondary px-3 py-2">暂无伏笔</div>
            )}
          </div>
        )}

        {/* 线索 */}
        {activeTab === 'thread' && (
          <div>
            {threads.map(t => (
              <div key={t.id} className="px-3 py-2 text-sm">
                <div className="flex items-center gap-1">
                  <span>🔗</span>
                  <span>{t.title}</span>
                </div>
                <div className="text-xs text-secondary mt-1">
                  {t.nodes?.length || 0} 个节点
                </div>
              </div>
            ))}
            {threads.length === 0 && (
              <div className="text-sm text-secondary px-3 py-2">暂无线索</div>
            )}
          </div>
        )}

        {/* 人物 */}
        {activeTab === 'character' && (
          <div>
            <div
              onClick={() => setCharacterExpanded(!characterExpanded)}
              className="px-3 py-2 text-sm font-medium cursor-pointer flex justify-between items-center"
            >
              <span>👤 人物 ({threads.length})</span>
              <span>{characterExpanded ? '▼' : '▶'}</span>
            </div>
            {characterExpanded && (
              <div className="pl-2">
                {/* TODO: 替换为真实的人物数据 */}
                {filterBySearch([], 'name').map(char => (
                  <div key={char.id} className="px-3 py-2 text-sm text-body">
                    <div className="flex items-center gap-1">
                      <span>📍</span>
                      <span>{char.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 世界观 */}
        {activeTab === 'worldview' && (
          <div>
            <div
              onClick={() => setWorldviewExpanded(!worldviewExpanded)}
              className="px-3 py-2 text-sm font-medium cursor-pointer flex justify-between items-center"
            >
              <span>🌍 世界观 ({worldviews.length})</span>
              <span>{worldviewExpanded ? '▼' : '▶'}</span>
            </div>
            {worldviewExpanded && (
              <div className="pl-2">
                {filterBySearch(worldviews, 'title').map(w => (
                  <div key={w.id} className="px-3 py-2 text-sm text-body">
                    <div className="flex items-center gap-1">
                      <span>📖</span>
                      <span>{w.title}</span>
                    </div>
                    {w.category && (
                      <div className="text-xs text-secondary mt-0.5">{w.category}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

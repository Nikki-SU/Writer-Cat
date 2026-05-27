// 左边栏主组件
import { useState, useEffect } from 'react';
import useBookStore from '../../stores/useBookStore';
import useStructureStore from '../../stores/useStructureStore';
import BookList from './BookList';
import ChapterList from './ChapterList';
import PlotCard from './PlotCard';
import ForeshadowList from './ForeshadowList';
import ThreadList from './ThreadList';
import CharacterPanel from './CharacterPanel';
import WorldviewPanel from './WorldviewPanel';

function LeftSidebar({ onClose, editorRef }) {
  const { currentBook } = useBookStore();
  const { loadForeshadows, loadWorldviews, loadThreads } = useStructureStore();
  
  const [expandedSections, setExpandedSections] = useState({
    book: true,
    chapter: true,
    plot: true,
    foreshadow: true,
    thread: true,
    character: true,
    worldview: false,
  });

  // 加载结构数据
  useEffect(() => {
    if (currentBook) {
      loadForeshadows(currentBook.id);
      loadWorldviews(currentBook.id);
      loadThreads(currentBook.id);
    }
  }, [currentBook, loadForeshadows, loadWorldviews, loadThreads]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="w-72 border-r dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col overflow-hidden">
      {/* 头部 */}
      <div className="px-4 py-3 border-b dark:border-gray-700 flex items-center justify-between">
        <span className="font-medium text-gray-800 dark:text-white">功能面板</span>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ←
        </button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto">
        {/* 书目（不可折叠） */}
        <section className="border-b dark:border-gray-700">
          <BookList />
        </section>

        {/* 章节目录（不可折叠） */}
        <section className="border-b dark:border-gray-700">
          <ChapterList />
        </section>

        {/* 情节-情绪（不可折叠） */}
        <section className="border-b dark:border-gray-700">
          <PlotCard />
        </section>

        {/* 伏笔（不可折叠，只显示未完成） */}
        <section className="border-b dark:border-gray-700">
          <ForeshadowList />
        </section>

        {/* 线索/长伏笔（不可折叠，只显示未完成） */}
        <section className="border-b dark:border-gray-700">
          <ThreadList />
        </section>

        {/* 人物（可折叠，可检索） */}
        <section className="border-b dark:border-gray-700">
          <div
            className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => toggleSection('character')}
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              👤 人物
            </span>
            <span className="text-gray-400">
              {expandedSections.character ? '▼' : '▶'}
            </span>
          </div>
          {expandedSections.character && (
            <div className="pb-2">
              <CharacterPanel editorRef={editorRef} />
            </div>
          )}
        </section>

        {/* 世界观（可折叠，可检索，有条目+挂载按钮） */}
        <section>
          <div
            className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => toggleSection('worldview')}
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              🌍 世界观
            </span>
            <span className="text-gray-400">
              {expandedSections.worldview ? '▼' : '▶'}
            </span>
          </div>
          {expandedSections.worldview && (
            <div className="pb-2">
              <WorldviewPanel editorRef={editorRef} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default LeftSidebar;

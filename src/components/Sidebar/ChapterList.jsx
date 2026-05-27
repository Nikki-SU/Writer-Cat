// 章节目录
import useBookStore from '../../stores/useBookStore';
import { useState } from 'react';

function ChapterList() {
  const { chapters, currentChapter, selectChapter, createChapter } = useBookStore();
  const [showNewChapter, setShowNewChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');

  const handleCreateChapter = async () => {
    if (!newChapterTitle.trim()) return;
    await createChapter(newChapterTitle.trim());
    setNewChapterTitle('');
    setShowNewChapter(false);
  };

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          📚 章节目录
        </span>
        <button
          onClick={() => setShowNewChapter(true)}
          className="text-xs text-primary hover:underline"
        >
          +新章节
        </button>
      </div>

      <div className="space-y-1 max-h-48 overflow-y-auto">
        {chapters.map((chapter, index) => (
          <button
            key={chapter.id}
            onClick={() => selectChapter(chapter.id)}
            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
              currentChapter?.id === chapter.id
                ? 'bg-primary text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            第{index + 1}章 {chapter.title || ''}
          </button>
        ))}
        {chapters.length === 0 && (
          <p className="text-xs text-gray-400 italic px-3">暂无章节</p>
        )}
      </div>

      {/* 新建章节输入框 */}
      {showNewChapter && (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={newChapterTitle}
            onChange={(e) => setNewChapterTitle(e.target.value)}
            placeholder="章节标题"
            className="flex-1 px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateChapter();
              if (e.key === 'Escape') setShowNewChapter(false);
            }}
          />
          <button
            onClick={handleCreateChapter}
            className="px-3 py-2 text-sm bg-primary text-white rounded-lg"
          >
            ✓
          </button>
          <button
            onClick={() => {
              setShowNewChapter(false);
              setNewChapterTitle('');
            }}
            className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default ChapterList;

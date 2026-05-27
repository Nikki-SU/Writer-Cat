// 情节页 - 5×4正方形网格，每章一个格子（规格书要求）
import { useEffect, useState } from 'react';
import useBookStore from '../stores/useBookStore';
import useStructureStore from '../stores/useStructureStore';
import { plotApi } from '../api/plot';
import ChapterCard from '../components/PlotGrid/ChapterCard';

export default function Plot() {
  const { currentBook, chapters } = useBookStore();
  const { foreshadows, loadStructures } = useStructureStore();
  const [plots, setPlots] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [createButtonPos, setCreateButtonPos] = useState({ x: 0, y: 0 });

  // 加载情节数据
  useEffect(() => {
    if (currentBook) {
      loadStructures(currentBook.id);
      loadPlots();
    }
  }, [currentBook]);

  const loadPlots = async () => {
    if (!currentBook) return;
    try {
      const data = await plotApi.getPlots(currentBook.id);
      setPlots(data);
    } catch (e) {
      console.error('加载情节失败:', e);
    }
  };

  // 打开创建弹窗（贴近按钮）
  const handleOpenCreate = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCreateButtonPos({ x: rect.left, y: rect.bottom });
    setShowCreate(true);
  };

  // 创建情节
  const handleCreate = async () => {
    if (!newTitle.trim() || !currentBook) return;
    try {
      await plotApi.createPlot({
        book_id: currentBook.id,
        title: newTitle.trim(),
        description: newDesc.trim() || null,
        chapter_id: null,
        target_word_count: 3000,
      });
      setNewTitle('');
      setNewDesc('');
      setShowCreate(false);
      loadPlots();
    } catch (e) {
      console.error('创建情节失败:', e);
    }
  };

  // 删除情节
  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个情节吗？')) return;
    try {
      await plotApi.deletePlot(id);
      loadPlots();
    } catch (e) {
      console.error('删除情节失败:', e);
    }
  };

  // 更新情节的情绪
  const handleUpdateEmotion = async (plotId, position, emotion) => {
    try {
      await plotApi.updateEmotion(plotId, position, { emotion });
      loadPlots();
    } catch (e) {
      console.error('更新情绪失败:', e);
    }
  };

  // 计算字数是否达标
  const isWordCountOk = (plot) => (plot.actual_word_count || 0) >= (plot.target_word_count || 3000);

  // 获取章节对应的伏笔数量
  const getForeshadowCount = (chapterId) => {
    if (!chapterId) return 0;
    return foreshadows.filter(f =>
      f.buried_chapter_id === chapterId || f.resolved_chapter_id === chapterId
    ).length;
  };

  // 分配情节到章节
  const getPlotsForChapter = (chapterId) => {
    return plots.filter(p => p.chapter_id === chapterId);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-body">📊 情节总览</h1>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition text-sm"
        >
          + 添加情节
        </button>
      </div>

      {/* 5×4 正方形网格 */}
      <div className="grid grid-cols-5 gap-3">
        {chapters.map((chapter, index) => {
          const chapterPlots = getPlotsForChapter(chapter.id);
          const totalWordCount = chapterPlots.reduce((sum, p) => sum + (p.actual_word_count || 0), 0);
          const targetWordCount = chapter.target_word_count || 3000;
          const isOk = totalWordCount >= targetWordCount;
          
          // 计算平均情绪
          const avgExpected = chapterPlots.length > 0
            ? Math.round(chapterPlots.reduce((sum, p) => sum + (p.expected_emotion || 3), 0) / chapterPlots.length)
            : 3;
          const avgActual = chapterPlots.length > 0
            ? Math.round(chapterPlots.reduce((sum, p) => sum + (p.actual_emotion || 3), 0) / chapterPlots.length)
            : 3;

          return (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              chapterNumber={index + 1}
              plots={chapterPlots}
              isWordCountMet={isOk}
              expectedEmotion={avgExpected}
              actualEmotion={avgActual}
              foreshadowCount={getForeshadowCount(chapter.id)}
              totalWordCount={totalWordCount}
              targetWordCount={targetWordCount}
              onDelete={handleDelete}
              onUpdateEmotion={handleUpdateEmotion}
            />
          );
        })}
      </div>

      {/* 无章节提示 */}
      {chapters.length === 0 && currentBook && (
        <div className="text-center py-16 text-secondary">
          <p className="text-4xl mb-4">📖</p>
          <p>还没有章节，请先在写作页创建章节</p>
        </div>
      )}

      {/* 新建情节弹窗 - 贴近按钮位置 */}
      {showCreate && (
        <>
          <div
            className="fixed z-50 bg-white rounded-lg shadow-xl border p-4 w-72 animate-fadeIn"
            style={{
              left: `${createButtonPos.x}px`,
              top: `${createButtonPos.y + 4}px`,
            }}
          >
            <h3 className="text-base font-medium text-body mb-3">添加情节</h3>
            <input
              type="text"
              placeholder="情节标题"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              autoFocus
            />
            <textarea
              placeholder="情节描述（可选）"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
              rows={2}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowCreate(false); setNewTitle(''); setNewDesc(''); }}
                className="px-3 py-1.5 text-sm text-secondary hover:bg-gray-100 rounded"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                添加
              </button>
            </div>
          </div>
          {/* 点击外部关闭 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => { setShowCreate(false); setNewTitle(''); setNewDesc(''); }}
          />
        </>
      )}

      {!currentBook && (
        <div className="text-center py-16 text-secondary">
          <p className="text-4xl mb-4">📚</p>
          <p>请先选择一本书籍</p>
        </div>
      )}
    </div>
  );
}

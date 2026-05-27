// fix: AI 面板
import { useState } from 'react';
import useAiStore from '../../stores/useAiStore';
import useBookStore from '../../stores/useBookStore';

export default function AiPanel() {
  const { toggleAiPanel } = useAiStore();
  const { currentChapter, currentBook } = useBookStore();
  const [activeTab, setActiveTab] = useState('check');

  return (
    <div className="w-80 border-l bg-white flex flex-col">
      {/* 头部 */}
      <div className="h-12 border-b flex items-center justify-between px-4">
        <span className="font-medium">🤖 AI 助手</span>
        <button
          onClick={toggleAiPanel}
          className="text-secondary hover:text-body"
        >
          ✕
        </button>
      </div>

      {/* 标签 */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('check')}
          className={`flex-1 py-2 text-sm transition ${
            activeTab === 'check'
              ? 'text-primary border-b-2 border-primary'
              : 'text-secondary'
          }`}
        >
          检查
        </button>
        <button
          onClick={() => setActiveTab('extract')}
          className={`flex-1 py-2 text-sm transition ${
            activeTab === 'extract'
              ? 'text-primary border-b-2 border-primary'
              : 'text-secondary'
          }`}
        >
          提取
        </button>
      </div>

      {/* 内容 */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'check' && (
          <CheckPanel bookId={currentBook?.id} chapterId={currentChapter?.id} />
        )}
        {activeTab === 'extract' && (
          <ExtractPanel bookId={currentBook?.id} chapterId={currentChapter?.id} />
        )}
      </div>
    </div>
  );
}

// AI 检查面板
function CheckPanel({ bookId, chapterId }) {
  const { isChecking, checkResult, checkText } = useAiStore();

  const handleCheck = async () => {
    if (!chapterId) return;
    try {
      // TODO: 从编辑器获取实际文本内容
      await checkText('待检查的文本', bookId);
    } catch (e) {
      console.error('检查失败:', e);
    }
  };

  return (
    <div>
      <button
        onClick={handleCheck}
        disabled={isChecking || !chapterId}
        className="w-full px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
      >
        {isChecking ? '检查中...' : '开始检查'}
      </button>

      {checkResult && (
        <div className="mt-4 space-y-3">
          {/* 错别字 */}
          {checkResult.typos?.length > 0 && (
            <div className="p-3 bg-error/10 rounded-lg">
              <div className="font-medium text-error mb-2">❌ 错别字</div>
              {checkResult.typos.map((t, i) => (
                <div key={i} className="text-sm py-1">
                  <span className="typo-error">{t.text}</span>
                  {t.suggestion && (
                    <span className="text-success ml-2">→ {t.suggestion}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 世界观冲突 */}
          {checkResult.worldview_conflicts?.length > 0 && (
            <div className="p-3 bg-warning/10 rounded-lg">
              <div className="font-medium text-warning mb-2">🌍 世界观冲突</div>
              {checkResult.worldview_conflicts.map((c, i) => (
                <div key={i} className="text-sm py-1 worldview-conflict">
                  {c.text}
                </div>
              ))}
            </div>
          )}

          {/* 人设冲突 */}
          {checkResult.character_conflicts?.length > 0 && (
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="font-medium text-purple-600 mb-2">👤 人设冲突</div>
              {checkResult.character_conflicts.map((c, i) => (
                <div key={i} className="text-sm py-1 character-conflict">
                  <span className="font-medium">{c.character_name}:</span> {c.text}
                </div>
              ))}
            </div>
          )}

          {(!checkResult.typos?.length && !checkResult.worldview_conflicts?.length && !checkResult.character_conflicts?.length) && (
            <div className="text-center py-4 text-success">
              ✅ 未发现问题
            </div>
          )}
        </div>
      )}

      {!chapterId && (
        <div className="text-center py-8 text-secondary text-sm">
          请先选择要检查的章节
        </div>
      )}
    </div>
  );
}

// AI 提取面板
function ExtractPanel({ bookId, chapterId }) {
  const { isExtracting, extractResult, extractEntities } = useAiStore();

  const handleExtract = async () => {
    if (!chapterId) return;
    try {
      // TODO: 从编辑器获取实际文本内容
      await extractEntities('待提取的文本', bookId);
    } catch (e) {
      console.error('提取失败:', e);
    }
  };

  return (
    <div>
      <button
        onClick={handleExtract}
        disabled={isExtracting || !chapterId}
        className="w-full px-4 py-2 bg-success text-white rounded-lg disabled:opacity-50"
      >
        {isExtracting ? '提取中...' : '提取信息'}
      </button>

      {extractResult && (
        <div className="mt-4 space-y-3">
          {/* 人物 */}
          {extractResult.characters?.length > 0 && (
            <div className="p-3 bg-primary/10 rounded-lg">
              <div className="font-medium text-primary mb-2">👤 人物</div>
              {extractResult.characters.map((c, i) => (
                <div key={i} className="text-sm py-1 flex justify-between items-center">
                  <span>{c.name}</span>
                  <button className="text-xs text-primary hover:underline">
                    添加到人物库
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 大事记 */}
          {extractResult.timeline?.length > 0 && (
            <div className="p-3 bg-secondary/10 rounded-lg">
              <div className="font-medium text-secondary mb-2">📅 大事记</div>
              {extractResult.timeline.map((t, i) => (
                <div key={i} className="text-sm py-1">
                  {t.event}
                  {t.chapter && <span className="text-secondary ml-2">@{t.chapter}</span>}
                </div>
              ))}
            </div>
          )}

          {/* 伏笔 */}
          {extractResult.foreshadows?.length > 0 && (
            <div className="p-3 bg-warning/10 rounded-lg">
              <div className="font-medium text-warning mb-2">📌 伏笔</div>
              {extractResult.foreshadows.map((f, i) => (
                <div key={i} className="text-sm py-1">
                  {f}
                </div>
              ))}
            </div>
          )}

          {/* 世界观 */}
          {extractResult.worldviews?.length > 0 && (
            <div className="p-3 bg-success/10 rounded-lg">
              <div className="font-medium text-success mb-2">🌍 世界观</div>
              {extractResult.worldviews.map((w, i) => (
                <div key={i} className="text-sm py-1">
                  {w}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!chapterId && (
        <div className="text-center py-8 text-secondary text-sm">
          请先选择要提取的章节
        </div>
      )}
    </div>
  );
}

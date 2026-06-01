// AI 面板 - 7个独立按钮
// AI检查3项: ❌错别字、🌍世界观冲突、👤人设冲突
// AI提取4项: 👤提取人物、📋提取大事记、🎯提取伏笔、🌍提取世界观
import { useState } from 'react';
import useAiStore from '../../stores/useAiStore';
import useBookStore from '../../stores/useBookStore';
import useEditorStore from '../../stores/useEditorStore';

export default function AiPanel() {
  const { toggleAiPanel } = useAiStore();
  const { currentChapter, currentBook } = useBookStore();

  return (
    <div className="w-80 border-l bg-white flex flex-col overflow-hidden">
      {/* 头部 */}
      <div className="h-12 border-b flex items-center justify-between px-4 flex-shrink-0">
        <span className="font-medium text-body">🤖 AI 助手</span>
        <button
          onClick={toggleAiPanel}
          className="text-secondary hover:text-body"
        >
          ✕
        </button>
      </div>

      {/* 内容区域 - 可滚动 */}
      <div className="flex-1 overflow-auto p-4">
        <AiCheckSection bookId={currentBook?.id} chapterId={currentChapter?.id} />
        <AiExtractSection bookId={currentBook?.id} chapterId={currentChapter?.id} />
      </div>
    </div>
  );
}

// AI 检查区域
function AiCheckSection({ bookId, chapterId }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-body mb-2">🔍 AI检查</h3>
      <div className="space-y-2">
        <CheckButton
          label="❌ 错别字检查"
          type="typo"
          bookId={bookId}
          chapterId={chapterId}
          colorClass="hover:bg-error/10"
          borderClass="hover:border-error"
        />
        <CheckButton
          label="🌍 世界观冲突"
          type="worldview_conflict"
          bookId={bookId}
          chapterId={chapterId}
          colorClass="hover:bg-warning/10"
          borderClass="hover:border-warning"
        />
        <CheckButton
          label="👤 人设冲突"
          type="character_conflict"
          bookId={bookId}
          chapterId={chapterId}
          colorClass="hover:bg-purple-50"
          borderClass="hover:border-purple-400"
        />
      </div>
    </div>
  );
}

// AI 提取区域
function AiExtractSection({ bookId, chapterId }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-body mb-2">📤 AI提取</h3>
      <div className="space-y-2">
        <ExtractButton
          label="👤 提取人物"
          type="character"
          bookId={bookId}
          chapterId={chapterId}
          colorClass="hover:bg-primary/10"
          borderClass="hover:border-primary"
        />
        <ExtractButton
          label="📋 提取大事记"
          type="timeline"
          bookId={bookId}
          chapterId={chapterId}
          colorClass="hover:bg-secondary/10"
          borderClass="hover:border-secondary"
        />
        <ExtractButton
          label="🎯 提取伏笔"
          type="foreshadow"
          bookId={bookId}
          chapterId={chapterId}
          colorClass="hover:bg-warning/10"
          borderClass="hover:border-warning"
        />
        <ExtractButton
          label="🌍 提取世界观"
          type="worldview"
          bookId={bookId}
          chapterId={chapterId}
          colorClass="hover:bg-success/10"
          borderClass="hover:border-success"
        />
      </div>
    </div>
  );
}

// 单个检查按钮
function CheckButton({ label, type, bookId, chapterId, colorClass, borderClass }) {
  const { checkResults, checkErrors, isChecking, checkText, checkWorldviewConflict, checkCharacterConflict } = useAiStore();
  const { content } = useEditorStore();
  const [expanded, setExpanded] = useState(false);
  const result = checkResults?.[type];
  const error = checkErrors?.[type];
  const isLoading = isChecking;

  const handleClick = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    
    if (!chapterId) {
      alert('请先选择要检查的章节');
      return;
    }

    if (!content || content.trim().length === 0) {
      alert('当前章节内容为空');
      return;
    }

    try {
      if (type === 'typo') {
        await checkText(content, bookId, 'typo');
      } else if (type === 'worldview_conflict') {
        await checkWorldviewConflict(content, bookId);
      } else if (type === 'character_conflict') {
        await checkCharacterConflict(content, bookId);
      }
      setExpanded(true);
    } catch (e) {
      console.error('检查失败:', e);
    }
  };

  const getResultIcon = () => {
    if (isLoading) return '⏳';
    if (error) return '❌';
    if (!result) return null;
    if (result.length === 0) return '✅';
    return '⚠️';
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`w-full px-3 py-2 text-sm text-left rounded-lg border transition ${colorClass} ${borderClass} ${
          isLoading ? 'opacity-50' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <span>{label}</span>
          {getResultIcon() && <span>{getResultIcon()}</span>}
        </div>
      </button>

      {/* 错误信息 */}
      {error && (
        <div className="mt-2 p-3 bg-error/10 text-error rounded-lg text-xs">
          {error}
        </div>
      )}

      {/* 结果展开面板 */}
      {expanded && result && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs max-h-48 overflow-auto">
          {result.length === 0 ? (
            <p className="text-success text-center py-2">✅ 未发现问题</p>
          ) : (
            <div className="space-y-2">
              {result.map((item, idx) => (
                <div key={idx} className={`p-2 rounded ${
                  type === 'typo' ? 'bg-error/10 text-error' :
                  type === 'worldview_conflict' ? 'bg-warning/10 text-warning' :
                  'bg-purple-50 text-purple-700'
                }`}>
                  <div className="font-medium">{item.text || item.description}</div>
                  {item.suggestion && (
                    <div className="text-success mt-1">建议: {item.suggestion}</div>
                  )}
                  {item.character_name && (
                    <div className="text-purple-600">人物: {item.character_name}</div>
                  )}
                  {item.chapter && (
                    <div className="text-gray-500">章节: {item.chapter}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 单个提取按钮
function ExtractButton({ label, type, bookId, chapterId, colorClass, borderClass }) {
  const { extractResults, extractErrors, isExtracting, extractCharacters, extractTimeline, extractForeshadows, extractWorldviews } = useAiStore();
  const { content } = useEditorStore();
  const [expanded, setExpanded] = useState(false);
  const result = extractResults?.[type];
  const error = extractErrors?.[type];
  const isLoading = isExtracting;

  const handleClick = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    
    if (!chapterId) {
      alert('请先选择要提取的章节');
      return;
    }

    if (!content || content.trim().length === 0) {
      alert('当前章节内容为空');
      return;
    }

    try {
      if (type === 'character') {
        await extractCharacters(content, bookId);
      } else if (type === 'timeline') {
        await extractTimeline(content, bookId);
      } else if (type === 'foreshadow') {
        await extractForeshadows(content, bookId);
      } else if (type === 'worldview') {
        await extractWorldviews(content, bookId);
      }
      setExpanded(true);
    } catch (e) {
      console.error('提取失败:', e);
    }
  };

  const getResultCount = () => {
    if (!result) return null;
    if (Array.isArray(result)) return result.length;
    if (typeof result === 'object') return Object.keys(result).length;
    return null;
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`w-full px-3 py-2 text-sm text-left rounded-lg border transition ${colorClass} ${borderClass} ${
          isLoading ? 'opacity-50' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <span>{label}</span>
          {isLoading && <span className="animate-spin">⏳</span>}
          {result && !isLoading && (
            <span className="text-xs text-primary">{getResultCount()}项</span>
          )}
        </div>
      </button>

      {/* 错误信息 */}
      {error && (
        <div className="mt-2 p-3 bg-error/10 text-error rounded-lg text-xs">
          {error}
        </div>
      )}

      {/* 结果展开面板 */}
      {expanded && result && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs max-h-48 overflow-auto">
          {Array.isArray(result) && result.length === 0 ? (
            <p className="text-gray-500 text-center py-2">未提取到相关内容</p>
          ) : (
            <div className="space-y-2">
              {type === 'character' && result.map?.((char, idx) => (
                <div key={idx} className="p-2 bg-white rounded border">
                  <div className="font-medium">{char.name}</div>
                  {char.description && <div className="text-gray-500 mt-1">{char.description}</div>}
                  <button className="text-xs text-primary hover:underline mt-1">
                    添加到人物库 →
                  </button>
                </div>
              ))}
              {type === 'timeline' && result.map?.((event, idx) => (
                <div key={idx} className="p-2 bg-white rounded border">
                  <div className="text-gray-500">{event.chapter}</div>
                  <div>{event.event}</div>
                </div>
              ))}
              {type === 'foreshadow' && result.map?.((item, idx) => (
                <div key={idx} className="p-2 bg-warning/10 rounded">
                  {item}
                </div>
              ))}
              {type === 'worldview' && result.map?.((item, idx) => (
                <div key={idx} className="p-2 bg-success/10 rounded">
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

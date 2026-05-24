// AI面板组件 - 右边栏常驻面板
import { useState, useEffect } from 'react';
import { useAiStore, AI_PANELS } from '../../stores/useAiStore';
import { useEditorStore } from '../../stores/useEditorStore';
import { useBookStore } from '../../stores/useBookStore';
import { useStructureStore } from '../../stores/useStructureStore';

// 情绪颜色（用于世界观冲突橙色）
const COLORS = {
  spelling: 'text-error border-error',    // 错别字：红色
  worldview: 'text-warning border-warning', // 世界观冲突：橙色
  character: 'text-primary border-primary', // 人设冲突：紫色/主色
};

function AIPanel({ editorRef, onExtractForeshadow, onExtractWorldview }) {
  const { activePanel, isProcessing, error } = useAiStore();
  const {
    spellingErrors,
    worldviewConflicts,
    characterConflicts,
    extractedCharacters,
    extractedTimeline,
    extractedForeshadow,
    extractedWorldview,
    setActivePanel,
    clearPanel,
    checkSpelling,
    checkWorldviewConflict,
    checkCharacterConflict,
    acceptSpellingFix,
    rejectSpellingFix,
    dismissConflict,
  } = useAiStore();
  
  const { content } = useEditorStore();
  const { currentBook } = useBookStore();
  const { worldviews } = useStructureStore();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [localTimelineEdit, setLocalTimelineEdit] = useState([]);

  // AI检查工具按钮
  const checkTools = [
    {
      id: AI_PANELS.SPELLING,
      icon: '❌',
      label: '错别字&语法',
      color: 'error',
      count: spellingErrors.length,
    },
    {
      id: AI_PANELS.WORLDVIEW_CHECK,
      icon: '🌍',
      label: '世界观冲突',
      color: 'warning',
      count: worldviewConflicts.length,
    },
    {
      id: AI_PANELS.CHARACTER_CHECK,
      icon: '👤',
      label: '人设冲突',
      color: 'primary',
      count: characterConflicts.length,
    },
  ];

  // AI提取工具按钮
  const extractTools = [
    {
      id: AI_PANELS.EXTRACT_CHARACTER,
      icon: '👤',
      label: '提取人物',
      color: 'primary',
    },
    {
      id: AI_PANELS.EXTRACT_TIMELINE,
      icon: '📋',
      label: '提取大事记',
      color: 'primary',
    },
    {
      id: AI_PANELS.EXTRACT_FORESHADOW,
      icon: '🎯',
      label: '提取伏笔',
      color: 'primary',
    },
    {
      id: AI_PANELS.EXTRACT_WORLDVIEW,
      icon: '🌍',
      label: '提取世界观',
      color: 'primary',
    },
  ];

  // 处理错别字检查
  const handleSpellingCheck = async () => {
    if (activePanel === AI_PANELS.SPELLING) {
      setActivePanel(null);
    } else {
      await checkSpelling(content);
    }
  };

  // 处理世界观冲突检查
  const handleWorldviewCheck = async () => {
    if (activePanel === AI_PANELS.WORLDVIEW_CHECK) {
      setActivePanel(null);
    } else {
      await checkWorldviewConflict(content, worldviews);
    }
  };

  // 处理人设冲突检查
  const handleCharacterCheck = async () => {
    if (activePanel === AI_PANELS.CHARACTER_CHECK) {
      setActivePanel(null);
    } else {
      // TODO: 需要获取人物列表
      const characters = []; // 从character store获取
      await checkCharacterConflict(content, characters);
    }
  };

  // 处理提取人物
  const handleExtractCharacter = async () => {
    if (activePanel === AI_PANELS.EXTRACT_CHARACTER) {
      setActivePanel(null);
    } else {
      setActivePanel(AI_PANELS.EXTRACT_CHARACTER);
      // 从编辑器获取文本
      const text = content;
      const knownCharacters = []; // 从character store获取
      await useAiStore.getState().detectCharacters(text, knownCharacters);
    }
  };

  // 处理提取时间线
  const handleExtractTimeline = async (characterName) => {
    if (!currentBook) return;
    await useAiStore.getState().generateTimeline(characterName, currentBook.id);
    setLocalTimelineEdit(extractedTimeline);
  };

  // 处理提取伏笔
  const handleExtractForeshadow = async () => {
    // 从编辑器获取选中文本
    const selectedText = useEditorStore.getState().selectedText;
    if (!selectedText) {
      alert('请先在编辑器中选中要提取为伏笔的文字');
      return;
    }
    await useAiStore.getState().extractForeshadow(selectedText);
    // 回调给父组件
    if (onExtractForeshadow && extractedForeshadow) {
      onExtractForeshadow(extractedForeshadow);
    }
  };

  // 处理提取世界观
  const handleExtractWorldview = async () => {
    // 从编辑器获取选中文本
    const selectedText = useEditorStore.getState().selectedText;
    if (!selectedText) {
      alert('请先在编辑器中选中要提取为世界观的文字');
      return;
    }
    await useAiStore.getState().extractWorldview(selectedText);
    // 回调给父组件
    if (onExtractWorldview && extractedWorldview) {
      onExtractWorldview(extractedWorldview);
    }
  };

  // 处理提取工具点击
  const handleExtractToolClick = (toolId) => {
    switch (toolId) {
      case AI_PANELS.EXTRACT_CHARACTER:
        handleExtractCharacter();
        break;
      case AI_PANELS.EXTRACT_TIMELINE:
        setActivePanel(AI_PANELS.EXTRACT_TIMELINE);
        break;
      case AI_PANELS.EXTRACT_FORESHADOW:
        handleExtractForeshadow();
        break;
      case AI_PANELS.EXTRACT_WORLDVIEW:
        handleExtractWorldview();
        break;
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-10 bg-gray-50 dark:bg-gray-800 border-l dark:border-gray-700 flex flex-col items-center py-2">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          title="展开AI面板"
        >
          🧠
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-800 border-l dark:border-gray-700 flex flex-col overflow-hidden">
      {/* 头部 */}
      <div className="px-4 py-3 border-b dark:border-gray-700 flex items-center justify-between">
        <span className="font-medium text-gray-800 dark:text-white">🧠 AI工作台</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="收起AI面板"
          >
            →
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto">
        {/* AI检查工具 */}
        <div className="px-4 py-3 border-b dark:border-gray-700">
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
            🔍 AI检查
          </h3>
          <div className="space-y-1">
            {checkTools.map((tool) => (
              <button
                key={tool.id}
                onClick={
                  tool.id === AI_PANELS.SPELLING
                    ? handleSpellingCheck
                    : tool.id === AI_PANELS.WORLDVIEW_CHECK
                    ? handleWorldviewCheck
                    : handleCharacterCheck
                }
                className={`w-full px-3 py-2 text-sm rounded-lg text-left transition-colors ${
                  activePanel === tool.id
                    ? `bg-${tool.color}/10 border border-${tool.color}`
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="mr-2">{tool.icon}</span>
                <span>{tool.label}</span>
                {tool.count > 0 && (
                  <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full bg-${tool.color}/20 text-${tool.color}`}>
                    {tool.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* AI提取工具 */}
        <div className="px-4 py-3">
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
            🧠 AI提取
          </h3>
          <div className="space-y-1">
            {extractTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleExtractToolClick(tool.id)}
                className={`w-full px-3 py-2 text-sm rounded-lg text-left transition-colors ${
                  activePanel === tool.id
                    ? 'bg-primary/10 border border-primary'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="mr-2">{tool.icon}</span>
                <span>{tool.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 结果展示区域 */}
        {isProcessing && (
          <div className="px-4 py-6 text-center">
            <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="mt-2 text-sm text-gray-500">AI处理中...</p>
          </div>
        )}

        {error && (
          <div className="px-4 py-3">
            <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-sm text-error">
              {error}
            </div>
          </div>
        )}

        {/* 错别字结果 */}
        {activePanel === AI_PANELS.SPELLING && !isProcessing && (
          <div className="px-4 py-3">
            <h4 className="text-sm font-medium text-error mb-2">❌ 错别字&语法错误</h4>
            {spellingErrors.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                未发现错别字或语法错误 ✨
              </p>
            ) : (
              <div className="space-y-2">
                {spellingErrors.map((error, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-error/20"
                  >
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      原文: <span className="text-error underline">{error.original}</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      建议: <span className="text-success">{error.suggestion}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptSpellingFix(index)}
                        className="px-2 py-1 text-xs bg-success text-white rounded hover:bg-success/90"
                      >
                        ✓ 接受
                      </button>
                      <button
                        onClick={() => rejectSpellingFix(index)}
                        className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                      >
                        ✗ 忽略
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 世界观冲突结果 */}
        {activePanel === AI_PANELS.WORLDVIEW_CHECK && !isProcessing && (
          <div className="px-4 py-3">
            <h4 className="text-sm font-medium text-warning mb-2">🌍 世界观冲突</h4>
            {worldviewConflicts.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                未发现世界观冲突 ✨
              </p>
            ) : (
              <div className="space-y-2">
                {worldviewConflicts.map((conflict, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-warning/20"
                  >
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      冲突内容: <span className="text-warning">{conflict.text}</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      与「<span className="font-medium">{conflict.worldview}</span>」冲突
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => dismissConflict(AI_PANELS.WORLDVIEW_CHECK, index)}
                        className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                      >
                        忽略
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 人设冲突结果 */}
        {activePanel === AI_PANELS.CHARACTER_CHECK && !isProcessing && (
          <div className="px-4 py-3">
            <h4 className="text-sm font-medium text-primary mb-2">👤 人设冲突</h4>
            {characterConflicts.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                未发现人设冲突 ✨
              </p>
            ) : (
              <div className="space-y-2">
                {characterConflicts.map((conflict, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-primary/20"
                  >
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      冲突内容: <span className="text-primary">{conflict.text}</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      「<span className="font-medium">{conflict.character}</span>」的人设描述
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => dismissConflict(AI_PANELS.CHARACTER_CHECK, index)}
                        className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                      >
                        忽略
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 提取人物结果 */}
        {activePanel === AI_PANELS.EXTRACT_CHARACTER && !isProcessing && (
          <div className="px-4 py-3">
            <h4 className="text-sm font-medium text-primary mb-2">👤 提取人物</h4>
            {extractedCharacters.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                未识别到新人物
              </p>
            ) : (
              <div className="space-y-2">
                {extractedCharacters.map((char, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{char.avatar || '👤'}</span>
                      <span className="font-medium text-gray-800 dark:text-white">
                        {char.name}
                      </span>
                      {char.isNew && (
                        <span className="px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded">
                          新发现
                        </span>
                      )}
                    </div>
                    {char.chapter && (
                      <p className="text-xs text-gray-500 mt-1">
                        首次出现: {char.chapter}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 提取时间线结果 */}
        {activePanel === AI_PANELS.EXTRACT_TIMELINE && !isProcessing && (
          <div className="px-4 py-3">
            <h4 className="text-sm font-medium text-primary mb-2">📋 提取大事记</h4>
            {extractedTimeline.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                暂无大事记，请选择人物后点击提取
              </p>
            ) : (
              <div className="space-y-2">
                {extractedTimeline.map((event, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white dark:bg-gray-700 rounded-lg"
                  >
                    <div className="text-sm font-medium text-gray-800 dark:text-white">
                      {event.character}: {event.event}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {event.chapter || '未知章节'}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    // TODO: 一键加入人物卡片
                    alert('时间线已保存到人物卡片');
                  }}
                  className="w-full mt-2 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  一键加入人物卡片
                </button>
              </div>
            )}
          </div>
        )}

        {/* 提取伏笔结果 */}
        {activePanel === AI_PANELS.EXTRACT_FORESHADOW && !isProcessing && (
          <div className="px-4 py-3">
            <h4 className="text-sm font-medium text-primary mb-2">🎯 提取伏笔</h4>
            {extractedForeshadow ? (
              <div className="space-y-3">
                <div className="p-3 bg-white dark:bg-gray-700 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">原文:</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {extractedForeshadow.original}
                  </div>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">AI概括:</div>
                  <div className="text-sm text-gray-800 dark:text-white">
                    {extractedForeshadow.summary}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // TODO: 挂到伏笔的埋/圆
                      onExtractForeshadow?.(extractedForeshadow);
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    加入伏笔
                  </button>
                  <button
                    onClick={() => useAiStore.getState().clearExtraction(AI_PANELS.EXTRACT_FORESHADOW)}
                    className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                请先在编辑器中选中要提取为伏笔的文字
              </p>
            )}
          </div>
        )}

        {/* 提取世界观结果 */}
        {activePanel === AI_PANELS.EXTRACT_WORLDVIEW && !isProcessing && (
          <div className="px-4 py-3">
            <h4 className="text-sm font-medium text-primary mb-2">🌍 提取世界观</h4>
            {extractedWorldview ? (
              <div className="space-y-3">
                <div className="p-3 bg-white dark:bg-gray-700 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">原文:</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {extractedWorldview.original}
                  </div>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">AI概括:</div>
                  <div className="text-sm text-gray-800 dark:text-white">
                    {extractedWorldview.summary}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // TODO: 加入世界观新条目
                      onExtractWorldview?.(extractedWorldview);
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    加入世界观
                  </button>
                  <button
                    onClick={() => useAiStore.getState().clearExtraction(AI_PANELS.EXTRACT_WORLDVIEW)}
                    className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                请先在编辑器中选中要提取为世界观的文字
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AIPanel;

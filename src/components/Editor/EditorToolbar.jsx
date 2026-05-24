// 编辑器工具栏
function EditorToolbar({ editor, onInsertImage, onCheckSpelling, onAiCharacter, onAiSummarize }) {
  const tools = [
    { icon: 'B', label: '粗体', action: () => editor?.insertAtCursor('**', '**') },
    { icon: 'I', label: '斜体', action: () => editor?.insertAtCursor('*', '*') },
    { icon: 'H', label: '标题', action: () => editor?.insertAtCursor('\n## ', '') },
    { icon: '"', label: '引用', action: () => editor?.insertAtCursor('\n> ', '') },
    { icon: '•', label: '列表', action: () => editor?.insertAtCursor('\n- ', '') },
    { icon: '☐', label: '任务', action: () => editor?.insertAtCursor('\n- [ ] ', '') },
    { icon: '🖼️', label: '图片', action: onInsertImage },
    { icon: '🔗', label: '链接', action: () => editor?.insertAtCursor('[', '](url)') },
  ];

  const aiTools = [
    { icon: '❌', label: 'AI查错字', action: onCheckSpelling },
    { icon: '👤', label: 'AI查人物', action: onAiCharacter },
    { icon: '📝', label: 'AI概括', action: onAiSummarize },
  ];

  return (
    <div className="flex items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
      {/* 格式工具 */}
      <div className="flex items-center gap-1">
        {tools.map((tool, idx) => (
          <button
            key={idx}
            onClick={tool.action}
            className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title={tool.label}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

      {/* AI工具 */}
      <div className="flex items-center gap-1">
        {aiTools.map((tool, idx) => (
          <button
            key={idx}
            onClick={tool.action}
            className="px-2 h-8 flex items-center gap-1 text-sm text-primary hover:bg-primary/10 rounded transition-colors"
            title={tool.label}
          >
            <span>{tool.icon}</span>
            <span className="hidden sm:inline">{tool.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default EditorToolbar;

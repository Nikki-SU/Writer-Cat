// 右键菜单组件
import { useState, useEffect, useRef } from 'react';

function ContextMenu({ editorRef, onSummarize, onExtractForeshadow }) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      
      // 获取选中文本
      const selection = window.getSelection();
      const text = selection?.toString().trim() || '';
      
      if (text) {
        setSelectedText(text);
        setPosition({ x: e.clientX, y: e.clientY });
        setVisible(true);
      }
    };

    const handleClick = () => {
      setVisible(false);
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // 处理菜单项点击
  const handleMenuClick = (action) => {
    setVisible(false);
    
    switch (action) {
      case 'copy':
        navigator.clipboard.writeText(selectedText);
        break;
      case 'cut':
        navigator.clipboard.writeText(selectedText);
        // TODO: 从编辑器删除选中文本
        break;
      case 'ai-summarize':
        if (onSummarize) {
          onSummarize(selectedText);
        }
        break;
      case 'extract-foreshadow':
        if (onExtractForeshadow) {
          onExtractForeshadow(selectedText);
        }
        break;
    }
  };

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-50 min-w-[160px]"
      style={{ left: position.x, top: position.y }}
    >
      <button
        onClick={() => handleMenuClick('copy')}
        className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
      >
        📋 复制
      </button>
      <button
        onClick={() => handleMenuClick('cut')}
        className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
      >
        ✂️ 剪切
      </button>
      <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
      <button
        onClick={() => handleMenuClick('ai-summarize')}
        className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-primary"
      >
        🧠 AI生成概括
      </button>
      <button
        onClick={() => handleMenuClick('extract-foreshadow')}
        className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-primary"
      >
        🎯 设为伏笔（埋/圆）
      </button>
    </div>
  );
}

export default ContextMenu;

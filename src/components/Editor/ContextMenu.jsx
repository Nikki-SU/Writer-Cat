// 右键菜单
import { useState, useEffect, useRef } from 'react';

function ContextMenu({ x, y, onClose, onCopy, onCut, onPaste, onAiSummarize, onAiForeshadowBury, onAiForeshadowReveal }) {
  const menuRef = useRef(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // 点击外部关闭
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // 调整菜单位置确保在视口内
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (rect.right > viewportWidth) {
        menuRef.current.style.left = `${x - rect.width}px`;
      }
      if (rect.bottom > viewportHeight) {
        menuRef.current.style.top = `${y - rect.height}px`;
      }
    }
  }, [x, y]);

  const handleAction = (action) => {
    action();
    setVisible(false);
    onClose();
  };

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 py-1 min-w-[160px] animate-fadeIn"
      style={{ left: x, top: y }}
    >
      <button
        onClick={() => handleAction(onCopy)}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        复制
      </button>
      <button
        onClick={() => handleAction(onCut)}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        剪切
      </button>
      <button
        onClick={() => handleAction(onPaste)}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        粘贴
      </button>
      
      <div className="border-t dark:border-gray-700 my-1" />
      
      <button
        onClick={() => handleAction(onAiSummarize)}
        className="w-full px-4 py-2 text-left text-sm text-primary hover:bg-primary/10"
      >
        📝 AI生成概括
      </button>
      
      <div className="pl-4 space-y-1">
        <button
          onClick={() => handleAction(onAiForeshadowBury)}
          className="w-full px-4 py-2 text-left text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          → 作为伏笔的"埋"
        </button>
        <button
          onClick={() => handleAction(onAiForeshadowReveal)}
          className="w-full px-4 py-2 text-left text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          → 作为伏笔的"圆"
        </button>
      </div>
    </div>
  );
}

export default ContextMenu;

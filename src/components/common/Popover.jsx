// 贴近触发位置的弹窗组件
import { useEffect, useRef } from 'react';

function Popover({ children, position, visible, onClose, width = 'auto' }) {
  const popoverRef = useRef(null);

  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 animate-fadeIn"
      style={{
        left: position.x,
        top: position.y,
        width: width,
      }}
    >
      {children}
    </div>
  );
}

export default Popover;

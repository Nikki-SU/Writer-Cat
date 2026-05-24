// 情绪圆形标记组件（三段色）
import { useState } from 'react';
import ColorPicker from '../common/ColorPicker';

function EmotionCircle({ emotions = [], onChange }) {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ x: 0, y: 0 });

  // 三段色：上段(字数)、中段(预计情绪)、下段(实际情绪)
  const [wordCount达标, setWordCount达标] = useState(true);
  const upperColor = wordCount达标 ? '#22c55e' : '#ef4444'; // 绿/红
  const middleColor = emotions[0] || '#f8fafc';
  const lowerColor = emotions[1] || '#f8fafc';

  const handleClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    setPickerPosition({ x: rect.right + 8, y: rect.top });
    setShowPicker(true);
  };

  const handleSelectColor = (color) => {
    // TODO: 处理颜色选择
    setShowPicker(false);
  };

  return (
    <div className="relative">
      <div
        onClick={handleClick}
        className="w-4 h-8 rounded border border-gray-300 dark:border-gray-600 overflow-hidden cursor-pointer"
        title="点击选择情绪"
      >
        {/* 上段 - 字数达标 */}
        <div
          className="w-full h-1/3"
          style={{ backgroundColor: upperColor }}
        />
        {/* 中段 - 预计情绪 */}
        <div
          className="w-full h-1/3"
          style={{ backgroundColor: middleColor }}
        />
        {/* 下段 - 实际情绪 */}
        <div
          className="w-full h-1/3"
          style={{ backgroundColor: lowerColor }}
        />
      </div>

      {/* 颜色选择器 */}
      {showPicker && (
        <ColorPicker
          position={pickerPosition}
          onSelect={handleSelectColor}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

export default EmotionCircle;

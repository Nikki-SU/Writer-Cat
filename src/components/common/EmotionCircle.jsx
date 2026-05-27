// 情绪圆环组件 - conic-gradient 3段色圆
// 上段=字数达标🟢/未达标🔴
// 中段=预计情绪(5色)
// 下段=实际情绪(5色)
// 点击某段弹出5色选择器（贴近圆旁边）

import { useState, useRef, useEffect } from 'react';

// 情绪5色
const EMOTION_COLORS = {
  1: '#1A237E', // 深蓝-平静
  2: '#64B5F6', // 浅蓝-愉悦
  3: '#FFFFFF', // 白-一般
  4: '#EF9A9A', // 浅红-紧张
  5: '#B71C1C', // 深红-激烈
};

// 情绪标签
const EMOTION_LABELS = {
  1: '平静',
  2: '愉悦',
  3: '一般',
  4: '紧张',
  5: '激烈',
};

export default function EmotionCircle({
  expected = 3,
  actual = 3,
  wordCountMet = false,
  size = 48,
  onExpectedChange,
  onActualChange,
}) {
  const [showPicker, setShowPicker] = useState(null); // 'expected' | 'actual' | null
  const [pickerPos, setPickerPos] = useState({ x: 0, y: 0 });
  const circleRef = useRef(null);
  const pickerRef = useRef(null);

  // 颜色计算
  const topColor = wordCountMet ? '#00A087' : '#E64B35';
  const midColor = EMOTION_COLORS[expected] || '#FFFFFF';
  const botColor = EMOTION_COLORS[actual] || '#FFFFFF';

  // 点击某段打开选择器
  const handleCircleClick = (section, e) => {
    e.stopPropagation();
    const rect = circleRef.current.getBoundingClientRect();
    // 根据点击的段决定弹出位置
    const sectionOffsets = {
      expected: { x: -80, y: -40 }, // 上方
      actual: { x: -80, y: 10 },    // 下方
    };
    const offset = sectionOffsets[section] || { x: -80, y: -20 };
    setPickerPos({
      x: rect.left + rect.width / 2 + offset.x,
      y: rect.top + rect.height / 2 + offset.y,
    });
    setShowPicker(section);
  };

  // 选择颜色
  const handleSelectColor = (emotion) => {
    if (showPicker === 'expected' && onExpectedChange) {
      onExpectedChange(emotion);
    } else if (showPicker === 'actual' && onActualChange) {
      onActualChange(emotion);
    }
    setShowPicker(null);
  };

  // 点击外部关闭选择器
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showPicker && pickerRef.current && !pickerRef.current.contains(e.target) && !circleRef.current?.contains(e.target)) {
        setShowPicker(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showPicker]);

  return (
    <div className="relative inline-flex">
      {/* 圆形3段标记 - conic-gradient */}
      <div
        ref={circleRef}
        className="relative cursor-pointer"
        style={{
          width: size,
          height: size,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 外圈 - 底色 */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(
              ${topColor} 0deg 120deg,
              ${midColor} 120deg 240deg,
              ${botColor} 240deg 360deg
            )`,
          }}
        />
        
        {/* 内圈 - 白色遮罩 */}
        <div
          className="absolute rounded-full"
          style={{
            top: '15%',
            left: '15%',
            width: '70%',
            height: '70%',
            background: '#ffffff',
            border: '2px solid #e5e7eb',
          }}
        />
        
        {/* 可点击区域 - 上段 */}
        <div
          className="absolute cursor-pointer"
          style={{
            top: 0,
            left: '15%',
            width: '70%',
            height: '35%',
            borderRadius: `${size / 2}px ${size / 2}px 0 0`,
          }}
          onClick={(e) => handleCircleClick('expected', e)}
          title={`预计情绪: ${EMOTION_LABELS[expected]}`}
        />
        
        {/* 可点击区域 - 下段 */}
        <div
          className="absolute cursor-pointer"
          style={{
            bottom: 0,
            left: '15%',
            width: '70%',
            height: '35%',
            borderRadius: `0 0 ${size / 2}px ${size / 2}px`,
          }}
          onClick={(e) => handleCircleClick('actual', e)}
          title={`实际情绪: ${EMOTION_LABELS[actual]}`}
        />
      </div>

      {/* 颜色选择器 - 贴近圆旁边 */}
      {showPicker && (
        <div
          ref={pickerRef}
          className="fixed z-50 bg-white rounded-lg shadow-xl border p-2 flex gap-1"
          style={{
            left: `${pickerPos.x}px`,
            top: `${pickerPos.y}px`,
          }}
        >
          {Object.entries(EMOTION_COLORS).map(([value, color]) => (
            <button
              key={value}
              onClick={() => handleSelectColor(parseInt(value))}
              className="w-7 h-7 rounded-full border-2 hover:scale-110 transition-transform"
              style={{
                backgroundColor: color,
                borderColor: parseInt(value) === (showPicker === 'expected' ? expected : actual)
                  ? '#4DBBD5'
                  : '#e5e7eb',
              }}
              title={EMOTION_LABELS[value]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// 导出颜色常量供其他地方使用
export { EMOTION_COLORS, EMOTION_LABELS };

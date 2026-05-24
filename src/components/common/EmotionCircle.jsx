// 情绪圆形组件 - 3段色标记
import { useState, useRef, useEffect } from 'react';
import { EMOTION_COLORS } from '../../utils/constants';

// 情绪颜色映射
const EMOTION_MAP = {
  'deep-blue': { color: '#1e3a5f', name: '负面强' },
  'light-blue': { color: '#93c5fd', name: '负面' },
  'white': { color: '#f8fafc', name: '中性' },
  'light-red': { color: '#fca5a5', name: '正面' },
  'deep-red': { color: '#dc2626', name: '正面强' },
};

function EmotionCircle({ 
  wordCountMet, 
  expectedEmotion = 'white', 
  actualEmotion = 'white',
  wordCountActual = 0,
  wordCountTarget = 3000,
  onEmotionChange,
  size = 'normal' // 'small' | 'normal'
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const pickerRef = useRef(null);

  const sizeConfig = {
    small: { width: 16, height: 8, segmentHeight: 2 },
    normal: { width: 24, height: 12, segmentHeight: 3 },
  };

  const config = sizeConfig[size] || sizeConfig.normal;

  // 点击外部关闭选择器
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  const handleSectionClick = (section, e) => {
    e.stopPropagation();
    setActiveSection(section);
    setShowPicker(true);
  };

  const handleColorSelect = (colorId) => {
    if (onEmotionChange && activeSection) {
      onEmotionChange(activeSection, colorId);
    }
    setShowPicker(false);
    setActiveSection(null);
  };

  const getEmotionColor = (emotionId) => {
    return EMOTION_MAP[emotionId]?.color || EMOTION_MAP.white.color;
  };

  const wordCountColor = wordCountMet ? 'light-red' : 'light-blue';

  return (
    <div className="relative inline-flex flex-col" style={{ width: config.width, gap: '1px' }}>
      {/* 上段：字数达标 */}
      <button
        onClick={(e) => handleSectionClick('wordCount', e)}
        className="rounded-t-full border border-gray-300 hover:opacity-80 transition-opacity"
        style={{ 
          backgroundColor: getEmotionColor(wordCountColor),
          height: config.segmentHeight
        }}
        title={`字数: ${wordCountActual}/${wordCountTarget}`}
      />

      {/* 中段：预计情绪 */}
      <button
        onClick={(e) => handleSectionClick('expected', e)}
        className="border-x border-gray-300 hover:opacity-80 transition-opacity"
        style={{ 
          backgroundColor: getEmotionColor(expectedEmotion),
          height: config.segmentHeight
        }}
        title={`预计情绪: ${EMOTION_MAP[expectedEmotion]?.name || '中性'}`}
      />

      {/* 下段：实际情绪 */}
      <button
        onClick={(e) => handleSectionClick('actual', e)}
        className="rounded-b-full border border-gray-300 hover:opacity-80 transition-opacity"
        style={{ 
          backgroundColor: getEmotionColor(actualEmotion),
          height: config.segmentHeight
        }}
        title={`实际情绪: ${EMOTION_MAP[actualEmotion]?.name || '中性'}`}
      />

      {/* 颜色选择器 */}
      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute left-full top-0 ml-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-2 z-50 flex gap-1"
        >
          {EMOTION_COLORS.map((emotion) => (
            <button
              key={emotion.id}
              onClick={() => handleColorSelect(emotion.id)}
              className="w-6 h-6 rounded-full border border-gray-300 hover:scale-110 transition-transform"
              style={{ backgroundColor: emotion.color }}
              title={emotion.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default EmotionCircle;

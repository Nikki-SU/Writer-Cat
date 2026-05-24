// 编辑器工具栏
import { useState } from 'react';

function EditorToolbar({ fontSize, onFontSizeChange, darkMode, onDarkModeToggle, onInsertImage }) {
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const [showLineHeightPicker, setShowLineHeightPicker] = useState(false);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [colorTemp, setColorTemp] = useState(0); // -1 冷色, 0 正常, 1 暖色

  const fontSizes = [14, 16, 18, 20, 22, 24, 28];
  const lineHeights = [1.4, 1.6, 1.8, 2.0, 2.2];

  // 字体大小选项
  const fontSizeOptions = [
    { label: '小', value: 14 },
    { label: '标准', value: 16 },
    { label: '中', value: 18 },
    { label: '大', value: 20 },
    { label: '特大', value: 24 },
  ];

  // 行高选项
  const lineHeightOptions = [
    { label: '紧凑', value: 1.4 },
    { label: '标准', value: 1.8 },
    { label: '宽松', value: 2.2 },
  ];

  // 背景色温
  const bgColors = {
    light: {
      normal: '#ffffff',
      cool: '#f0f8ff',
      warm: '#fff8f0',
    },
    dark: {
      normal: '#1f2937',
      cool: '#1a2332',
      warm: '#2d2520',
    },
  };

  const currentBg = bgColors[darkMode ? 'dark' : 'light'][colorTemp === 0 ? 'normal' : colorTemp < 0 ? 'cool' : 'warm'];

  return (
    <div className="h-10 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700 flex items-center px-4 gap-2">
      {/* 字体大小 */}
      <div className="relative">
        <button
          onClick={() => setShowFontSizePicker(!showFontSizePicker)}
          className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          🔤 {fontSize}px
        </button>
        {showFontSizePicker && (
          <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-50">
            {fontSizeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onFontSizeChange(opt.value);
                  setShowFontSizePicker(false);
                }}
                className={`w-full px-4 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  fontSize === opt.value
                    ? 'text-primary font-medium'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {opt.label} ({opt.value}px)
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 字体选择 */}
      <select
        className="px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        defaultValue="writing"
      >
        <option value="writing">霞鹜文楷</option>
        <option value="system">系统默认</option>
        <option value="serif">宋体</option>
      </select>

      {/* 颜色 */}
      <button
        className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        title="文字颜色"
      >
        🎨
      </button>

      {/* 行高 */}
      <div className="relative">
        <button
          onClick={() => setShowLineHeightPicker(!showLineHeightPicker)}
          className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          ↕️ {lineHeight}
        </button>
        {showLineHeightPicker && (
          <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-50">
            {lineHeightOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setLineHeight(opt.value);
                  setShowLineHeightPicker(false);
                }}
                className={`w-full px-4 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  lineHeight === opt.value
                    ? 'text-primary font-medium'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {opt.label} ({opt.value})
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* 日夜间切换 */}
      <button
        onClick={onDarkModeToggle}
        className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        title={darkMode ? '切换日间模式' : '切换夜间模式'}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      {/* 背景色温 */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setColorTemp(-1)}
          className={`w-5 h-5 rounded-full bg-blue-100 hover:ring-2 ring-blue-400 ${
            colorTemp === -1 ? 'ring-2 ring-blue-400' : ''
          }`}
          title="冷色调"
        />
        <button
          onClick={() => setColorTemp(0)}
          className={`w-5 h-5 rounded-full bg-white border border-gray-300 hover:ring-2 ring-gray-400 ${
            colorTemp === 0 ? 'ring-2 ring-gray-400' : ''
          }`}
          title="正常色"
        />
        <button
          onClick={() => setColorTemp(1)}
          className={`w-5 h-5 rounded-full bg-orange-100 hover:ring-2 ring-orange-400 ${
            colorTemp === 1 ? 'ring-2 ring-orange-400' : ''
          }`}
          title="暖色调"
        />
      </div>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* 语音输入 */}
      <button
        className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        title="语音输入"
      >
        🎤
      </button>

      {/* 插入图片 */}
      <button
        onClick={onInsertImage}
        className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        title="插入图片"
      >
        📷
      </button>

      <div className="flex-1" />

      {/* 一键复制 */}
      <button
        className="px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded"
        onClick={() => {
          // 复制逻辑由父组件处理
        }}
      >
        📋 复制
      </button>
    </div>
  );
}

export default EditorToolbar;

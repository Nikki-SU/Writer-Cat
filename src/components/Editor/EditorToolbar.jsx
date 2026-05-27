// fix: 编辑器工具栏 - 文字功能栏（规格书要求）
// 字体大小调节 + 字体选择、文字颜色 + 行间距、日间/夜间切换 + 色温、语音输入、插入图片、一键复制
import { useState, useRef, useEffect } from 'react';

function EditorToolbar({
  currentChapter,
  fontSize = 16,
  onFontSizeChange,
  darkMode = false,
  onDarkModeToggle,
  onInsertImage,
  onCopyPlain,
  onCopyMd,
  onAiPanel,
  showCopyMenu,
  setShowCopyMenu,
  copyButtonRef,
}) {
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const [showLineHeightPicker, setShowLineHeightPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [selectedFont, setSelectedFont] = useState('writing');
  const [colorTemp, setColorTemp] = useState(0); // -1 冷色, 0 正常, 1 暖色
  const [isRecording, setIsRecording] = useState(false);
  const copyMenuRef = useRef(null);

  const fontSizes = [14, 16, 18, 20, 22, 24, 28];
  
  const fontFamilies = [
    { value: 'writing', label: '霞鹜文楷' },
    { value: 'system', label: '系统默认' },
    { value: 'serif', label: '宋体' },
    { value: 'mono', label: '等宽字体' },
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

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showCopyMenu && copyMenuRef.current && !copyMenuRef.current.contains(e.target)) {
        setShowCopyMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showCopyMenu, setShowCopyMenu]);

  // 语音输入
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('您的浏览器不支持语音输入');
      return;
    }
    
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      // TODO: 将 transcript 插入到编辑器
      console.log('Voice input:', transcript);
    };
    
    recognition.start();
  };

  // 字体变化
  const handleFontChange = (font) => {
    setSelectedFont(font);
    setShowFontPicker(false);
    // TODO: 将字体变化通知给编辑器
  };

  return (
    <div className="h-10 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700 flex items-center px-3 gap-1">
      {/* 章节标题 */}
      <div className="font-medium text-body text-sm truncate max-w-[200px] flex-shrink-0">
        {currentChapter ? currentChapter.title : '未选择章节'}
      </div>
      
      <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-2" />

      {/* 字体大小 */}
      <div className="relative">
        <button
          onClick={() => setShowFontSizePicker(!showFontSizePicker)}
          className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          title="字体大小"
        >
          🔤 {fontSize}px
        </button>
        {showFontSizePicker && (
          <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-50 min-w-[120px]">
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
      <div className="relative">
        <button
          onClick={() => setShowFontPicker(!showFontPicker)}
          className="px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          title="字体选择"
        >
          字体 ▾
        </button>
        {showFontPicker && (
          <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-50 min-w-[100px]">
            {fontFamilies.map((font) => (
              <button
                key={font.value}
                onClick={() => handleFontChange(font.value)}
                className={`w-full px-4 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  selectedFont === font.value
                    ? 'text-primary font-medium'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
                style={{
                  fontFamily: font.value === 'writing' ? '"霞鹜文楷", serif' :
                    font.value === 'serif' ? 'serif' :
                    font.value === 'mono' ? 'monospace' : 'inherit'
                }}
              >
                {font.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 文字颜色 */}
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
          title="行间距"
        >
          ↕️ {lineHeight}
        </button>
        {showLineHeightPicker && (
          <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-50 min-w-[100px]">
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

      <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-2" />

      {/* 日夜间切换 */}
      <button
        onClick={onDarkModeToggle}
        className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        title={darkMode ? '切换日间模式' : '切换夜间模式'}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      {/* 背景色温 */}
      <div className="flex items-center gap-1" title="背景色温">
        <button
          onClick={() => setColorTemp(-1)}
          className={`w-5 h-5 rounded-full bg-blue-100 hover:ring-2 ring-blue-400 transition ${
            colorTemp === -1 ? 'ring-2 ring-blue-400' : ''
          }`}
          title="冷色调"
        />
        <button
          onClick={() => setColorTemp(0)}
          className={`w-5 h-5 rounded-full bg-white border border-gray-300 hover:ring-2 ring-gray-400 transition ${
            colorTemp === 0 ? 'ring-2 ring-gray-400' : ''
          }`}
          title="正常色"
        />
        <button
          onClick={() => setColorTemp(1)}
          className={`w-5 h-5 rounded-full bg-orange-100 hover:ring-2 ring-orange-400 transition ${
            colorTemp === 1 ? 'ring-2 ring-orange-400' : ''
          }`}
          title="暖色调"
        />
      </div>

      <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-2" />

      {/* 语音输入 */}
      <button
        onClick={handleVoiceInput}
        className={`p-1.5 rounded transition ${
          isRecording
            ? 'text-red-500 bg-red-100 animate-pulse'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        title={isRecording ? '停止录音' : '语音输入'}
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

      {/* AI 按钮 */}
      <button
        onClick={onAiPanel}
        className="px-2 py-1 text-sm text-secondary hover:text-primary hover:bg-primary/10 rounded transition"
        title="AI 助手"
      >
        🤖 AI
      </button>

      {/* 一键复制 */}
      <div className="relative" ref={copyMenuRef}>
        <button
          ref={copyButtonRef}
          onClick={() => setShowCopyMenu(!showCopyMenu)}
          className="px-2 py-1 text-sm text-primary hover:bg-primary/10 rounded transition"
          title="复制内容"
        >
          📋 复制 ▾
        </button>
        
        {showCopyMenu && (
          <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-50 min-w-[140px]">
            <button
              onClick={() => {
                onCopyPlain();
                setShowCopyMenu(false);
              }}
              className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              复制纯文本
            </button>
            <button
              onClick={() => {
                onCopyMd();
                setShowCopyMenu(false);
              }}
              className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              复制 Markdown
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditorToolbar;

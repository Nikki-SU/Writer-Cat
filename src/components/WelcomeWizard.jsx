// 首次启动引导向导
import { useState } from 'react';
import OllamaInstaller from './OllamaInstaller';
import * as ollamaApi from '../api/ollama';
import * as bookApi from '../api/book';

export default function WelcomeWizard({ onComplete }) {
  const [step, setStep] = useState(1); // 1: 欢迎, 2: AI设置, 3: 创建书籍
  const [bookName, setBookName] = useState('');
  const [isCreatingBook, setIsCreatingBook] = useState(false);
  const [bookError, setBookError] = useState(null);

  // 完成引导
  const handleComplete = async () => {
    try {
      await ollamaApi.completeFirstLaunch();
      onComplete?.();
    } catch (e) {
      console.error('完成首次引导失败:', e);
      onComplete?.();
    }
  };

  // 跳过创建书籍
  const handleSkipBook = async () => {
    await handleComplete();
  };

  // 创建书籍
  const handleCreateBook = async () => {
    if (!bookName.trim()) {
      setBookError('请输入书名');
      return;
    }
    
    setIsCreatingBook(true);
    setBookError(null);
    
    try {
      await bookApi.createBook(bookName.trim());
      await handleComplete();
    } catch (e) {
      console.error('创建书籍失败:', e);
      setBookError('创建书籍失败: ' + e.toString());
    } finally {
      setIsCreatingBook(false);
    }
  };

  // AI设置完成后的处理
  const handleAiSetupDone = () => {
    // 不管用户是否安装AI，都进入下一步
    setStep(3);
  };

  // 步骤1: 欢迎页
  const renderWelcome = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="text-7xl mb-6">🐱📖</div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
        网文猫
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
        隐私优先的本地网文写作工具
      </p>
      <p className="text-gray-500 dark:text-gray-400 mb-12">
        你的文字，只属于你
      </p>
      
      <div className="space-y-3 mb-12">
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
          <span className="text-xl">✅</span>
          <span>数据完全本地存储</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
          <span className="text-xl">✅</span>
          <span>AI本地运行，保护隐私</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
          <span className="text-xl">✅</span>
          <span>同步走局域网，安全可控</span>
        </div>
      </div>
      
      <button
        onClick={() => setStep(2)}
        className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
      >
        开始使用
        <span>→</span>
      </button>
    </div>
  );

  // 步骤2: AI引擎设置
  const renderAiSetup = () => (
    <div className="p-8 h-full flex flex-col">
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
          <span>🤖</span>
          <span>AI写作助手</span>
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          AI可以帮你检查错别字、识别人物、提取伏笔、检测设定冲突。
          <br />
          AI引擎是本地运行的大模型，安装后不需要联网也能用。
        </p>
        
        <OllamaInstaller onStatusChange={(status) => {
          // 可以根据状态做一些处理
        }} />
      </div>
      
      <div className="flex justify-between items-center pt-6 border-t dark:border-gray-700">
        <button
          onClick={() => setStep(1)}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          ← 上一步
        </button>
        <button
          onClick={handleAiSetupDone}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          下一步 →
        </button>
      </div>
    </div>
  );

  // 步骤3: 创建第一本书
  const renderCreateBook = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="text-6xl mb-6">📖</div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        创建你的第一本书
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        开始你的创作之旅
      </p>
      
      <div className="w-full max-w-md">
        <input
          type="text"
          value={bookName}
          onChange={(e) => setBookName(e.target.value)}
          placeholder="输入书名"
          className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreateBook();
          }}
        />
        
        {bookError && (
          <p className="mt-3 text-sm text-red-500">{bookError}</p>
        )}
      </div>
      
      <div className="mt-8 space-y-3">
        <button
          onClick={handleCreateBook}
          disabled={isCreatingBook || !bookName.trim()}
          className="w-full max-w-md px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isCreatingBook ? (
            <>
              <span className="animate-spin">⏳</span>
              创建中...
            </>
          ) : (
            <>
              创建并开始写作
              <span>→</span>
            </>
          )}
        </button>
        
        <button
          onClick={handleSkipBook}
          disabled={isCreatingBook}
          className="px-6 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
        >
          跳过，稍后创建
        </button>
      </div>
      
      <button
        onClick={() => setStep(2)}
        className="absolute bottom-8 left-8 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        ← AI设置
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900">
      {/* 进度指示器 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>
      
      {/* 步骤指示器 */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`w-2 h-2 rounded-full transition-colors ${
              s <= step ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>

      {/* 步骤内容 */}
      <div className="h-full">
        {step === 1 && renderWelcome()}
        {step === 2 && renderAiSetup()}
        {step === 3 && renderCreateBook()}
      </div>
    </div>
  );
}

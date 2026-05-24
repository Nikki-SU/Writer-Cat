// AI错别字审阅面板（右边栏）
import { useState } from 'react';

function SpellingReview({ errors, onClose, editorRef }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localErrors, setLocalErrors] = useState(errors);

  const handleAccept = (index) => {
    const error = localErrors[index];
    if (error && editorRef?.current) {
      // 替换错误文本
      editorRef.current.replaceText(error.position, error.original, error.corrected);
    }
    
    setLocalErrors((prev) => prev.filter((_, i) => i !== index));
    if (currentIndex >= localErrors.length - 1) {
      setCurrentIndex(Math.max(0, localErrors.length - 2));
    }
  };

  const handleReject = (index) => {
    setLocalErrors((prev) => prev.filter((_, i) => i !== index));
    if (currentIndex >= localErrors.length - 1) {
      setCurrentIndex(Math.max(0, localErrors.length - 2));
    }
  };

  const handleNext = () => {
    if (currentIndex < localErrors.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleAcceptAll = () => {
    localErrors.forEach((error, idx) => {
      if (editorRef?.current) {
        editorRef.current.replaceText(error.position, error.original, error.corrected);
      }
    });
    setLocalErrors([]);
    setCurrentIndex(0);
  };

  const handleRejectAll = () => {
    setLocalErrors([]);
    setCurrentIndex(0);
  };

  return (
    <div className="w-72 border-l dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col animate-slideInRight">
      {/* 头部 */}
      <div className="px-4 py-3 border-b dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-medium text-gray-800 dark:text-white">
          🔍 错字 ({localErrors.length}处)
        </h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      {/* 错误列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {localErrors.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            没有发现错别字 ✓
          </p>
        ) : (
          localErrors.map((error, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                index === currentIndex
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-red-500 line-through">{error.original}</span>
                <span className="text-gray-400">→</span>
                <span className="text-green-500">{error.corrected}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                第{error.line}段
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAccept(index)}
                  className="flex-1 px-2 py-1 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                >
                  ✓ 接受
                </button>
                <button
                  onClick={() => handleReject(index)}
                  className="flex-1 px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  ✕ 拒绝
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 底部操作 */}
      {localErrors.length > 0 && (
        <div className="p-4 border-t dark:border-gray-700 space-y-2">
          <button
            onClick={handleNext}
            disabled={currentIndex >= localErrors.length - 1}
            className="w-full px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50"
          >
            下一个
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleAcceptAll}
              className="flex-1 px-4 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
            >
              全部接受
            </button>
            <button
              onClick={handleRejectAll}
              className="flex-1 px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              全部拒绝
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpellingReview;

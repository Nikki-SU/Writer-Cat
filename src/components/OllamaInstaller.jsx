// Ollama安装组件 - 可复用
import { useState, useEffect } from 'react';
import * as ollamaApi from '../api/ollama';

const DEFAULT_MODEL = 'qwen2.5:7b';

export default function OllamaInstaller({ onStatusChange, compact = false }) {
  const [status, setStatus] = useState(null); // null=检测中, installed, running, pulling, ready, error
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ downloaded: 0, total: 0, percent: 0, stage: '' });
  const [pullProgress, setPullProgress] = useState({ status: '', completed: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // 加载Ollama状态
  const loadStatus = async () => {
    try {
      const result = await ollamaApi.checkOllamaStatus();
      if (result.running && result.default_model_installed) {
        setStatus('ready');
      } else if (result.running) {
        setStatus('running');
      } else if (result.installed) {
        setStatus('installed');
      } else {
        setStatus(null);
      }
      onStatusChange?.(result);
      setError(null);
    } catch (e) {
      console.error('检测Ollama状态失败:', e);
      setStatus(null);
    }
  };

  // 初始化检测
  useEffect(() => {
    loadStatus();
    
    // 监听安装进度
    const unlistenInstall = ollamaApi.onInstallProgress((data) => {
      setProgress(data);
      if (data.stage === 'downloading') {
        setIsLoading(true);
      }
    });

    // 监听模型拉取进度
    const unlistenPull = ollamaApi.onPullProgress((data) => {
      setPullProgress({
        status: data.status,
        completed: data.completed || 0,
        total: data.total || 0,
      });
      if (data.status.includes('pulling') || data.status.includes('verifying')) {
        setStatus('pulling');
        setIsLoading(true);
      }
    });

    return () => {
      unlistenInstall.then(fn => fn());
      unlistenPull.then(fn => fn());
    };
  }, []);

  // 一键安装
  const handleInstall = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. 下载并安装Ollama
      await ollamaApi.installOllama();
      
      // 2. 启动Ollama
      await ollamaApi.startOllama();
      
      // 等待一下让服务启动
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 3. 重新检测状态
      await loadStatus();
      
      // 4. 如果未运行，先启动
      const currentStatus = await ollamaApi.checkOllamaStatus();
      if (!currentStatus.running) {
        await ollamaApi.startOllama();
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // 5. 拉取默认模型
      setStatus('pulling');
      await ollamaApi.pullDefaultModel();
      
      // 6. 完成
      setStatus('ready');
      await loadStatus();
      
    } catch (e) {
      console.error('安装失败:', e);
      setError(e.toString());
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  // 仅启动服务
  const handleStart = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await ollamaApi.startOllama();
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadStatus();
    } catch (e) {
      setError(e.toString());
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  // 仅拉取模型
  const handlePullModel = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setStatus('pulling');
      await ollamaApi.pullDefaultModel();
      setStatus('ready');
      await loadStatus();
    } catch (e) {
      setError(e.toString());
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  // 跳过AI安装
  const handleSkip = async () => {
    await ollamaApi.skipAiInstall();
    setStatus('skipped');
  };

  // 格式化下载进度
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 精简模式渲染
  if (compact) {
    return (
      <div className="text-sm">
        {status === 'ready' && (
          <span className="text-green-600">✅ AI引擎运行中</span>
        )}
        {status === 'running' && (
          <span className="text-blue-600">⚙️ AI服务已启动，正在检查模型...</span>
        )}
        {status === 'installed' && (
          <button
            onClick={handleStart}
            disabled={isLoading}
            className="text-blue-600 hover:underline disabled:opacity-50"
          >
            {isLoading ? '启动中...' : '🔄 启动AI引擎'}
          </button>
        )}
        {status === 'pulling' && (
          <span className="text-blue-600">📥 正在下载模型...</span>
        )}
        {(status === null || status === 'error') && !isLoading && (
          <button
            onClick={handleInstall}
            className="text-blue-600 hover:underline"
          >
            📦 安装AI引擎
          </button>
        )}
        {isLoading && status !== 'pulling' && (
          <span className="text-gray-500">安装中...</span>
        )}
      </div>
    );
  }

  // 完整模式渲染
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="flex items-start gap-4">
        <div className="text-4xl">🤖</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            AI写作助手
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            AI可以帮你检查错别字、识别人物、提取伏笔、检测设定冲突。
            <br />
            AI引擎是本地运行的大模型，安装后不需要联网也能用。
          </p>

          {/* 状态显示 */}
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700">
              <span className={`w-2 h-2 rounded-full ${
                status === 'ready' ? 'bg-green-500' :
                status === 'running' || status === 'pulling' ? 'bg-blue-500 animate-pulse' :
                status === 'skipped' ? 'bg-gray-400' :
                'bg-yellow-500'
              }`} />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {status === 'ready' && 'AI引擎已就绪 ✅'}
                {status === 'running' && 'AI服务已启动，等待模型...'}
                {status === 'installed' && 'Ollama已安装，请启动服务'}
                {status === 'pulling' && '正在下载模型...'}
                {status === 'skipped' && '已跳过AI安装'}
                {status === null && !isLoading && 'Ollama未安装'}
                {status === 'error' && '安装失败'}
                {isLoading && status !== 'pulling' && '处理中...'}
              </span>
            </div>
          </div>

          {/* 下载进度 */}
          {progress.stage === 'downloading' && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>正在下载 OllamaSetup.exe</span>
                <span>{progress.percent}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatSize(progress.downloaded)} / {formatSize(progress.total)}
              </div>
            </div>
          )}

          {/* 安装进度 */}
          {progress.stage === 'installing' && (
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              ⏳ 正在安装 Ollama...
            </div>
          )}

          {/* 模型拉取进度 */}
          {(status === 'pulling' || pullProgress.status) && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>正在下载模型 {DEFAULT_MODEL}</span>
                <span>{pullProgress.status}</span>
              </div>
              {pullProgress.total > 0 && (
                <>
                  <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${(pullProgress.completed / pullProgress.total * 100).toFixed(1)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatSize(pullProgress.completed)} / {formatSize(pullProgress.total)}
                  </div>
                </>
              )}
            </div>
          )}

          {/* 错误信息 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-3">
            {status === null && !isLoading && (
              <>
                <button
                  onClick={handleInstall}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  📦 一键安装AI引擎
                </button>
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  跳过，以后再装
                </button>
              </>
            )}

            {status === 'installed' && !isLoading && (
              <button
                onClick={handleStart}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                🚀 启动AI引擎
              </button>
            )}

            {status === 'running' && !isLoading && (
              <button
                onClick={handlePullModel}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                📥 下载默认模型
              </button>
            )}

            {status === 'ready' && (
              <div className="flex items-center gap-2 text-green-600">
                <span className="text-xl">✅</span>
                <span>AI引擎已就绪</span>
              </div>
            )}

            {status === 'error' && !isLoading && (
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                🔄 重试
              </button>
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500">
                <span className="animate-spin">⏳</span>
                <span>处理中...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

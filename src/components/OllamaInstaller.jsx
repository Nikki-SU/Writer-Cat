// Ollama 安装引导
import { useState, useEffect } from 'react';
import useSettingsStore from '../stores/useSettingsStore';

export default function OllamaInstaller() {
  const { checkOllama, getInstallGuide } = useSettingsStore();
  const [installGuide, setInstallGuide] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    getInstallGuide().then(setInstallGuide);
  }, []);

  const handleCheckAgain = async () => {
    setIsChecking(true);
    await checkOllama();
    setIsChecking(false);
  };

  return (
    <div className="p-4 bg-primary/5 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🔧</span>
        <h3 className="font-medium">安装 Ollama</h3>
      </div>
      <p className="text-sm text-secondary mb-3">
        Ollama 让你可以在本地运行 AI 模型，无需联网。
      </p>
      <div className="bg-gray-100 rounded p-3 mb-3 text-sm font-mono whitespace-pre-wrap">
        {installGuide || '正在获取安装指引...'}
      </div>
      <button
        onClick={handleCheckAgain}
        disabled={isChecking}
        className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50"
      >
        {isChecking ? '检查中...' : '检查安装状态'}
      </button>
    </div>
  );
}

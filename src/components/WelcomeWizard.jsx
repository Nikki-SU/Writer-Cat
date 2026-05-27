// 欢迎引导页
import { useState } from 'react';
import useSettingsStore from '../stores/useSettingsStore';

export default function WelcomeWizard() {
  const { completeOnboarding, checkOllama } = useSettingsStore();
  const [step, setStep] = useState(0);
  const [ollamaStatus, setOllamaStatus] = useState(null);

  const steps = [
    { title: '欢迎使用网文猫', content: '一个隐私优先的本地网文写作工具，帮助你管理书籍、章节、人物和情节。' },
    { title: '隐私优先', content: '所有数据都保存在本地，不会上传到任何服务器。你的创作属于你自己。' },
    { title: 'AI 辅助', content: '支持本地 AI (Ollama) 辅助写作，检查错别字、世界观冲突和人设问题。' },
  ];

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // 检查 Ollama
      const status = await checkOllama();
      setOllamaStatus(status);
      setStep(step + 1);
    }
  };

  const handleComplete = async () => {
    await completeOnboarding();
    window.location.reload();
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-success/20">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4">
        {/* 进度条 */}
        <div className="flex gap-2 mb-8">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition ${
                i <= step ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* 内容 */}
        <div className="min-h-[200px] flex flex-col items-center justify-center text-center">
          {step < steps.length && (
            <>
              <h1 className="text-2xl font-bold text-body mb-4">{steps[step].title}</h1>
              <p className="text-secondary leading-relaxed">{steps[step].content}</p>
            </>
          )}

          {step === steps.length && (
            <>
              <h1 className="text-2xl font-bold text-body mb-4">设置 AI 助手</h1>
              {ollamaStatus?.running ? (
                <div className="text-center">
                  <p className="text-4xl mb-4">✅</p>
                  <p className="text-success font-medium">Ollama 已就绪！</p>
                  <p className="text-sm text-secondary mt-2">你可以在设置中更换 AI 模型</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-4xl mb-4">🤖</p>
                  <p className="text-body font-medium">暂未安装 Ollama</p>
                  <p className="text-sm text-secondary mt-2">
                    你可以跳过此步骤，之后在设置中安装
                  </p>
                  <a
                    href="https://ollama.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm"
                  >
                    访问 Ollama 官网
                  </a>
                </div>
              )}
            </>
          )}
        </div>

        {/* 按钮 */}
        <div className="flex justify-end gap-3 mt-8">
          {step < steps.length && (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              下一步
            </button>
          )}
          {step === steps.length && (
            <>
              <button
                onClick={handleComplete}
                className="px-6 py-2 text-secondary hover:text-body transition"
              >
                跳过
              </button>
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                开始使用
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

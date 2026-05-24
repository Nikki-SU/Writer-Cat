// 设置页
import { Link } from 'react-router-dom';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useEffect } from 'react';
import {
  DEVICE_ROLES,
  SYNC_MODES,
  AI_PROVIDERS,
  DEFAULT_OLLAMA_MODEL,
} from '../utils/constants';

function Settings() {
  const { settings, loadSettings, updateSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleToggle = (key) => {
    updateSettings({ [key]: !settings[key] });
  };

  const handleSelect = (key, value) => {
    updateSettings({ [key]: value });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            ← 返回
          </Link>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">设置</h1>
        </div>
      </header>

      {/* 设置内容 */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 设备与同步 */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              设备与同步
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                本设备角色
              </label>
              <div className="space-y-2">
                {DEVICE_ROLES.map((role) => (
                  <label
                    key={role.value}
                    className="flex items-start gap-3 p-3 rounded-lg border dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <input
                      type="radio"
                      name="deviceRole"
                      value={role.value}
                      checked={settings.deviceRole === role.value}
                      onChange={() => handleSelect('deviceRole', role.value)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{role.label}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{role.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                同步模式
              </label>
              <select
                value={settings.syncMode}
                onChange={(e) => handleSelect('syncMode', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {SYNC_MODES.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">关闭时清除配对码</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">退出时自动清除所有配对码</p>
              </div>
              <button
                onClick={() => handleToggle('autoClearPairing')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.autoClearPairing ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings.autoClearPairing ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">关闭时清除本设备数据</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">退出时自动清除本地数据</p>
              </div>
              <button
                onClick={() => handleToggle('autoClearData')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.autoClearData ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings.autoClearData ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* AI设置 */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">AI设置</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                AI提供商
              </label>
              <select
                value={settings.aiProvider}
                onChange={(e) => handleSelect('aiProvider', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {AI_PROVIDERS.map((provider) => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label}
                  </option>
                ))}
              </select>
            </div>

            {settings.aiProvider === 'ollama' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ollama地址
                  </label>
                  <input
                    type="text"
                    value={settings.ollamaUrl}
                    onChange={(e) => handleSelect('ollamaUrl', e.target.value)}
                    placeholder="http://localhost:11434"
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    模型名称
                  </label>
                  <input
                    type="text"
                    value={settings.ollamaModel}
                    onChange={(e) => handleSelect('ollamaModel', e.target.value)}
                    placeholder={DEFAULT_OLLAMA_MODEL}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </>
            )}

            {(settings.aiProvider === 'openai' || settings.aiProvider === 'deepseek' || settings.aiProvider === 'custom') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={settings.apiKey}
                    onChange={(e) => handleSelect('apiKey', e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API端点
                  </label>
                  <input
                    type="text"
                    value={settings.apiEndpoint}
                    onChange={(e) => handleSelect('apiEndpoint', e.target.value)}
                    placeholder="https://api.openai.com/v1"
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </>
            )}
          </div>
        </section>

        {/* 通用设置 */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">通用设置</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">夜间模式</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">开启后界面将变为深色</p>
              </div>
              <button
                onClick={() => handleToggle('darkMode')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.darkMode ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings.darkMode ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                编辑器字体大小
              </label>
              <select
                value={settings.fontSize}
                onChange={(e) => handleSelect('fontSize', Number(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value={14}>14px</option>
                <option value={16}>16px</option>
                <option value={18}>18px</option>
                <option value={20}>20px</option>
                <option value={24}>24px</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">U盘模式</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">数据存储在可移动存储设备</p>
              </div>
              <button
                onClick={() => handleToggle('usbMode')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.usbMode ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings.usbMode ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* 关于 */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">关于</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400">
              网文猫 v1.0.0
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              隐私优先的本地网文写作工具
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Settings;

// fix: 设置页
import { useEffect, useState } from 'react';
import useSettingsStore from '../stores/useSettingsStore';
import OllamaInstaller from '../components/OllamaInstaller';

export default function Settings() {
  const { settings, updateSettings, ollamaStatus, checkOllama } = useSettingsStore();
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    checkOllama();
  }, []);

  const handleChange = (key, value) => {
    updateSettings({ ...settings, [key]: value });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-body mb-6">设置</h1>

      {/* 标签页 */}
      <div className="flex gap-4 border-b mb-6">
        {[
          { key: 'general', label: '通用' },
          { key: 'ai', label: 'AI 设置' },
          { key: 'sync', label: '同步' },
          { key: 'data', label: '数据' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 font-medium transition ${
              activeTab === tab.key
                ? 'text-primary border-b-2 border-primary'
                : 'text-secondary hover:text-body'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 通用设置 */}
      {activeTab === 'general' && (
        <div className="space-y-4">
          <SettingItem label="主题">
            <select
              value={settings.theme}
              onChange={(e) => handleChange('theme', e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
          </SettingItem>

          <SettingItem label="字体大小">
            <input
              type="number"
              value={settings.font_size}
              onChange={(e) => handleChange('font_size', parseInt(e.target.value))}
              className="px-3 py-2 border rounded-lg w-20"
              min={12}
              max={24}
            />
            <span className="ml-2 text-secondary">px</span>
          </SettingItem>

          <SettingItem label="自动保存间隔">
            <input
              type="number"
              value={settings.auto_save_interval}
              onChange={(e) => handleChange('auto_save_interval', parseInt(e.target.value))}
              className="px-3 py-2 border rounded-lg w-24"
              min={300}
              max={5000}
              step={100}
            />
            <span className="ml-2 text-secondary">ms</span>
          </SettingItem>

          <SettingItem label="备份保留数量">
            <input
              type="number"
              value={settings.max_backups}
              onChange={(e) => handleChange('max_backups', parseInt(e.target.value))}
              className="px-3 py-2 border rounded-lg w-20"
              min={5}
              max={50}
            />
            <span className="ml-2 text-secondary">个</span>
          </SettingItem>
        </div>
      )}

      {/* AI 设置 */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          <SettingItem label="AI 提供商">
            <select
              value={settings.ai_provider}
              onChange={(e) => handleChange('ai_provider', e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="ollama">Ollama (本地)</option>
              <option value="online">在线 API</option>
              <option value="none">不使用 AI</option>
            </select>
          </SettingItem>

          {settings.ai_provider === 'ollama' && (
            <>
              <SettingItem label="Ollama 状态">
                <span className={ollamaStatus?.running ? 'text-success' : 'text-error'}>
                  {ollamaStatus?.running ? '✅ 运行中' : '❌ 未运行'}
                </span>
              </SettingItem>

              {ollamaStatus?.installed && !ollamaStatus?.running && (
                <div className="p-3 bg-warning/10 rounded-lg text-sm">
                  Ollama 已安装但未运行。请在终端运行 <code>ollama serve</code> 启动。
                </div>
              )}

              {!ollamaStatus?.installed && (
                <OllamaInstaller />
              )}

              <SettingItem label="Ollama 地址">
                <input
                  type="text"
                  value={settings.ollama_url}
                  onChange={(e) => handleChange('ollama_url', e.target.value)}
                  className="px-3 py-2 border rounded-lg flex-1"
                />
              </SettingItem>

              <SettingItem label="模型">
                <select
                  value={settings.ollama_model}
                  onChange={(e) => handleChange('ollama_model', e.target.value)}
                  className="px-3 py-2 border rounded-lg flex-1"
                >
                  {ollamaStatus?.models?.map(m => (
                    <option key={m.name} value={m.name}>{m.name}</option>
                  )) || (
                    <option value="qwen2.5:7b">qwen2.5:7b</option>
                  )}
                </select>
              </SettingItem>
            </>
          )}

          {settings.ai_provider === 'online' && (
            <>
              <SettingItem label="API 地址">
                <input
                  type="text"
                  value={settings.online_api_url}
                  onChange={(e) => handleChange('online_api_url', e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="px-3 py-2 border rounded-lg flex-1"
                />
              </SettingItem>

              <SettingItem label="API Key">
                <input
                  type="password"
                  value={settings.online_api_key}
                  onChange={(e) => handleChange('online_api_key', e.target.value)}
                  className="px-3 py-2 border rounded-lg flex-1"
                />
              </SettingItem>
            </>
          )}
        </div>
      )}

      {/* 同步设置 */}
      {activeTab === 'sync' && (
        <div className="space-y-4">
          <SettingItem label="设备角色">
            <select
              value={settings.device_role}
              onChange={(e) => handleChange('device_role', e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="standalone">独立设备</option>
              <option value="hub">Hub（主设备）</option>
              <option value="leaf">Leaf（从设备）</option>
            </select>
          </SettingItem>

          {settings.device_role !== 'standalone' && (
            <SettingItem label="启用同步">
              <input
                type="checkbox"
                checked={settings.sync_enabled}
                onChange={(e) => handleChange('sync_enabled', e.target.checked)}
                className="w-5 h-5"
              />
            </SettingItem>
          )}

          {settings.device_role === 'standalone' && (
            <div className="p-4 bg-gray-50 rounded-lg text-sm text-secondary">
              当前为独立设备模式，数据存储在本地。如需多设备同步，请选择 Hub 或 Leaf 角色。
            </div>
          )}
        </div>
      )}

      {/* 数据设置 */}
      {activeTab === 'data' && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">导出数据</h3>
            <p className="text-sm text-secondary mb-3">
              将所有书籍数据导出为压缩文件，可用于备份或迁移。
            </p>
            <button
              onClick={() => useSettingsStore.getState().exportData(null)}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
            >
              导出全部数据
            </button>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">导入数据</h3>
            <p className="text-sm text-secondary mb-3">
              从备份文件导入数据。
            </p>
            <label className="px-4 py-2 bg-secondary text-white rounded-lg text-sm cursor-pointer inline-block">
              选择文件
              <input type="file" className="hidden" accept=".zip,.json" />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingItem({ label, children }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-body">{label}</span>
      <div className="flex items-center">{children}</div>
    </div>
  );
}

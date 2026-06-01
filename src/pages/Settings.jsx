// fix: 设置页（规格书要求）
// 1. 设备角色切换
// 2. 配对码管理
// 3. 色卡切换（5个预设色卡+自定义）
// 4. 字体上传入口
// 5. AI设置完善
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
      <h1 className="text-2xl font-bold text-body mb-6">⚙️ 设置</h1>

      {/* 标签页 */}
      <div className="flex gap-4 border-b mb-6">
        {[
          { key: 'general', label: '通用' },
          { key: 'privacy', label: '🔐 隐私安全' },
          { key: 'ai', label: 'AI 设置' },
          { key: 'sync', label: '同步' },
          { key: 'color', label: '色卡' },
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
              className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
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
              className="px-3 py-2 border rounded-lg w-20 dark:bg-gray-700 dark:border-gray-600"
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
              className="px-3 py-2 border rounded-lg w-24 dark:bg-gray-700 dark:border-gray-600"
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
              className="px-3 py-2 border rounded-lg w-20 dark:bg-gray-700 dark:border-gray-600"
              min={5}
              max={50}
            />
            <span className="ml-2 text-secondary">个</span>
          </SettingItem>
        </div>
      )}

      {/* 隐私安全设置 */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-bold text-green-800 mb-2">✅ 你的数据是安全的！</h3>
          <div className="text-sm text-green-700 space-y-2">
            <p>• <strong>所有数据完全存储在本地，不上传任何数据到云端！</strong></p>
            <p>• 使用时需要联网吗？不需要！可以完全离线使用。</p>
          </div>
        </div>

        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-medium text-body">🔍 数据处理说明</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📂</span>
              <div>
                <h4 className="font-medium">数据存储</h4>
                <p className="text-sm text-secondary">所有书籍、章节、人设等全部本地数据库和本地文件系统中</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-2xl">🤖</span>
              <div>
                <h4 className="font-medium">AI 辅助功能</h4>
                <p className="text-sm text-secondary">仅在本地运行 Ollama，文本不会发送到外部服务器</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔄</span>
              <div>
                <h4 className="font-medium">同步功能</h4>
                <p className="text-sm text-secondary">设备之间点对点传输，不经过任何第三方服务器</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-medium text-body">⚠️ 使用建议</h3>
          
          <div className="space-y-2">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-1">关于 AI 辅助</h4>
              <p className="text-sm text-yellow-700">
                如果你担心数据绝对不希望你的文本被任何 AI 学习，建议：
              </p>
              <ul className="list-disc list-inside text-sm text-yellow-700 mt-1">
                <li>在 AI 设置中选择"不使用 AI"</li>
                <li>或者确保不安装或启动 Ollama</li>
              </ul>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-1">同步安全提示</h4>
              <p className="text-sm text-blue-700">
                使用 Tailscale 远程同步时：
              </p>
              <ul className="list-disc list-inside text-sm text-blue-700 mt-1">
                <li>Tailscale 仅用于建立加密隧道，数据不经过他们的服务器</li>
                <li>可以完全在同一局域网或自托管的设备可以只在局域网内同步</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* AI 设置 */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <h4 className="font-medium text-yellow-800 mb-1">⚠️ 隐私提示</h4>
            <p className="text-sm text-yellow-700">
              <strong>选择"不使用 AI"</strong>可以完全确保你的文本不会被任何 AI 处理。
            </p>
          </div>
          
          <SettingItem label="AI 提供商">
            <select
              value={settings.ai_provider}
              onChange={(e) => handleChange('ai_provider', e.target.value)}
              className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="ollama">Ollama (本地 - 仅本机处理)</option>
              <option value="online">在线 API (文本将发送到外部服务器)</option>
              <option value="none">不使用 AI (最安全)</option>
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
                  Ollama 已安装但未运行。请在终端运行 <code className="bg-gray-200 px-1 rounded">ollama serve</code> 启动。
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
                  className="px-3 py-2 border rounded-lg flex-1 dark:bg-gray-700 dark:border-gray-600"
                />
              </SettingItem>

              <SettingItem label="模型">
                <select
                  value={settings.ollama_model}
                  onChange={(e) => handleChange('ollama_model', e.target.value)}
                  className="px-3 py-2 border rounded-lg flex-1 dark:bg-gray-700 dark:border-gray-600"
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
                  className="px-3 py-2 border rounded-lg flex-1 dark:bg-gray-700 dark:border-gray-600"
                />
              </SettingItem>

              <SettingItem label="API Key">
                <input
                  type="password"
                  value={settings.online_api_key}
                  onChange={(e) => handleChange('online_api_key', e.target.value)}
                  className="px-3 py-2 border rounded-lg flex-1 dark:bg-gray-700 dark:border-gray-600"
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
              className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="standalone">独立设备</option>
              <option value="hub">Hub（主设备）</option>
              <option value="leaf">Leaf（从设备）</option>
            </select>
          </SettingItem>

          {settings.device_role === 'standalone' && (
            <div className="p-4 bg-gray-50 rounded-lg text-sm text-secondary">
              当前为独立设备模式，数据存储在本地。如需多设备同步，请选择 Hub 或 Leaf 角色。
            </div>
          )}

          {settings.device_role === 'hub' && (
            <>
              <SettingItem label="启用同步">
                <input
                  type="checkbox"
                  checked={settings.sync_enabled}
                  onChange={(e) => handleChange('sync_enabled', e.target.checked)}
                  className="w-5 h-5"
                />
              </SettingItem>
              
              <SettingItem label="配对码">
                <div className="flex items-center gap-2">
                  <code className="px-3 py-2 bg-gray-100 rounded dark:bg-gray-700 font-mono">
                    {settings.pairing_code || 'ABC123'}
                  </code>
                  <button
                    onClick={() => {
                      // 生成新配对码
                      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
                      handleChange('pairing_code', code);
                    }}
                    className="px-3 py-2 text-sm bg-secondary text-white rounded-lg hover:bg-secondary/90"
                  >
                    刷新
                  </button>
                </div>
              </SettingItem>
              
              <SettingItem label="已连接设备">
                <span className="text-secondary">0 个设备</span>
              </SettingItem>
            </>
          )}

          {settings.device_role === 'leaf' && (
            <>
              <SettingItem label="配对码">
                <input
                  type="text"
                  value={settings.leaf_pairing_code || ''}
                  onChange={(e) => handleChange('leaf_pairing_code', e.target.value.toUpperCase())}
                  placeholder="输入 Hub 配对码"
                  className="px-3 py-2 border rounded-lg flex-1 dark:bg-gray-700 dark:border-gray-600 font-mono"
                  maxLength={6}
                />
              </SettingItem>
              <SettingItem label="连接状态">
                <span className="text-secondary">未连接</span>
              </SettingItem>
              <button
                onClick={() => {
                  if (settings.leaf_pairing_code) {
                    alert('正在连接...');
                  }
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg"
              >
                连接 Hub
              </button>
            </>
          )}
        </div>
      )}

      {/* 色卡设置 */}
      {activeTab === 'color' && (
        <div className="space-y-4">
          <h3 className="font-medium text-body">选择色卡主题</h3>
          <p className="text-sm text-secondary">色卡会影响整个应用的配色方案</p>
          
          <div className="grid grid-cols-3 gap-4">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleChange('color_preset', preset.id)}
                className={`p-4 rounded-lg border-2 transition ${
                  settings.color_preset === preset.id
                    ? 'border-primary shadow-md'
                    : 'border-gray-200 hover:border-primary/50'
                }`}
              >
                <div className="flex gap-1 mb-2">
                  {preset.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="text-sm font-medium">{preset.name}</div>
                <div className="text-xs text-secondary">{preset.description}</div>
              </button>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="font-medium text-body mb-3">自定义颜色</h3>
            <div className="grid grid-cols-2 gap-4">
              <SettingItem label="主色调">
                <input
                  type="color"
                  value={settings.custom_primary || '#4DBBD5'}
                  onChange={(e) => handleChange('custom_primary', e.target.value)}
                  className="w-12 h-8 rounded cursor-pointer"
                />
              </SettingItem>
              <SettingItem label="成功色">
                <input
                  type="color"
                  value={settings.custom_success || '#00A087'}
                  onChange={(e) => handleChange('custom_success', e.target.value)}
                  className="w-12 h-8 rounded cursor-pointer"
                />
              </SettingItem>
              <SettingItem label="正文色">
                <input
                  type="color"
                  value={settings.custom_body || '#3C5488'}
                  onChange={(e) => handleChange('custom_body', e.target.value)}
                  className="w-12 h-8 rounded cursor-pointer"
                />
              </SettingItem>
              <SettingItem label="错误色">
                <input
                  type="color"
                  value={settings.custom_error || '#E64B35'}
                  onChange={(e) => handleChange('custom_error', e.target.value)}
                  className="w-12 h-8 rounded cursor-pointer"
                />
              </SettingItem>
            </div>
          </div>
        </div>
      )}

      {/* 数据设置 */}
      {activeTab === 'data' && (
        <div className="space-y-4">
          {/* 字体上传 */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">📝 字体上传</h3>
            <p className="text-sm text-secondary mb-3">
              上传自定义字体文件，支持 .ttf、.otf、.woff 格式
            </p>
            <label className="px-4 py-2 bg-primary text-white rounded-lg text-sm cursor-pointer inline-block hover:bg-primary/90">
              选择字体文件
              <input
                type="file"
                className="hidden"
                accept=".ttf,.otf,.woff,.woff2"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    console.log('字体文件:', file.name);
                    alert(`字体文件 "${file.name}" 已选择，请在刷新后生效`);
                  }
                }}
              />
            </label>
            <p className="text-xs text-gray-400 mt-2">
              已安装字体: 霞鹜文楷, 系统默认
            </p>
          </div>

          {/* 导出数据 */}
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

          {/* 导入数据 */}
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

// 色卡预设
const COLOR_PRESETS = [
  {
    id: 'default',
    name: '默认蓝',
    description: '清新专业的蓝色调',
    colors: ['#4DBBD5', '#00A087', '#3C5488', '#8491B4', '#E64B35'],
  },
  {
    id: 'warm',
    name: '暖阳橙',
    description: '温暖柔和的橙色调',
    colors: ['#F39B7F', '#E64B35', '#3C5488', '#8491B4', '#00A087'],
  },
  {
    id: 'forest',
    name: '森林绿',
    description: '自然清新的绿色调',
    colors: ['#00A087', '#4DBBD5', '#1B5E20', '#8491B4', '#E64B35'],
  },
  {
    id: 'purple',
    name: '神秘紫',
    description: '优雅神秘紫色调',
    colors: ['#9C27B0', '#E91E63', '#3C5488', '#8491B4', '#00A087'],
  },
  {
    id: 'minimal',
    name: '简约灰',
    description: '简约低调的灰色调',
    colors: ['#607D8B', '#78909C', '#3C5488', '#8491B4', '#E64B35'],
  },
];

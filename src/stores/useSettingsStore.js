// fix: 设置 Store
import { create } from 'zustand';
import { settingsApi } from '../api/settings';
import { aiApi } from '../api/ai';

const useSettingsStore = create((set, get) => ({
  settings: {
    theme: 'light',
    device_role: 'standalone',
    sync_enabled: false,
    ai_provider: 'ollama',
    ollama_url: 'http://localhost:11434',
    ollama_model: 'qwen2.5:7b',
    online_api_key: '',
    online_api_url: '',
    auto_save_interval: 500,
    max_backups: 10,
    font_size: 16,
    first_launch: true,
  },
  ollamaStatus: null,
  loading: false,

  // 加载设置
  loadSettings: async () => {
    try {
      const settings = await settingsApi.getSettings();
      set({ settings });
    } catch (e) {
      console.error('加载设置失败:', e);
    }
  },

  // 更新设置
  updateSettings: async (newSettings) => {
    try {
      await settingsApi.updateSettings(newSettings);
      set({ settings: newSettings });
    } catch (e) {
      console.error('保存设置失败:', e);
      throw e;
    }
  },

  // 更新单个设置项
  updateSetting: async (key, value) => {
    const { settings } = get();
    const newSettings = { ...settings, [key]: value };
    await get().updateSettings(newSettings);
  },

  // 完成首次引导
  completeOnboarding: async () => {
    await get().updateSetting('first_launch', false);
  },

  // 检查 Ollama 状态
  checkOllama: async () => {
    try {
      const status = await aiApi.checkOllamaStatus();
      set({ ollamaStatus: status });
      return status;
    } catch (e) {
      console.error('检查 Ollama 失败:', e);
      return null;
    }
  },

  // 获取 Ollama 安装指引
  getInstallGuide: async () => {
    return aiApi.installOllama();
  },

  // 拉取模型
  pullModel: async (model) => {
    return aiApi.pullModel(model);
  },

  // 导出数据
  exportData: async (bookId) => {
    return settingsApi.exportData(bookId);
  },

  // 导入数据
  importData: async (path) => {
    return settingsApi.importData(path);
  },
}));

export default useSettingsStore;

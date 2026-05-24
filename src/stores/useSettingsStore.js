// 设置状态管理
import { create } from 'zustand';
import * as settingsApi from '../api/settings';

const defaultSettings = {
  // 设备与同步
  deviceRole: 'hub',
  syncMode: 'manual',
  autoClearPairing: false,
  autoClearData: false,
  
  // AI设置
  aiProvider: 'ollama',
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'qwen2.5:7b',
  apiKey: '',
  apiEndpoint: '',
  
  // 通用设置
  darkMode: false,
  fontSize: 16,
  language: 'zh-CN',
  usbMode: false,
  usbPath: '',
};

export const useSettingsStore = create((set, get) => ({
  settings: { ...defaultSettings },
  loading: false,
  error: null,
  
  // 加载设置
  loadSettings: async () => {
    set({ loading: true, error: null });
    try {
      const settings = await settingsApi.getSettings();
      set({ settings: { ...defaultSettings, ...settings }, loading: false });
    } catch (error) {
      console.error('加载设置失败:', error);
      set({ settings: { ...defaultSettings }, loading: false });
    }
  },
  
  // 更新设置
  updateSettings: async (updates) => {
    const { settings } = get();
    const newSettings = { ...settings, ...updates };
    set({ settings: newSettings, loading: true, error: null });
    
    try {
      await settingsApi.updateSettings(newSettings);
      set({ loading: false });
    } catch (error) {
      console.error('保存设置失败:', error);
      set({ error: error.message, loading: false });
    }
  },
  
  // 切换暗色模式
  toggleDarkMode: () => {
    const { settings, updateSettings } = get();
    updateSettings({ darkMode: !settings.darkMode });
  },
  
  // 更新字体大小
  setFontSize: (size) => {
    const { updateSettings } = get();
    updateSettings({ fontSize: size });
  },
  
  // 重置设置
  resetSettings: () => {
    const { updateSettings } = get();
    updateSettings(defaultSettings);
  },
}));

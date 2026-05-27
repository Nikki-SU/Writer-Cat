// fix: 设置 API
import { invoke } from '@tauri-apps/api/core';

export const settingsApi = {
  // 获取设置
  getSettings: () => invoke('get_settings'),
  
  // 更新设置
  updateSettings: (settings) => invoke('update_settings', { settings }),
  
  // 导出数据
  exportData: (bookId) => invoke('export_data', { bookId }),
  
  // 导入数据
  importData: (importPath) => invoke('import_data', { importPath }),
};

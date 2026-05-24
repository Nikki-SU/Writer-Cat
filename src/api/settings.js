// 设置API封装
import { invoke } from '@tauri-apps/api/core';

/**
 * 获取所有设置
 * @returns {Promise<AppSettings>}
 */
export async function getSettings() {
  return await invoke('get_settings');
}

/**
 * 更新所有设置
 * @param {AppSettings} settings - 设置对象
 * @returns {Promise<AppSettings>}
 */
export async function updateSettings(settings) {
  return await invoke('update_settings', { settings });
}

/**
 * 获取单个设置项
 * @param {string} key - 设置键名
 * @returns {Promise<string>}
 */
export async function getSetting(key) {
  return await invoke('get_setting', { key });
}

/**
 * 设置单个设置项
 * @param {string} key - 设置键名
 * @param {string} value - 设置值
 * @returns {Promise<void>}
 */
export async function setSetting(key, value) {
  return await invoke('set_setting', { key, value });
}

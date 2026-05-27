// fix: Ollama API封装
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

/**
 * 检查Ollama安装和运行状态
 * @returns {Promise<OllamaStatus>}
 */
export async function checkOllamaStatus() {
  return await invoke('check_ollama_status');
}

/**
 * 获取Ollama安装指引
 * @returns {Promise<string>}
 */
export async function installOllama() {
  return await invoke('install_ollama');
}

/**
 * 拉取模型
 * @param {string} model - 模型名称
 * @returns {Promise<string>}
 */
export async function pullModel(model) {
  return await invoke('pull_model', { model });
}

/**
 * 获取已安装模型列表
 * @returns {Promise<OllamaModel[]>}
 */
export async function getModels() {
  return await invoke('get_models');
}

/**
 * 监听安装进度事件
 * @param {Function} callback - 回调函数，接收进度对象 { stage, downloaded, total, percent }
 * @returns {Promise<UnlistenFn>}
 */
export function onInstallProgress(callback) {
  return listen('ollama-install-progress', (event) => callback(event.payload));
}

/**
 * 监听模型拉取进度事件
 * @param {Function} callback - 回调函数，接收进度对象 { status, digest, total, completed }
 * @returns {Promise<UnlistenFn>}
 */
export function onPullProgress(callback) {
  return listen('ollama-pull-progress', (event) => callback(event.payload));
}

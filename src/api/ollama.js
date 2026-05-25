// Ollama API封装
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
 * 下载并安装Ollama
 * @returns {Promise<void>}
 */
export async function installOllama() {
  return await invoke('install_ollama');
}

/**
 * 启动Ollama服务
 * @returns {Promise<void>}
 */
export async function startOllama() {
  return await invoke('start_ollama');
}

/**
 * 拉取默认模型
 * @returns {Promise<void>}
 */
export async function pullDefaultModel() {
  return await invoke('pull_default_model');
}

/**
 * 跳过AI安装（无AI模式）
 * @returns {Promise<void>}
 */
export async function skipAiInstall() {
  return await invoke('skip_ai_install');
}

/**
 * 检查是否已跳过AI安装
 * @returns {Promise<boolean>}
 */
export async function isAiSkipped() {
  return await invoke('is_ai_skipped');
}

/**
 * 检查是否是首次启动
 * @returns {Promise<boolean>}
 */
export async function isFirstLaunch() {
  return await invoke('is_first_launch');
}

/**
 * 标记首次启动完成
 * @returns {Promise<void>}
 */
export async function completeFirstLaunch() {
  return await invoke('complete_first_launch');
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

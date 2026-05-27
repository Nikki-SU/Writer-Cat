// AI API
import { invoke } from '@tauri-apps/api/core';

export const aiApi = {
  // 检查文本（错别字、世界观冲突、人设冲突）
  checkText: (text, bookId) => invoke('check_text', { text, bookId }),
  
  // 提取实体（人物、大事记、伏笔、世界观）
  extractEntities: (text, bookId) => invoke('extract_entities', { text, bookId }),
  
  // 生成文本
  generateText: (prompt, context) => invoke('generate_text', { prompt, context }),
  
  // 检查 Ollama 状态
  checkOllamaStatus: () => invoke('check_ollama_status'),
  
  // 安装 Ollama 指引
  installOllama: () => invoke('install_ollama'),
  
  // 拉取模型
  pullModel: (model) => invoke('pull_model', { model }),
  
  // 获取模型列表
  getModels: () => invoke('get_models'),
};

// 常量配置
export const COLORS = {
  primary: '#4DBBD5',
  success: '#00A087',
  body: '#3C5488',
  secondary: '#8491B4',
  error: '#E64B35',
  warning: '#F39B7F',
};

export const EMOTION_COLORS = {
  1: '#1A237E', // 深蓝-平静
  2: '#64B5F6', // 浅蓝-愉悦
  3: '#FFFFFF', // 白-一般
  4: '#EF9A9A', // 浅红-紧张
  5: '#B71C1C', // 深红-激烈
};

export const EMOTION_LABELS = {
  1: '平静',
  2: '愉悦',
  3: '一般',
  4: '紧张',
  5: '激烈',
};

export const THREAD_TYPES = {
  linear: { label: '线性', icon: '🔗' },
  branch: { label: '分支', icon: '🌳' },
  converge: { label: '收束', icon: '🔄' },
};

export const DEFAULT_SETTINGS = {
  theme: 'light',
  device_role: 'standalone',
  sync_enabled: false,
  ai_provider: 'ollama',
  ollama_url: 'http://localhost:11434',
  ollama_model: 'qwen2.5:7b',
  auto_save_interval: 500,
  max_backups: 10,
  font_size: 16,
};

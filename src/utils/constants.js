// 常量定义

// 情绪颜色配置
export const EMOTION_COLORS = [
  { id: 'deep-blue', name: '负面强', color: '#1e3a5f', bgClass: 'bg-[#1e3a5f]' },
  { id: 'light-blue', name: '负面', color: '#93c5fd', bgClass: 'bg-[#93c5fd]' },
  { id: 'white', name: '中性', color: '#f8fafc', bgClass: 'bg-[#f8fafc]' },
  { id: 'light-red', name: '正面', color: '#fca5a5', bgClass: 'bg-[#fca5a5]' },
  { id: 'deep-red', name: '正面强', color: '#dc2626', bgClass: 'bg-[#dc2626]' },
];

// 性别选项
export const GENDER_OPTIONS = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'other', label: '其他' },
];

// 关系类型预设
export const RELATION_TYPES = [
  '父母', '子女', '兄弟姐妹', '夫妻', '恋人', '情人', '朋友',
  '挚友', '知己', '师徒', '同门', '同学', '同事', '上下级',
  '合作伙伴', '竞争对手', '敌人', '恩人', '仇人', '陌生人',
];

// 设备角色
export const DEVICE_ROLES = [
  { value: 'hub', label: 'Hub（主设备）', description: '数据主副本所在设备' },
  { value: 'leaf', label: 'Leaf（从设备）', description: '从Hub同步数据的设备' },
];

// 同步模式
export const SYNC_MODES = [
  { value: 'manual', label: '手动同步', description: '手动触发同步操作' },
  { value: 'auto_30s', label: '30秒自动同步', description: '每30秒自动同步一次' },
];

// AI提供商
export const AI_PROVIDERS = [
  { value: 'ollama', label: 'Ollama（本地）', description: '本地运行的AI模型' },
  { value: 'openai', label: 'OpenAI', description: 'GPT系列模型' },
  { value: 'deepseek', label: 'DeepSeek', description: 'DeepSeek系列模型' },
  { value: 'custom', label: '自定义API', description: '使用自定义API端点' },
];

// 默认Ollama模型
export const DEFAULT_OLLAMA_MODEL = 'qwen2.5:7b';

// 编辑器默认配置
export const EDITOR_DEFAULTS = {
  fontSize: 16,
  lineHeight: 1.8,
  maxWordCount: 100000, // 单章最大字数
};

// 自动保存配置
export const AUTO_SAVE_DELAY = 500; // ms

// 配对码配置
export const PAIRING_CODE = {
  length: 6,
  validitySeconds: 120,
};

// 配对码权限
export const PAIRING_PERMISSIONS = [
  { value: 'readwrite', label: '读写', description: '完整读写权限' },
  { value: 'annotate', label: '批注', description: '只能添加批注' },
  { value: 'readonly', label: '只读', description: '只能查看' },
];

// 配对码有效期
export const PAIRING_EXPIRY = [
  { value: 3, label: '3天' },
  { value: 7, label: '1周' },
  { value: 14, label: '半个月' },
  { value: 30, label: '1个月' },
  { value: 180, label: '半年' },
  { value: 0, label: '永不过期' },
];

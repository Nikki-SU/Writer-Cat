// 工具函数

/**
 * 生成UUID
 */
export function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 格式化日期时间
 */
export function formatDateTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 格式化日期
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * 格式化时间
 */
export function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 计算字数（去除空白字符）
 */
export function countWords(text) {
  if (!text) return 0;
  return text.replace(/\s/g, '').length;
}

/**
 * 计算中文字符数
 */
export function countChineseChars(text) {
  if (!text) return 0;
  return (text.match(/[\u4e00-\u9fa5]/g) || []).length;
}

/**
 * 计算章节号（从1开始）
 */
export function getChapterNumber(index) {
  return index + 1;
}

/**
 * 格式化章节标题
 */
export function formatChapterTitle(index, title = '') {
  const num = getChapterNumber(index);
  if (title) {
    return `第${num}章 ${title}`;
  }
  return `第${num}章`;
}

/**
 * 防抖函数
 */
export function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * 节流函数
 */
export function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 深拷贝
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map((item) => deepClone(item));
  if (obj instanceof Object) {
    const copy = {};
    Object.keys(obj).forEach((key) => {
      copy[key] = deepClone(obj[key]);
    });
    return copy;
  }
  return obj;
}

/**
 * 生成配对码
 */
export function generatePairingCode(length = 6) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}

/**
 * 检查是否为移动设备
 */
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * 获取字数的友好显示
 */
export function formatWordCount(count) {
  if (count < 10000) {
    return count.toLocaleString();
  }
  return (count / 10000).toFixed(1) + '万';
}

/**
 * 检查字数是否达标
 */
export function isWordCountMet(current, target) {
  return current >= target;
}

/**
 * 截断文本
 */
export function truncate(text, maxLength, suffix = '...') {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * 从文本中提取人物名称列表
 */
export function extractCharacterNames(text, knownNames = []) {
  const results = [];
  knownNames.forEach((name) => {
    if (text.includes(name) && !results.includes(name)) {
      results.push(name);
    }
  });
  return results;
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('复制失败:', err);
    return false;
  }
}

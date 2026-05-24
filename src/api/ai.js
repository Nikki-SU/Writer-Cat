// AI API封装
import { invoke } from '@tauri-apps/api/core';

/**
 * 错别字检查
 * @param {string} text - 待检查文本
 * @returns {Promise<SpellingError[]>}
 */
export async function checkSpelling(text) {
  return await invoke('check_spelling', { text });
}

/**
 * 人物识别
 * @param {string} text - 文本内容
 * @param {string[]} knownCharacters - 已有人物列表
 * @returns {Promise<CharacterMatch[]>}
 */
export async function detectCharacters(text, knownCharacters) {
  return await invoke('detect_characters', { text, knownCharacters });
}

/**
 * 文本概括
 * @param {string} text - 待概括文本
 * @param {number} maxLength - 最大长度（可选）
 * @returns {Promise<string>}
 */
export async function summarizeText(text, maxLength = 50) {
  return await invoke('summarize_text', { text, maxLength });
}

/**
 * 生成人物时间线
 * @param {string} characterName - 人物名称
 * @param {string} bookId - 书籍ID
 * @param {boolean} allChapters - 是否扫描所有章节
 * @param {string} currentChapterId - 当前章节ID（可选）
 * @returns {Promise<TimelineEvent[]>}
 */
export async function generateTimeline(characterName, bookId, allChapters = true, currentChapterId = null) {
  return await invoke('generate_timeline', {
    characterName,
    bookId,
    allChapters,
    currentChapterId,
  });
}

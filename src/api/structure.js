// 结构API封装（伏笔+世界观）
import { invoke } from '@tauri-apps/api/core';

// 伏笔管理
export async function createForeshadow(data) {
  return await invoke('create_foreshadow', {
    bookId: data.bookId,
    name: data.name,
    buryChapterId: data.buryChapterId || null,
    buryChapterTitle: data.buryChapterTitle || null,
    buryContent: data.buryContent || null,
  });
}

export async function getForeshadows(bookId) {
  return await invoke('get_foreshadows', { bookId });
}

export async function updateForeshadow(id, updates) {
  return await invoke('update_foreshadow', {
    id,
    name: updates.name || null,
    revealChapterId: updates.revealChapterId || null,
    revealChapterTitle: updates.revealChapterTitle || null,
    revealContent: updates.revealContent || null,
    completed: updates.completed !== undefined ? updates.completed : null,
  });
}

export async function deleteForeshadow(id) {
  return await invoke('delete_foreshadow', { id });
}

// 世界观管理
export async function createWorldview(data) {
  return await invoke('create_worldview', {
    bookId: data.bookId,
    name: data.name,
    description: data.description || null,
  });
}

export async function getWorldviews(bookId) {
  return await invoke('get_worldviews', { bookId });
}

export async function getWorldview(id) {
  return await invoke('get_worldview', { id });
}

export async function updateWorldview(id, updates) {
  return await invoke('update_worldview', {
    id,
    name: updates.name || null,
    description: updates.description || null,
  });
}

export async function deleteWorldview(id) {
  return await invoke('delete_worldview', { id });
}

// 世界观-章节关联
export async function attachWorldviewToChapter(worldviewId, chapterId) {
  return await invoke('attach_worldview_to_chapter', { worldviewId, chapterId });
}

export async function detachWorldviewFromChapter(worldviewId, chapterId) {
  return await invoke('detach_worldview_from_chapter', { worldviewId, chapterId });
}

export async function getWorldviewChapters(worldviewId) {
  return await invoke('get_worldview_chapters', { worldviewId });
}

export async function getChapterWorldviews(chapterId) {
  return await invoke('get_chapter_worldviews', { chapterId });
}

// 情节 API
import { invoke } from '@tauri-apps/api/core';

export const plotApi = {
  // 获取情节列表
  getPlots: (bookId) => invoke('get_plots', { bookId }),
  
  // 创建情节
  createPlot: (data) => invoke('create_plot', { data }),
  
  // 更新情节
  updatePlot: (id, data) => invoke('update_plot', { id, data }),
  
  // 删除情节
  deletePlot: (id) => invoke('delete_plot', { id }),
  
  // 更新情绪
  updateEmotion: (plotId, position, data) => invoke('update_emotion', { plotId, position, data }),
  
  // 获取情绪列表
  getEmotions: (plotId) => invoke('get_emotions', { plotId }),
};

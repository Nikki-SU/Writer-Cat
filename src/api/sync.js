// 同步 API
import { invoke } from '@tauri-apps/api/core';

export const syncApi = {
  // 启动同步服务器
  startSyncServer: (deviceName) => invoke('start_sync_server', { deviceName }),
  
  // 停止同步服务器
  stopSyncServer: () => invoke('stop_sync_server'),
  
  // 获取同步状态
  getSyncStatus: () => invoke('get_sync_status'),
  
  // 发现局域网设备
  discoverDevices: () => invoke('discover_devices'),
  
  // 向设备请求同步
  requestSyncFromDevice: (deviceId, bookId) => 
    invoke('request_sync_from_device', { deviceId, bookId }),
};

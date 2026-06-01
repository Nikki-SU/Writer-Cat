// 远程同步 API
import { invoke } from '@tauri-apps/api/core';

export const remoteSyncApi = {
  // 启动远程同步服务器
  startRemoteSyncServer: (deviceName, mode) => 
    invoke('start_remote_sync_server', { deviceName, mode }),
  
  // 停止远程同步服务器
  stopRemoteSyncServer: () => invoke('stop_remote_sync_server'),
  
  // 获取远程同步状态
  getRemoteSyncStatus: () => invoke('get_remote_sync_status'),
  
  // 检查 Tailscale 状态
  checkTailscaleStatus: () => invoke('check_tailscale_status'),
  
  // 连接到对等设备
  connectToPeer: (targetAddress, targetPort, bookId) => 
    invoke('connect_to_peer', { targetAddress, targetPort, bookId }),
  
  // 注册对等设备
  registerPeer: (deviceName, deviceId, tailnetAddress) => 
    invoke('register_peer', { deviceName, deviceId, tailnetAddress }),
};

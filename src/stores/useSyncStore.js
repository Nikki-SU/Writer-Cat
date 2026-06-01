// 同步 Store
import { create } from 'zustand';
import { syncApi } from '../api/sync';

const useSyncStore = create((set, get) => ({
  syncStatus: null,
  devices: [],
  isDiscovering: false,
  isSyncing: false,
  error: null,
  syncPanelOpen: false,

  // 切换同步面板
  toggleSyncPanel: () => set((state) => ({ syncPanelOpen: !state.syncPanelOpen })),

  // 启动同步服务器
  startServer: async (deviceName) => {
    try {
      const status = await syncApi.startSyncServer(deviceName);
      set({ syncStatus: status, error: null });
      return status;
    } catch (e) {
      set({ error: e.toString() });
      throw e;
    }
  },

  // 停止同步服务器
  stopServer: async () => {
    try {
      await syncApi.stopSyncServer();
      set({ syncStatus: null });
    } catch (e) {
      set({ error: e.toString() });
      throw e;
    }
  },

  // 获取同步状态
  refreshStatus: async () => {
    try {
      const status = await syncApi.getSyncStatus();
      set({ syncStatus: status });
      return status;
    } catch (e) {
      set({ error: e.toString() });
      throw e;
    }
  },

  // 发现设备
  discoverDevices: async () => {
    try {
      set({ isDiscovering: true });
      const devices = await syncApi.discoverDevices();
      set({ devices, isDiscovering: false, error: null });
      return devices;
    } catch (e) {
      set({ isDiscovering: false, error: e.toString() });
      throw e;
    }
  },

  // 向设备请求同步
  requestSync: async (deviceId, bookId) => {
    try {
      set({ isSyncing: true });
      await syncApi.requestSyncFromDevice(deviceId, bookId);
      set({ isSyncing: false });
    } catch (e) {
      set({ isSyncing: false, error: e.toString() });
      throw e;
    }
  },
}));

export default useSyncStore;

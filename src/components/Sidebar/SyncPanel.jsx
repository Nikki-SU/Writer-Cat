// 同步控制面板
import { useState, useEffect } from 'react';
import useSyncStore from '../../stores/useSyncStore';
import useBookStore from '../../stores/useBookStore';

export default function SyncPanel() {
  const { syncStatus, devices, isDiscovering, isSyncing, error, 
          startServer, stopServer, refreshStatus, discoverDevices, requestSync } = useSyncStore();
  const { currentBook } = useBookStore();
  const [deviceName, setDeviceName] = useState('我的设备');
  const [showDeviceForm, setShowDeviceForm] = useState(!syncStatus);

  useEffect(() => {
    if (syncStatus?.is_server_running) {
      refreshStatus();
    }
  }, []);

  const handleStartServer = async () => {
    try {
      await startServer(deviceName);
      setShowDeviceForm(false);
    } catch (e) {
      console.error('启动失败:', e);
    }
  };

  const handleStopServer = async () => {
    try {
      await stopServer();
      setShowDeviceForm(true);
    } catch (e) {
      console.error('停止失败:', e);
    }
  };

  const handleDiscover = async () => {
    try {
      await discoverDevices();
    } catch (e) {
      console.error('发现失败:', e);
    }
  };

  return (
    <div className="w-80 border-l bg-white flex flex-col overflow-hidden">
      {/* 头部 */}
      <div className="h-12 border-b flex items-center justify-between px-4 flex-shrink-0">
        <span className="font-medium text-body">🔗 设备同步</span>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* 服务器状态 */}
        {syncStatus?.is_server_running ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-700 font-medium">服务器运行中</span>
              <span className="text-green-600 text-sm">端口: {syncStatus.server_port}</span>
            </div>
            <div className="text-sm text-green-600 mb-3">
              设备名: {deviceName}
            </div>
            <button
              onClick={handleStopServer}
              className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
            >
              停止服务器
            </button>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <span className="text-gray-600 font-medium">服务器未启动</span>
          </div>
        )}

        {/* 启动表单 */}
        {showDeviceForm && (
          <div className="space-y-3">
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="输入设备名称"
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
            <button
              onClick={handleStartServer}
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition"
            >
              启动同步服务
            </button>
          </div>
        )}

        {/* 设备发现 */}
        {syncStatus?.is_server_running && (
          <div className="space-y-3">
            <button
              onClick={handleDiscover}
              disabled={isDiscovering}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
            >
              {isDiscovering ? '发现中...' : '发现局域网设备'}
            </button>

            {/* 设备列表 */}
            {devices.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">发现的设备:</h4>
                {devices.map((device) => (
                  <div key={device.device_id} className="bg-white border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{device.device_name}</div>
                        <div className="text-xs text-gray-500">{device.ip_address}:{device.port}</div>
                      </div>
                      {currentBook && (
                        <button
                          onClick={() => requestSync(device.device_id, currentBook.id)}
                          disabled={isSyncing}
                          className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary/90 disabled:opacity-50"
                        >
                          {isSyncing ? '同步中...' : '同步书籍'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 连接设备 */}
            {syncStatus.connected_devices.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">已连接设备:</h4>
                {syncStatus.connected_devices.map((device) => (
                  <div key={device.device_id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="font-medium text-green-700">{device.device_name}</div>
                    <div className="text-xs text-green-600">{device.ip_address}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

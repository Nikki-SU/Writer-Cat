// 同步控制面板 - 支持本地局域网和远程同步
import { useState, useEffect } from 'react';
import useSyncStore from '../../stores/useSyncStore';
import useBookStore from '../../stores/useBookStore';
import { remoteSyncApi } from '../../api/remote_sync';

export default function SyncPanel() {
  const { currentBook } = useBookStore();
  const { syncStatus, devices, isDiscovering, isSyncing, error, 
          startServer, stopServer, discoverDevices, requestSync } = useSyncStore();
  
  const [syncMode, setSyncMode] = useState('lan');
  const [deviceName, setDeviceName] = useState('我的设备');
  const [remoteStatus, setRemoteStatus] = useState(null);
  const [tailscaleIp, setTailscaleIp] = useState(null);
  const [peerAddress, setPeerAddress] = useState('');
  const [peerPort, setPeerPort] = useState('8090');
  const [isConnecting, setIsConnecting] = useState(false);
  const [remoteError, setRemoteError] = useState(null);

  useEffect(() => {
    checkTailscaleStatus();
  }, []);

  const checkTailscaleStatus = async () => {
    try {
      const ip = await remoteSyncApi.checkTailscaleStatus();
      setTailscaleIp(ip);
    } catch (e) {
      setTailscaleIp(null);
    }
  };

  const handleStartRemoteServer = async () => {
    try {
      setRemoteError(null);
      const mode = syncMode === 'tailscale' ? 'Remote' : 'Lan';
      const status = await remoteSyncApi.startRemoteSyncServer(deviceName, mode);
      setRemoteStatus(status);
    } catch (e) {
      setRemoteError(e.toString());
    }
  };

  const handleStopRemoteServer = async () => {
    try {
      await remoteSyncApi.stopRemoteSyncServer();
      setRemoteStatus(null);
    } catch (e) {
      setRemoteError(e.toString());
    }
  };

  const handleConnectToPeer = async () => {
    if (!peerAddress || !currentBook) return;
    
    try {
      setIsConnecting(true);
      setRemoteError(null);
      await remoteSyncApi.connectToPeer(peerAddress, parseInt(peerPort), currentBook.id);
      alert('同步成功！');
    } catch (e) {
      setRemoteError('同步失败: ' + e.toString());
    } finally {
      setIsConnecting(false);
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
        {(error || remoteError) && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
            {error || remoteError}
          </div>
        )}

        {/* 设备名称 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">设备名称</label>
          <input
            type="text"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="输入设备名称"
          />
        </div>

        {/* 同步模式选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">同步模式</label>
          <div className="space-y-2">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="syncMode"
                value="lan"
                checked={syncMode === 'lan'}
                onChange={(e) => setSyncMode(e.target.value)}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-sm">📶 局域网同步</div>
                <div className="text-xs text-gray-500">在同一 WiFi 网络下使用</div>
              </div>
            </label>
            
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="syncMode"
                value="tailscale"
                checked={syncMode === 'tailscale'}
                onChange={(e) => setSyncMode(e.target.value)}
                className="mr-3"
                disabled={!tailscaleIp}
              />
              <div className="flex-1">
                <div className="font-medium text-sm">
                  🌐 Tailscale 远程同步
                  {!tailscaleIp && <span className="text-orange-500 ml-2">(未安装)</span>}
                </div>
                <div className="text-xs text-gray-500">
                  {tailscaleIp ? `Tailscale IP: ${tailscaleIp}` : '需要安装 Tailscale 应用'}
                </div>
              </div>
            </label>

            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="syncMode"
                value="manual"
                checked={syncMode === 'manual'}
                onChange={(e) => setSyncMode(e.target.value)}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-sm">🔌 手动 IP 连接</div>
                <div className="text-xs text-gray-500">输入对方 IP 地址直接连接</div>
              </div>
            </label>
          </div>
        </div>

        {/* 服务器状态 */}
        {remoteStatus ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-700 font-medium">服务器运行中</span>
              <button
                onClick={handleStopRemoteServer}
                className="text-sm text-red-600 hover:underline"
              >
                停止
              </button>
            </div>
            <div className="text-sm space-y-1">
              <div className="text-gray-600">
                模式: {remoteStatus.mode === 'Remote' ? '🌐 远程模式' : '📶 局域网模式'}
              </div>
              <div className="text-gray-600">
                端口: {remoteStatus.server_port}
              </div>
              {remoteStatus.tailnet_ip && (
                <div className="text-blue-600 font-mono">
                  Tailscale: {remoteStatus.tailnet_ip}
                </div>
              )}
              <div className="text-gray-500 text-xs mt-2">
                分享此地址给其他设备进行同步
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={handleStartRemoteServer}
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition"
          >
            启动同步服务器
          </button>
        )}

        {/* 手动连接 */}
        {syncMode === 'manual' && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">手动连接</h4>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">目标 IP 地址</label>
                <input
                  type="text"
                  value={peerAddress}
                  onChange={(e) => setPeerAddress(e.target.value)}
                  placeholder="例如: 192.168.1.100"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">端口</label>
                <input
                  type="number"
                  value={peerPort}
                  onChange={(e) => setPeerPort(e.target.value)}
                  placeholder="8090"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <button
                onClick={handleConnectToPeer}
                disabled={isConnecting || !peerAddress || !currentBook}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
              >
                {isConnecting ? '连接中...' : '同步书籍'}
              </button>
              {!currentBook && (
                <div className="text-xs text-orange-600">
                  请先选择要同步的书籍
                </div>
              )}
            </div>
          </div>
        )}

        {/* 局域网发现 */}
        {syncMode === 'lan' && remoteStatus && (
          <div className="border-t pt-4">
            <button
              onClick={discoverDevices}
              disabled={isDiscovering}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
            >
              {isDiscovering ? '发现中...' : '发现局域网设备'}
            </button>

            {devices.length > 0 && (
              <div className="mt-3 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">发现的设备:</h4>
                {devices.map((device) => (
                  <div key={device.device_id} className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium text-sm">{device.device_name}</div>
                    <div className="text-xs text-gray-500">{device.ip_address}:{device.port}</div>
                    {currentBook && (
                      <button
                        onClick={() => requestSync(device.device_id, currentBook.id)}
                        disabled={isSyncing}
                        className="mt-2 w-full px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary/90 disabled:opacity-50"
                      >
                        同步
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tailscale 状态 */}
        {syncMode === 'tailscale' && tailscaleIp && (
          <div className="border-t pt-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Tailscale 已连接</h4>
              <div className="text-xs text-blue-600 space-y-1">
                <div>你的 Tailscale 地址: <span className="font-mono font-bold">{tailscaleIp}</span></div>
                <div className="mt-2">在另一台设备上安装 Tailscale 并登录同一账号，然后输入对方的 Tailscale 地址进行连接</div>
              </div>
            </div>
          </div>
        )}

        {/* 帮助信息 */}
        <div className="border-t pt-4">
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
              💡 如何设置远程同步？
            </summary>
            <div className="mt-2 text-xs text-gray-500 space-y-2">
              <p><strong>局域网模式：</strong>确保设备在同一 WiFi 下，自动发现设备</p>
              <p><strong>Tailscale 模式：</strong>安装 Tailscale 应用，登录后自动建立加密隧道</p>
              <p><strong>手动模式：</strong>获取对方 IP 地址和端口，直接建立连接</p>
              
              <p className="mt-3"><strong>推荐：</strong>使用 Tailscale，无需配置公网服务器</p>
              <p>下载地址：<a href="https://tailscale.com/download" className="text-blue-600 underline" target="_blank" rel="noopener">tailscale.com/download</a></p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

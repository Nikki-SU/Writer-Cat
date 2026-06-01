# 网文猫 - 跨端部署指南

## 概述

本文档介绍如何将网文猫应用部署为 Android 和 Windows 应用程序，以及如何使用本地局域网和远程同步功能。

## 项目结构

```
.
├── src/                    # React 前端代码
├── src-tauri/              # Rust 后端代码
│   ├── Cargo.toml         # Rust 依赖
│   └── tauri.conf.json    # Tauri 配置
├── package.json           # Node.js 依赖
└── DEPLOYMENT.md          # 本文件
```

## 前置要求

### 开发环境

- Node.js 18+
- Rust 1.70+
- Tauri CLI 2.x

### 平台特定要求

#### Windows

- Windows SDK (通过 Visual Studio)
- WebView2 Runtime

#### Android

- Android SDK
- Java Development Kit (JDK 17+)
- Android Studio (可选，推荐)

## 安装依赖

```bash
# 安装 Node.js 依赖
npm install

# 安装 Rust 依赖
cd src-tauri
cargo check
```

## 构建应用

### 开发模式

```bash
# 运行开发服务器
npm run dev

# 或使用 Tauri CLI
npm run tauri dev
```

### 生产构建

#### Windows 构建 (EXE/Installer)

```bash
# 构建 Windows 安装程序
npm run tauri build

# 输出位置
# src-tauri/target/release/bundle/msi/
# src-tauri/target/release/bundle/nsis/
```

#### Android 构建 (APK/AAB)

```bash
# 首先添加 Android 平台
cd src-tauri
cargo tauri android init

# 构建 Android APK
cargo tauri android build

# 或使用 npm 脚本
npm run tauri android build

# 输出位置
# src-tauri/gen/android/app/build/outputs/apk/
```

### 支持的构建目标

在 `src-tauri/tauri.conf.json` 中配置：

```json
{
  "bundle": {
    "targets": ["msi", "nsis", "android"]
  }
}
```

- `msi` - Windows 安装程序
- `nsis` - Windows NSIS 安装器
- `android` - Android APK/AAB

## 本地局域网同步功能

### 功能说明

网文猫支持在同一 WiFi 网络下的设备之间进行点对点同步，数据完全不上云。

### 使用方法

1. 在两台设备上都打开网文猫应用
2. 在每台设备上点击工具栏的「🔗 同步」按钮
3. 在同步面板中输入设备名称并启动同步服务器
4. 点击「发现局域网设备」按钮
5. 选择目标设备和要同步的书籍
6. 点击「同步书籍」开始传输

### 技术架构

- **设备发现**: 使用 mDNS (Multicast DNS) 在局域网内自动发现设备
- **数据传输**: 使用 TCP 协议进行点对点加密传输
- **同步协议**: 自定义的 JSON 协议，支持增量同步

### 同步流程

```
[设备A] mDNS 广播 → [局域网内所有设备]
[设备B] 发现设备A → TCP 连接请求
[设备A] 接受连接 → 双向通信通道建立
[设备A/B] 发送同步请求 → 数据传输
```

### 安全机制

- 所有数据在传输前使用设备密钥加密
- 同步完成后自动清理临时文件
- 用户可以随时停止同步服务器

## Android 部署详细说明

### Android SDK 配置

1. 安装 Android Studio
2. 安装 Android SDK Platform 33+
3. 安装 Android SDK Build-Tools 34+
4. 配置环境变量：

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 签名配置 (生产版本)

编辑 `src-tauri/gen/android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file("release.keystore")
            storePassword "your_password"
            keyAlias "your_alias"
            keyPassword "your_key_password"
        }
    }
}
```

### 测试在模拟器或真机上

```bash
# 连接设备或启动模拟器
adb devices

# 直接在设备上运行
cargo tauri android dev
```

## Windows 部署详细说明

### 安装程序配置

在 `src-tauri/tauri.conf.json` 中自定义：

```json
{
  "bundle": {
    "icon": ["icons/32x32.png", "icons/128x128.png"],
    "windows": {
      "certificateThumbprint": null,
      "digestAlgorithm": "sha256",
      "timestampUrl": ""
    }
  }
}
```

### 打包为 MSI 或 NSIS

- **MSI**: 适合企业部署，支持组策略
- **NSIS**: 轻量级安装程序，用户友好

## 同步协议 API

### Rust 命令

```rust
// 启动同步服务器
start_sync_server(device_name: String) -> SyncStatus

// 停止同步服务器
stop_sync_server()

// 获取同步状态
get_sync_status() -> SyncStatus

// 发现局域网设备
discover_devices() -> Vec<DeviceInfo>

// 请求同步
request_sync_from_device(device_id: String, book_id: String)
```

### 前端 API

```javascript
import { syncApi } from './api/sync';

// 启动服务器
const status = await syncApi.startSyncServer('My Phone');

// 发现设备
const devices = await syncApi.discoverDevices();

// 同步书籍
await syncApi.requestSyncFromDevice(device.id, book.id);
```

## 故障排除

### Android 构建失败

1. 检查 JDK 版本
2. 确认 Android SDK 路径正确
3. 清理构建缓存：
   ```bash
   cd src-tauri/gen/android
   ./gradlew clean
   ```

### Windows 构建失败

1. 确认安装了所有 Visual Studio 组件
2. 检查 WebView2 是否安装
3. 运行 `cargo clean` 清理缓存

### 同步功能不工作

1. 确认设备在同一 WiFi 网络
2. 检查防火墙设置
3. 确认两台设备都在运行同步服务器
4. 查看应用日志获取详细错误信息

## 下一步

- 阅读 `README.md` 了解更多功能
- 查看 `src-tauri/` 目录下的 Rust 源代码
- 参考 [Tauri 官方文档](https://tauri.app/)

## 远程同步方案

### 概述

网文猫支持三种远程同步方式，让您可以在不同地点的设备之间同步数据，同时完全掌控自己的数据。

### 方案对比

| 方案 | 隐私性 | 难度 | 成本 | 推荐场景 |
|------|--------|------|------|----------|
| **Tailscale** | ⭐⭐⭐⭐⭐ | ⭐ 简单 | 免费* | 日常使用 |
| 手动 IP | ⭐⭐⭐⭐⭐ | ⭐⭐ 简单 | 免费 | 临时使用 |
| 自建 VPN | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ 复杂 | 服务器成本 | 企业用户 |

*Tailscale 免费版支持 100 台设备

### 方案一：Tailscale（推荐）

#### 为什么选择 Tailscale？

- ✅ **零配置** - 安装后自动建立加密隧道
- ✅ **端到端加密** - 数据加密传输，不经过 Tailscale 服务器
- ✅ **免费** - 个人用户免费使用
- ✅ **跨平台** - 支持 Windows、macOS、Linux、Android、iOS
- ✅ **私有化部署** - 可使用 Headscale 等开源项目完全自建控制服务器

#### 设置步骤

1. **在所有设备上安装 Tailscale**

   Windows/macOS/Linux:
   ```bash
   # 安装 (Linux)
   curl -fsSL https://tailscale.com/install.sh | sh
   
   # 启动并登录
   tailscale up
   ```

   Android: 从 Google Play 或 F-Droid 安装 Tailscale 应用

2. **登录 Tailscale 账号**

   ```bash
   # 使用 GitHub/Google 账号登录
   tailscale login
   ```

3. **在网文猫中启用 Tailscale 模式**

   - 打开应用
   - 点击工具栏「🔗 同步」
   - 选择「Tailscale 远程同步」
   - 启动同步服务器
   - 查看你的 Tailscale IP 地址

4. **连接其他设备**

   - 在另一台设备上也启动 Tailscale 并登录同一账号
   - 获取对方的 Tailscale IP 地址
   - 在「手动连接」中输入对方地址
   - 开始同步

#### Tailscale 工作原理

```
[设备A: 100.64.1.1] ←→ [Tailscale 加密隧道] ←→ [设备B: 100.64.1.2]
       ↓                                                      ↓
   本地网络                                              本地网络
```

- 设备之间通过 WireGuard 协议建立加密隧道
- Tailscale 控制服务器只用于设备发现和密钥交换
- **实际数据不经过任何第三方服务器**

### 方案二：手动 IP 连接

适合临时使用，无需安装额外软件。

#### 设置步骤

1. 确保两台设备可以互相访问（同一网络或通过端口转发）
2. 在一台设备上启动同步服务器（选择「局域网同步」或「手动 IP 连接」）
3. 记录显示的 IP 地址和端口
4. 在另一台设备上选择「手动 IP 连接」
5. 输入对方 IP 和端口
6. 点击同步

#### 注意事项

- 需要知道对方的公网 IP 或局域网 IP
- 如果在不同的网络，需要配置路由器端口转发
- 建议配合动态 DNS 使用

### 方案三：自建 VPN

适合有技术能力且希望完全掌控的用户。

#### 推荐方案：Headscale + WireGuard

Headscale 是 Tailscale 控制服务器的开源实现，可以部署在自己的服务器上。

#### 设置步骤

1. **部署 Headscale 服务器**

   ```bash
   # 使用 Docker 部署
   docker run -d \
     --name headscale \
     -v /etc/headscale:/etc/headscale \
     -p 8080:8080 \
     -p 3478:3478/udp \
     headscale/headscale:latest
   ```

2. **配置 DNS**

   将 `your-domain.com` 解析到你的服务器 IP

3. **客户端配置**

   ```bash
   # 安装 CLI
   curl -fsSL https://tailscale.com/install.sh | sh
   
   # 使用自建控制服务器
   export TS_CONTROL_SERVER=https://your-domain.com
   tailscale up
   ```

### 数据安全

#### 传输安全

- 所有同步数据使用 TCP 连接传输
- 建议配合 VPN（WireGuard/Tailscale）使用
- 未来版本将添加端到端加密

#### 数据存储

- 所有数据存储在本地设备
- 云端不存储任何数据
- 同步完成后可删除临时文件

### 常见问题

#### Q: Tailscale 免费版有什么限制？

A: 免费版支持 100 台设备，使用 Tailscale 的公开控制服务器。对于大多数用户来说足够使用。

#### Q: 如果没有公网 IP 怎么远程同步？

A: 使用 Tailscale。它通过 UDP 打洞技术，即使没有公网 IP 也能建立连接。

#### Q: 如何确保数据安全？

A: 
1. 使用 Tailscale（已内置 WireGuard 加密）
2. 确保设备不被未授权访问
3. 定期备份重要数据

#### Q: 同步失败怎么办？

A: 
1. 检查网络连接
2. 确认防火墙允许相应端口
3. 查看应用日志获取详细错误信息
4. 尝试重启同步服务器

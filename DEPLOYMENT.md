# 网文猫 - 跨端部署指南

## 概述

本文档介绍如何将网文猫应用部署为 Android 和 Windows 应用程序，以及如何使用本地局域网同步功能。

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

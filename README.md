# 网文猫 🐱📖

> 隐私优先的本地网文写作工具

网文猫是一款专为网文写手设计的本地化写作工具，核心理念是**数据完全在本地**，不上传任何云端，保护写手作品不被AI平台抓取。

## ✨ 特色功能

- 📖 **情节管理** - 网格卡片视图，情节-情绪可视化追踪
- 🎯 **伏笔系统** - 双向互锁机制，确保伏笔不遗漏
- 🌍 **世界观管理** - 条目式管理，可挂载到具体章节
- 👤 **人物卡片** - 双面翻转设计，正面基础信息，反面成长时间线
- ✍️ **专业编辑器** - 基于CodeMirror 6，输入响应≤16ms，自动保存防抖
- 🤖 **AI辅助** - 本地Ollama/在线API集成，支持错别字检查、人物识别等
- 🔒 **隐私安全** - 数据完全本地，支持Hub-Leaf局域网同步

## 🛠️ 技术栈

| 层 | 技术 | 说明 |
|---|---|---|
| **桌面壳** | Tauri 2 | 轻量级，比Electron轻量10倍+ |
| **前端** | React 18 + Vite + TailwindCSS | 现代化前端开发体验 |
| **后端** | Rust (Tauri内置) | 高性能，系统级集成 |
| **数据库** | SQLite | 轻量、单文件、离线友好 |
| **本地AI** | Ollama | 开源本地运行 |
| **在线AI** | OpenAI兼容接口 | 支持多种在线大模型 |

## 📁 项目结构

```
Writer-Cat/
├── src-tauri/           # Tauri Rust后端
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── src/
│       ├── main.rs      # Tauri入口
│       ├── lib.rs       # 库入口
│       ├── db.rs        # SQLite数据库
│       ├── commands/    # Tauri命令
│       └── models/      # 数据模型
├── src/                 # React前端
│   ├── main.jsx         # React入口
│   ├── App.jsx          # 主应用
│   ├── api/             # Tauri命令封装
│   ├── components/      # React组件
│   │   ├── Editor/      # 编辑器相关
│   │   ├── Sidebar/     # 左边栏
│   │   ├── CharacterCard/ # 人物卡片
│   │   ├── PlotGrid/    # 情节网格
│   │   └── common/      # 通用组件
│   ├── pages/           # 页面组件
│   ├── stores/          # 状态管理
│   └── utils/           # 工具函数
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- Rust >= 1.70
- npm 或 yarn

### 安装依赖

```bash
# 安装前端依赖
npm install

# 安装Tauri CLI（如果需要）
npm install -D @tauri-apps/cli
```

### 开发模式

```bash
# 启动开发服务器
npm run dev

# 或启动Tauri开发模式
npm run tauri dev
```

### 构建发布

```bash
# 构建生产版本
npm run tauri build
```

### Ollama安装（AI功能）

```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# 从 https://ollama.com 下载安装

# 拉取默认中文模型
ollama pull qwen2.5:7b
```

## ⚙️ 配置说明

### AI设置

在设置页面可以配置：

1. **Ollama（本地）** - 默认选项，需要本地安装Ollama
2. **OpenAI** - 输入API Key和端点
3. **DeepSeek** - 输入API Key和端点
4. **自定义API** - 支持任何OpenAI兼容接口

### 同步设置

- **Hub模式** - 作为主设备，存储数据主副本
- **Leaf模式** - 作为从设备，从Hub同步数据

## 📝 数据存储

数据存储在应用数据目录：

- **Windows**: `%APPDATA%/writer-cat/`
- **macOS**: `~/Library/Application Support/writer-cat/`
- **Linux**: `~/.local/share/writer-cat/`

## 🎨 界面预览

### 首页
- 书籍管理
- 功能入口（情节、结构、人物、写作）
- 快速开始写作按钮

### 写作页
- 上栏工具条（字体、颜色、AI功能）
- 左边栏（书目、章节、情节、伏笔、人物、世界观）
- 核心编辑器区域
- 右边栏（AI错别字审阅，临时）

### 情节页
- 网格卡片布局
- 每章一个卡片
- 情绪三段色圆形标记

### 人物页
- 人物卡片列表
- 双面翻转卡片
- 人物关系图

## 📄 License

MIT License

---

**网文猫** - 让写手专注于创作，数据安全有保障 🐱📖

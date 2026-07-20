# PromptMedia - ComfyUI AI 艺术多媒体画廊 (零后端本地版)

PromptMedia 是一款专为 ComfyUI 与 AI 艺术创作者打造的本地多媒体分类展示与播放网站。无需繁琐的后端部署，通过扫描本地文件夹即可瞬间提取 PNG/WebP 图像元数据中的生成参数，并支持音频和视频的在线展示播放。

同时，为了给用户带来最卓越的视觉与交互体验，网站支持 **3套精美视觉主题** 并支持**一键无痛切换**与 **本地偏好持久化**。

---

## ✨ 核心特性

1. 📂 **零后端自动分类**：在本地 `public/media/` 目录下按您的喜好创建分类目录，放入生成的媒体即可，无需任何数据库或服务器脚本，全静态脱机运行。
2. 🧠 **ComfyUI 元数据完美提取**：原生提取 PNG 图像的 `tEXt`/`iTXt` 区块和 WebP 的 `XMP` 信息。自动还原 Positive/Negative Prompts, Seed, Steps, CFG, Sampler, Scheduler, Checkpoint 模型及原始 API Graph / UI Graph 工作流 JSON。
3. 🔗 **兼容性侧边栏 (JPG/丢失元数据图)**：针对被压缩而丢失元数据的媒体，自动加载并融合同名 `.json` 侧边栏的 ComfyUI 工作流。
4. 🚀 **3套 Premium 视觉主题**：
   - **🌙 科技暗黑 (Cyber Dark - 默认)**：深邃的赛博朋克黑金风，霓虹紫色与青色流光闪烁。
   - **🍃 清新雅致 (Fresh Mint)**：大自然薄荷绿护眼浅色风，纯净淡绿白卡片，体验如清风拂面。
   - **⚡️ 炫酷动感 (Dynamic Anime)**：次元动感渐变风，四色流光背景动画，毛玻璃粒子浮动漂浮，3D 悬浮弹性倾斜卡片，微交互拉满。
5. ⌨️ **极速键盘快捷键**：详情模态窗下，支持 **键盘左右方向键 (←/→)** 切换上一张/下一张图片，支持 **ESC 键** 快速返回。
6. 📋 **一键复制与复现**：所有生成参数、提示词以及 ComfyUI API / UI 格式的工作流 JSON 均支持一键复制，可直接拖回 ComfyUI 还原画布！

7. 💡 **智能提示词生成器与多风格灵感推荐**：集成强大的提示词生成器，支持中英双向搜索与对照，可微调单个标签权重及排序。新增 **12 种预设风格一键随机推荐** (日系动漫、写实人像、赛博朋克、奇幻魔法等)，快速激活灵感。
8. 🤖 **AI 提示词大师与本地大模型集成**：专为 Z-Image, Flux, SD3 等支持长文本自然语言的生图模型设计。支持配置本地大模型接口（如 Ollama，默认 `llama3:latest`）或远程接口（如 OpenAI, DeepSeek），自动将您的脑洞设想扩充为电影级精细的英文提示词，支持中英双语对照与一键复制。

---

## 📂 项目结构

```text
imageshow/
├── doc/                        # 项目说明文档
│   ├── requirements.md         # 需求分析与 PRD
│   ├── user_guide.md           # 用户使用与操作指南
│   ├── deployment.md           # 静态构建与多平台部署方案
│   └── changelog.md            # 项目变更记录与升级历史
├── public/
│   ├── media/                  # 分类媒体目录（支持绑定为指向本地其他输出目录 of 软链接）
│   │   ├── media-data.json     # 扫描生成的前端 JSON 数据库
│   │   ├── cyberpunk/
│   │   ├── nature/
│   │   └── fantasy/
├── src/
│   ├── App.jsx                 # React 主应用
│   ├── App.css                 # 局部布局与细化组件样式
│   ├── index.css               # 全局设计系统及 3 套主题 of CSS 变量 & 动画定义
│   └── main.jsx                # React 入口
├── scan-media.js               # ComfyUI 元数据扫描核心脚本
├── package.json                # 项目依赖及运行配置
└── README.md                   # 本说明文件
```

---

## 🛠️ 快速开始

### 1. 安装项目依赖
在项目根目录下，执行：
```bash
npm install
```

### 2. 运行本地扫描（更新与绑定目录）
在项目根目录下，通过 Node.js 执行媒体扫描脚本：
- **首次运行** 或需要 **切换绑定的目录**：
  ```bash
  npm run scan -- --switch
  ```
  在控制台输入文件夹路径（您可以直接把 ComfyUI 图片输出文件夹拖入终端窗口），扫描器会自动在 `public/` 下创建软链接 `media` 指向该目录，并将配置保存在根目录下的 `directory-config.json` 中。
- **后续快速同步已有目录**：
  ```bash
  npm run scan
  ```
  程序会自动解析该目录下所有分类文件夹的图片参数，并将生成的 `media-data.json` 数据库保存至 `public/media/` 目录下。

### 3. 开启本地开发预览
启动本地 Vite 调试服务器：
```bash
npm run dev
```
打开控制台打印的地址（通常是 `http://localhost:5173`）即可预览您的超级画廊！

---

## 📦 打包与静态部署

本项目由于纯静态、零后端，可以直接部署到任何静态服务器：
```bash
# 执行打包
npm run build
```
编译生成的 `dist/` 文件夹即可直接上传部署至 **Nginx**, **Vercel**, **GitHub Pages**, **GitHub Actions / GitLab CI**。

详细部署指南与策略请参阅 [编译部署与上线指南](doc/deployment.md)。

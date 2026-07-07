# PromptGallery - ComfyUI AI 艺术画廊 (零后端本地版)

PromptGallery 是一款专为 ComfyUI 与 AI 艺术创作者打造的本地图像分类展示网站。无需繁琐的后端部署，通过扫描本地文件夹即可瞬间提取 PNG/WebP 图像元数据中的生成参数。

同时，为了给用户带来最卓越的视觉与交互体验，网站支持 **3套精美视觉主题** 并支持**一键无痛切换**与 **本地偏好持久化**。

---

## ✨ 核心特性

1. 📂 **零后端自动分类**：在本地 `public/images/` 目录下按您的喜好创建分类目录，放入生成的图片即可，无需任何数据库或服务器脚本，全静态脱机运行。
2. 🧠 **ComfyUI 元数据完美提取**：原生提取 PNG 图像的 `tEXt`/`iTXt` 区块和 WebP 的 `XMP` 信息。自动还原 Positive/Negative Prompts, Seed, Steps, CFG, Sampler, Scheduler, Checkpoint 模型及原始 API Graph / UI Graph 工作流 JSON。
3. 🔗 **兼容性侧边栏 (JPG/丢失元数据图)**：针对被压缩而丢失元数据的图片，自动加载并融合同名 `.json` 侧边栏的 ComfyUI 工作流。
4. 🚀 **3套 Premium 视觉主题**：
   - **🌙 科技暗黑 (Cyber Dark - 默认)**：深邃的赛博朋克黑金风，霓虹紫色与青色流光闪烁。
   - **🍃 清新雅致 (Fresh Mint)**：大自然薄荷绿护眼浅色风，纯净淡绿白卡片，体验如清风拂面。
   - **⚡️ 炫酷动感 (Dynamic Anime)**：次元动感渐变风，四色流光背景动画，毛玻璃粒子浮动漂浮，3D 悬浮弹性倾斜卡片，微交互拉满。
5. ⌨️ **极速键盘快捷键**：详情模态窗下，支持 **键盘左右方向键 (←/→)** 切换上一张/下一张图片，支持 **ESC 键** 快速返回。
6. 📋 **一键复制与复现**：所有生成参数、提示词以及 ComfyUI API / UI 格式的工作流 JSON 均支持一键复制，可直接拖回 ComfyUI 还原画布！

---

## 📂 项目结构

```text
imageshow/
├── doc/                        # 项目说明文档
│   ├── requirements.md         # 需求分析与 PRD (已更新三套主题定义)
│   ├── user_guide.md           # 用户使用与操作指南 (已更新主题切换操作)
│   └── deployment.md           # 静态构建与多平台部署方案
├── public/
│   ├── images/                 # 本地分类图片目录（按分类新建子文件夹）
│   │   ├── cyberpunk/
│   │   ├── nature/
│   │   └── fantasy/
│   └── images-data.json        # 扫描生成的前端 JSON 数据库
├── src/
│   ├── App.jsx                 # React 主应用（集成了三套主题逻辑）
│   ├── App.css                 # 局部布局与细化组件样式
│   ├── index.css               # 全局设计系统及 3 套主题的 CSS 变量 & 动画定义
│   └── main.jsx                # React 入口
├── scan-images.js              # ComfyUI 元数据扫描核心脚本
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

### 2. 放入您的 AI 图片
将您 ComfyUI 生成的原图（支持 PNG/WebP）按照您想呈现的分类，拖放到对应的子目录中，例如：
- `public/images/cyberpunk/street.png`
- `public/images/nature/forest.webp`

### 3. 运行本地扫描脚本
每当您**添加、删除、重命名**了本地图片，在根目录下运行以下命令以提取参数并重构前端数据库：
```bash
npm run scan
```

### 4. 开启本地开发预览
启动本地 Vite 调试服务器：
```bash
npm run dev
```
打开控制台打印的本地地址（通常是 `http://localhost:5173`）即可预览您的超级画廊！

---

## 📦 打包与静态部署

本项目由于纯静态、零后端，可以直接部署到任何静态服务器：
```bash
# 执行打包
npm run build
```
编译生成的 `dist/` 文件夹即可直接上传部署至 **Nginx**, **Vercel**, **GitHub Pages**, **GitHub Actions / GitLab CI**。

详细部署指南与策略请参阅 [编译部署与上线指南](doc/deployment.md)。

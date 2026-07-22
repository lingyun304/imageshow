# PromptMedia - ComfyUI AI 艺术多媒体画廊 & 视频生成控制台

PromptMedia 是一款专为 ComfyUI、AI 艺术创作者及 AIGC 爱好者打造的本地多媒体分类展示、视频生成与播放控制台。既支持脱机扫描本地文件夹、实时解析 PNG/WebP 图像与视频元数据中的生成参数，又内置了对接阿里云 DashScope (HappyHorse / 通义万相 Wanx) 等视觉大模型的**视频生成控制台**。

网站配备 **3套 Premium 视觉主题**（科技暗黑、清新雅致、炫酷动感），支持**一键无痛切换**与 **本地偏好持久化**。

---

## ✨ 核心特性

1. 📂 **零后端自动分类 & 前端目录直导**：
   - **自动分类**：在本地 `public/media/` 目录下按喜好创建分类目录，放入生成的媒体即可脱机全静态运行。
   - **前端实时导入**：无需重启服务，支持通过顶栏“选择本地目录”使用 File System Access API 动态导入并在线解析展示本地任意文件夹中的 AI 作品。

2. 🧠 **ComfyUI 元数据深度提取**：
   - 原生提取 PNG 图像的 `tEXt`/`iTXt` 区块和 WebP 的 `XMP` 信息。
   - 自动还原 Positive/Negative Prompts, Seed, Steps, CFG, Sampler, Scheduler, Checkpoint 模型及原始 API Graph / UI Graph 工作流 JSON。
   - 针对压缩缺失元数据的图像，自动兼容并加载同名 `.json` 侧边栏工作流。

3. 🎬 **AI 视频生成控制台 (Video Generator)**：
   - **四种生成模式全覆盖**：支持文生视频 (T2V)、图生视频 (I2V)、参考生视频 (R2V) 及视频重绘编辑 (Edit)。
   - **主流与自定义大模型支持**：内置 HappyHorse-1.1、通义万相 Wanx 2.1 / 2.0、CogVideoX 等视频模型；支持根据当前模式按需**动态精准隔离过滤**与**一键自动联动**；支持“+ 管理模型”自定义拓展与删除管理，内置模型安全受保护。
   - **接口配置与明码查看**：支持一键展开配置阿里 DashScope API Key（提供 👁️ 眼睛明暗码实时查看切换）与自定义 Base URL。
   - **CORS 代理与 3 秒异步任务轮询**：本地 Vite 自动化配置 `/api/v1` 代理突破跨域限制；发起生成后后台开启每 3 秒一次的状态轮询（`PENDING` ➔ `RUNNING` ➔ `SUCCEEDED` / `FAILED`），支持实时 Task ID 进度展示与手动刷新。
   - **丰富参数与视频播放**：支持 720P / 1080P 清晰度、5 种画面长宽比 (16:9, 9:16, 1:1, 4:3, 3:4)、3~15秒时长 slider 及随机 Seed 摇号；生成成果自动汇入右侧库，集成 HTML5 原生播放器与 MP4 本地下载。

4. 🎨 **1600px 宽屏排版与 3 套 Premium 视觉主题**：
   - **1600px 边缘齐平**：统一顶部导航栏与主视图最大宽度为 1600px，视频控制侧边栏拓展至 420px，顶栏 Tab 拥有统一字号与 Lucide 图标。
   - **🌙 科技暗黑 (Cyber Dark - 默认)**：深邃的赛博朋克黑金风，霓虹紫色与青色流光闪烁。
   - **🍃 清新雅致 (Fresh Mint)**：大自然薄荷绿护眼浅色风，纯净淡绿白卡片，体验如清风拂面。
   - **⚡️ 炫酷动感 (Dynamic Anime)**：次元动感渐变风，四色流光背景动画，毛玻璃粒子浮动漂浮，3D 悬浮弹性倾斜卡片，微交互拉满。

5. ⌨️ **极速快捷键与复现工具**：
   - 模态窗下支持 **键盘左右方向键 (←/→)** 切换上一张/下一张图片，**ESC 键** 快速退出。
   - 参数提示词与 ComfyUI API / UI 格式工作流 JSON 支持一键复制，可直接拖回 ComfyUI 还原画布。

6. 💡 **提示词生成器 & 🤖 AI 提示词大师**：
   - 集成中英双语提示词生成器与 12 种预设视觉风格推荐。
   - 集成 AI 提示词大师，支持对接本地大模型（如 Ollama `llama3:latest`）或远程 LLM，将简短想法自动扩写为电影级生图提示词。

---

## 📂 项目结构

```text
imageshow/
├── doc/                        # 详细项目与运维文档
│   ├── requirements.md         # 需求分析与 PRD 规范
│   ├── user_guide.md           # 用户操作与使用指南
│   ├── deployment.md           # 静态构建、API 代理与部署方案
│   └── changelog.md            # 项目变更记录与升级版本历史
├── public/
│   ├── media/                  # 分类媒体目录
│   │   ├── media-data.json     # 扫描生成的前端 JSON 数据库
│   │   ├── cyberpunk/
│   │   ├── nature/
│   │   └── fantasy/
├── src/
│   ├── App.jsx                 # React 主应用（包含导航、画廊、提示词生成器与视频生成控制台）
│   ├── App.css                 # 细化组件、视频生成双栏工作区与模态框样式
│   ├── index.css               # 全局设计系统、1600px 容器及 3 套主题 CSS 变量与动画
│   └── main.jsx                # React 入口
├── scan-media.js               # ComfyUI 元数据深度扫描脚本
├── vite.config.js              # Vite 构建配置（包含 DashScope CORS 本地代理）
├── package.json                # 项目依赖及运行配置
└── README.md                   # 本说明文件
```

---

## 🛠️ 快速开始

### 1. 安装项目依赖
在项目根目录下执行：
```bash
npm install
```

### 2. 运行本地扫描（更新与绑定目录）
在项目根目录下，通过 Node.js 执行媒体扫描脚本：
- **首次运行** 或需要 **切换绑定的目录**：
  ```bash
  npm run scan -- --switch
  ```
  在控制台输入文件夹路径（您可以直接把 ComfyUI 输出文件夹拖入终端窗口），扫描器会自动在 `public/` 下创建软链接 `media` 指向该目录，并将配置保存在根目录下的 `directory-config.json` 中。
- **后续快速同步已有目录**：
  ```bash
  npm run scan
  ```
  程序会自动解析该目录下所有分类文件夹的媒体参数，并将生成的 `media-data.json` 数据库保存至 `public/media/` 目录下。

### 3. 开启本地开发预览
启动本地 Vite 调试服务器：
```bash
npm run dev
```
打开控制台打印的地址（通常是 `http://localhost:5173`）即可体验画廊与视频生成控制台！

---

## 📦 打包与部署

由于前端为 React 架构并配置了全套静态支持，可以轻松部署到各类 Web 服务器：
```bash
# 执行编译打包
npm run build
```
编译生成的 `dist/` 文件夹可以直接部署至 **Nginx**, **Vercel**, **GitHub Pages**, **GitHub Actions / GitLab CI**。

详细部署指南、代理配置与服务端策略请参阅 [编译部署与上线指南](doc/deployment.md)。

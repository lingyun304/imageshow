# 变更记录

## [1.7.0] - 2026-07-22

### 1. 严格仅收录并精确分类用户指定的 10 款最新视频大模型
* **需求背景**:
  根据用户反馈精简收录模型列表，移除多余选项，严格保留指定的 10 款最新大模型：`qwen-image-2.0-pro-2026-06-22`、`qwen-image-2.0-pro-2026-04-22`、`wan2.7-t2v-2026-06-12`、`happyhorse-1.0-video-edit`、`wan2.7-r2v-2026-06-12`、`wan2.7-i2v-2026-04-25`、`wan2.7-t2v-2026-04-25`、`happyhorse-1.1-t2v`、`happyhorse-1.0-r2v`、`happyhorse-1.1-i2v`。
* **修改覆盖范围**:
  1. 修改 `src/App.jsx`：在 `VIDEO_MODELS` 数组中严格收录这 10 款原生模型，并精准绑定 `mode: 't2v' | 'i2v' | 'r2v' | 'edit'` 分类属性，实现模型下拉框动态隔离过滤。
  2. 同步更新全部配套系统文档（`doc/requirements.md`、`doc/deployment.md`、`doc/user_guide.md`）。
* **功能影响范围**:
  视频生成控制台模块，保证了模型下拉框的极简清爽与精准匹配。

## [1.6.9] - 2026-07-22

### 1. 全量适配阿里 DashScope 视频 API 官方规范 (R2V/Edit 媒体类型、Ratio 与 [Image N] 语法)
* **需求背景**:
  对齐阿里云 DashScope 官方 R2V 及 Video Edit cURL 示例协议：参考图媒体类型需指定为 `reference_image`，画面长宽比需以 `parameters.ratio` 提交，编辑模式对齐时长时省略 `duration`，并提供 `[Image 1]` 官方变量描述语法支持。
* **修改覆盖范围**:
  1. 修改 `src/App.jsx`：在 `handleGenerateVideo` 中将 R2V 与 Edit 模式下的参考图封装为 `{ type: "reference_image", url: ... }`，将 Edit 原视频封装为 `{ type: "video", url: ... }`；将 `parameters.ratio` 设为选中的长宽比（如 `16:9`）；编辑模式选择“与输入对齐”时省略 `duration` 参数；在 R2V 模式下补充 `[Image 1]`、`[Image 2]` 官方变量快捷插入药丸，并新增东方韵味与角色服饰替换等官方示例 Prompt。
  2. 修改 `src/App.css`：新增 `.v-help-tooltip-container` 与 `.v-help-popover` 悬浮 Glassmorphism 样式。
  3. 同步更新全部配套系统文档（`doc/requirements.md`、`doc/deployment.md`、`doc/user_guide.md`）。
* **功能影响范围**:
  视频生成控制台模块，全量精确对齐了阿里云 DashScope 官方 MAAS 协议，确保各模式视频合成 100% 成功。

### 2. 调优视频合成异步任务轮询间隔为 10 秒
* **需求背景**:
  原 3 秒一次的任务状态查询过于频繁，容易触发 API 频控限制并增加浏览器网络请求压力。
* **修改覆盖范围**:
  1. 修改 `src/App.jsx`：在 `pollTaskStatus` 中将 `setInterval` 轮询间隔由 `3000ms` 调整为 `10000ms`（10 秒），同步更新卡片文案显示为“等待约 X * 10 秒”。
  2. 同步更新全部配套系统文档（`doc/requirements.md`、`doc/deployment.md`、`doc/user_guide.md`）。
* **功能影响范围**:
  视频生成控制台模块，极大地降低了异步任务轮询的接口调用频次，提升了轮询的稳定度。

### 3. 实现生成的视频自动落盘写盘存入当前工作目录 /vedio/
* **需求背景**:
  视频生成成功后，需要自动将生成的 MP4 文件存入当前用户选定/使用的工作目录 `/vedio/` 子文件夹中，并实时更新至画廊画幅中。
* **修改覆盖范围**:
  1. 修改 `src/App.jsx`：在 `handleImportDirectory` 中保存 `activeDirHandle` 句柄；编写 `saveGeneratedVideoToCurrentDir` 函数，当任务渲染成功 (`SUCCEEDED`) 后，自动通过 File System Access API 将视频 Blob 数据直接写入当前工作目录的 `/vedio/${fileName}`（非本地导入模式下自动触发文件浏览器导出与保存）；同步自动组装并塞入 `images` 画廊列表分类库。
  2. 同步更新全部配套系统文档（`doc/requirements.md`、`doc/deployment.md`、`doc/user_guide.md`）。
* **功能影响范围**:
  视频生成控制台模块与分类媒体库模块，彻底实现了视频成果自动落盘写盘与画廊自动同步，免去手动保存的繁琐步骤。

## [1.6.8] - 2026-07-22

### 1. 规范视频生成各模式媒体数量限制（R2V 最多9张、Edit 1视频+1参考图）
* **需求背景**:
  精准规范 4 种视频生成模式下的媒体输入边界：文生视频 (T2V) 无图像 (0张)；图生视频 (I2V) 支持 1 张源图 (`image1`)；参考生视频 (R2V) 支持最多 9 张参考图矩阵 (`image1` ~ `image9`) 与多图对白范本；视频编辑 (Edit) 支持 1 个原视频 (`video1`) + 1 张编辑参考图 (`image1`) 与重绘替换范本。
* **修改覆盖范围**:
  1. 修改 `src/App.jsx`：在 R2V 模式下扩展 `videoRefImages` 数组存储上限至 9 张，挂载 `image1` ~ `image9` Badge 徽章与相匹配的变量快捷插入药丸；在 Edit 模式下明确划分为 1 个原视频 (`video1`) + 1 张编辑参考图 (`videoEditRefImage` -> `image1`) 组合上传盒；为 T2V 模式隐藏图像上传盒与变量药丸。
  2. 修改 `src/App.css`：优化多图网格自适应排版、变量标签插入药丸形态及独立参考图预览盒样式。
  3. 同步更新全部配套系统文档（`doc/requirements.md`、`doc/deployment.md`、`doc/user_guide.md`）。
* **功能影响范围**:
  视频生成控制台模块，明确界定了不同模式的输入规格，彻底满足了 R2V 多图矩阵与 Edit 独立原视频+参考图重绘的专业需求。

## [1.6.7] - 2026-07-22

### 1. 新增 DashScope API Key 眼睛明暗码切换与全站导航页签图标全量补齐
* **需求背景**:
  用户在填写/查看阿里云 DashScope API 密钥时需要能够切换明文预览以进行二次核对；同时为了保持顶部导航栏选项的视觉一致性，需要为全站所有 Tab 页签均配备精致的小图标。
* **修改覆盖范围**:
  1. 修改 `src/App.jsx`：引入 Lucide `Eye` 与 `EyeOff` 图标及 `showDashscopeKey` 状态，在 API Key 密码框右侧新增明暗码切换按钮；为“首页”(`Layers`)、“分类媒体库”(`ImageIcon`)、“提示词生成器”(`Sparkles`)、“AI 提示词大师”(`Terminal`)统一补齐对应的视觉 Icon，与“视频生成”(`Video`) 100% 对齐。
  2. 同步更新全部配套系统文档（`doc/requirements.md`、`doc/deployment.md`、`doc/user_guide.md`）。
* **功能影响范围**:
  视频生成设置模块与顶部导航栏模块，极大地提升了 API 密钥核验的安全便利度，同时实现了全站导航栏 Icon 视觉基调的全量统一。

## [1.6.6] - 2026-07-22

### 1. 统一顶部导航栏操作按钮字体属性样式
* **需求背景**:
  解决顶栏“选择本地目录 / 载入默认库”按钮（`.nav-action-btn`）因未显式继承导航 Tab 字体规则，导致与其他 5 个 Tab 页签字体样式不一致的问题。
* **修改覆盖范围**:
  1. 修改 `src/index.css`：为 `.nav-action-btn` 补充 `font-family: var(--font-heading)`、`font-size: 0.95rem` 及 `font-weight: 500` 全套规则；增加 `html.fresh-mint .nav-action-btn` 主题样式，确保在全站三大主题下与顶栏 `nav-link` 按钮保持相同的字体形态。
  2. 同步更新全部配套系统文档（`doc/requirements.md`、`doc/deployment.md`、`doc/user_guide.md`）。
* **功能影响范围**:
  顶部导航栏模块，“选择本地目录 / 载入默认库”操作按钮的字体、字号、字重与左侧所有 Tab 导航栏按钮完全一致，提升了导航栏视觉效果。

## [1.6.5] - 2026-07-22

### 1. 统一页面与导航容器 1600px 边缘对齐及拓展视频操作区宽度
* **需求背景**:
  解决视频生成控制台面板右侧边缘与顶部导航栏组件（主题切换选择器）未精准齐平的问题，同时扩展视频生成左侧控制面板的默认宽度，使控件排版更为舒适舒展。
* **修改覆盖范围**:
  1. 修改 `src/index.css`：将顶部导航栏容器 `.navbar-container`、主视图容器 `.main-layout` 以及页脚容器 `.footer-container` 的最大宽度从 `1400px` 统一提升并对齐至 `1600px`，配置 `width: 100%`，确保左右两侧边框在所有大屏分辨率下严格对齐。
  2. 修改 `src/App.css`：调整视频生成双栏工作区 `.video-workspace-layout` 的 CSS Grid 网格定义，将左侧控制侧边栏列宽从 `360px` 拓宽至 `420px`。
  3. 同步更新全部配套系统文档（`doc/requirements.md`、`doc/deployment.md`、`doc/user_guide.md`）。
* **功能影响范围**:
  全站所有页面（首页、媒体库、提示词生成器、AI 提示词大师、视频生成控制台），页面左右侧边距与顶部导航栏按钮实现 100% 绝对垂直对齐；视频操作区横向空间增加 60px，表单控件与按钮排版更加美观流畅。

## [1.6.4] - 2026-07-22

### 1. 新增自定义视频模型删除管理功能
* **需求背景**:
  用户在使用“+ 添加模型”功能创建自定义视频大模型后，需要能够对废弃或填错的自定义模型进行删除与管理，保持模型下拉列表的整洁。
* **修改覆盖范围**:
  1. 修改 `src/App.jsx`：添加 `handleDeleteCustomModel` 核心逻辑，同步更新 `availableVideoModels` 状态与 `localStorage` 缓存持久化，若删除的为当前选中模型自动联动重置为模式内合法模型，对系统内置原生模型执行防护逻辑；在下拉选择框旁新增可消除自定义模型的删除按钮；在自定义模型管理弹窗中新增已创建模型的列表呈现与删除操作按钮。
  2. 同步更新全部配套系统文档（`doc/requirements.md`、`doc/deployment.md`、`doc/user_guide.md`）。
* **功能影响范围**:
  视频生成控制台模块，支持快捷及批量管理/清理自建的视频大模型，强化了模型管理的灵活度与易用性。

## [1.6.3] - 2026-07-22

### 1. 按生成模式精准过滤视频模型下拉列表与智能切换联动
* **需求背景**:
  不同视频生成模式（文生视频 t2v、图生视频 i2v、参考生视频 r2v、视频编辑 edit）在 API 接口规范、模型能力及入参需求上不相同，无法跨模式通用；此前生成控制侧边栏的模型下拉菜单展示了全量模型，需要在不同生成模式下按模式精准隔离过滤，并实现模式切换时的模型自动联动选择。
* **修改覆盖范围**:
  1. 修改 `src/App.jsx`：在视频生成控制侧边栏的模型下拉选择框 `<select className="v-model-picker">` 中增加 `.filter(m => !m.mode || m.mode === videoSubTab)` 动态按模式过滤；添加 `useEffect` 状态同步钩子，当生成模式 `videoSubTab` 或模型数组变更时，若当前选中的 `videoModel` 不符合新模式要求，自动智能联动选中新模式下的首个可用模型；更正默认初始选中模型为适用于默认 `t2v` 模式的 `happyhorse-1.1-t2v`。
  2. 同步更新全部配套系统文档（`doc/requirements.md`、`doc/deployment.md`、`doc/user_guide.md`）。
* **功能影响范围**:
  视频生成控制台模块，模型选择下拉框根据选中的生成模式进行精准隔离匹配展示，切换生成模式时自动智能选中合法模型，避免错选非当前模式模型导致 API 失败，显著提升了参数配置准确度与交互体验。

## [1.6.2] - 2026-07-21

### 1. 解决视频生成 API 跨域 CORS 拦截问题
* **需求背景**:
  解决前端在 `http://localhost:5173` 本地开发环境下直接发起 Client-side 异步 POST 请求调用阿里 DashScope 视频生成 API 时被浏览器预检请求 (Preflight) 拦截的问题。
* **修改范围**:
  1. 修改 `vite.config.js`：配置 `server.proxy` 开发服务器反向代理，将前端发往 `/api/v1` 的请求代理转发至阿里云端目标域名 `https://llm-ioipmcjm1v2f40ks.cn-beijing.maas.aliyuncs.com`，并将 `/dashscope-proxy` 代理转发至 `https://dashscope.aliyuncs.com`。
  2. 修改 `src/App.jsx`：新增 `getProxiedUrl` 工具函数，自动将用户配置的远程 API 端点映射至 Vite 本地开发代理入口。
* **功能影响范围**:
  彻底解决了前端直连外部 API 时的 CORS 跨域安全拦截阻断，保障了本地开发环境下视频生成 API 请求的成功发送。

### 2. 实现视频合成异步任务状态轮询与卡片可视化展示
* **需求背景**:
  阿里 DashScope 视频合成 API 为异步架构（开启 `X-DashScope-Async: enable`），POST 提交生成请求后只返回 `task_id`，需要前端持续查询 `GET /api/v1/tasks/{task_id}` 获取任务执行进度并在完成后提取 MP4 视频 URL 渲染呈现。
* **修改范围**:
  1. 修改 `src/App.jsx`：添加 `getTaskStatusUrl`、`checkSingleTask` 与 `pollTaskStatus` 异步轮询函数；重构 `handleGenerateVideo`，提交成功后向成果库追加 `PENDING` / `RUNNING` 状态卡片并启动每 3 秒一次的定时轮询，并在 `SUCCEEDED` / `FAILED` 时自动切换状态；更新成果卡片 rendering，支持渲染进度条、Task ID 显示及“刷新状态”手动查询操作。
  2. 修改 `src/App.css`：新增 `.v-task-pending-placeholder`、`.v-task-failed-placeholder`、`.v-pending-text`、`.v-pending-taskid` 以及状态徽章 CSS 样式。
  3. 同步更新全部配套系统文档（`doc/requirements.md`、`doc/deployment.md`、`doc/user_guide.md`）。
* **功能影响范围**:
  补齐了异步视频生图/生视频任务生命周期的完整闭环，实现了从提交派发、定时轮询、实时渲染进度到成功展示播放视频或友好错误排错的全流程可视化管理。

## [1.6.1] - 2026-07-21

### 1. 优化视频生成表单控件外观与免 Key/异常本地模拟策略
* **需求背景**:
  解决视频生成控制面板表单元素在不同主题（如清新雅致 light mode）下呈现灰暗外观的问题；同时优化 API 密钥与报错处理，未填写 Key 时严格全本地模拟不走网络请求，填 Key 但 API 异常时（如 400 模型不存在）自动平滑切入本地模拟流程。
* **修改范围**:
  1. 修改 `src/App.css`：为 `.video-header-modes`, `.v-model-select`, `.v-model-picker`, `.v-prompt-textarea`, `.v-upload-dropzone`, `.v-select-pill`, `.v-ratio-btn` 等控件添加全套主题 CSS 变量与 `select option` 背景自适应，全面覆盖 `cyber-dark`、`fresh-mint` 和 `dynamic-anime` 主题。
  2. 修改 `src/App.jsx`：优化 `handleGenerateVideo` 逻辑，未填写 API Key 时完全不发送 HTTP 网络请求，直接进行多节点本地模拟渲染；填写 API Key 但遇到 DashScope 返回异常（如 400 Model not exist）时进行友好 Warning 提示并自动切入本地流畅模拟流程；将默认 API 请求 Endpoint 更新为阿里云专属地域域名 `https://llm-ioipmcjm1v2f40ks.cn-beijing.maas.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis`；同步添加 API Key 和 Base URL 的 `localStorage` 变化监听与持久化。
  3. 同步更新 `doc/deployment.md` 等部署说明文档。
* **功能影响范围**:
  提升了视频生成面板在各大主题下的视觉美观度与透亮感，更新了专属 Serverless 地域 Endpoints 提高请求成功率，保障了无 Key 及 API 异常场景下平滑不中断的生成体验。

## [1.6.0] - 2026-07-21

### 1. 新增视觉视频生成界面与阿里 HappyHorse / 万相模型对接控制台
* **需求背景**:
  随着阿里 HappyHorse、通义万相 (Wanx) 等前沿视频生成大模型的发布，用户需要一个能在当前玻璃态 (Glassmorphic) 界面下配置模型参数、输入动效 Prompt 并可视化调度生成与下载 MP4 视频成果的控制台。
* **修改范围**:
  1. 修改 `src/App.jsx`：新增 `video-generator` 顶部导航与界面视图；包含 HappyHorse-1.1-T2V/I2V、wanx2.1-t2v-turbo/plus、cogvideox-5b 等完整模型列表；支持图生视频、文生视频、参考生视频与视频编辑模式；接入预设 Prompt 灵感芯片、分辨率/画幅药丸选择器、视频时长 slider、随机种子器与阿里云 DashScope API Key 设置面板；开发视频渲染进度条与成果库卡片。
  2. 修改 `src/App.css`：新增两栏式视频生成控制台样式，兼容 `cyber-dark`、`fresh-mint` 和 `dynamic-anime` 三套全站主题。
* **功能影响**:
  扩展了项目在 AI 视频领域的创作能力，实现了在本地静态网页中调优阿里云 HappyHorse 与 Wanx 视频生成大模型，大幅提升了多媒体视效创作体验。

### 2. 同步更新全部配套系统文档
* **需求背景**:
  遵循项目规则，保证代码改动与所有配套系统文档（需求文档、部署文档、用户操作文档）的描述完全一致。
* **修改范围**:
  1. 更新 `doc/requirements.md`：新增 3.8 视觉视频生成模块 (Video Generator) 需求规格说明。
  2. 更新 `doc/deployment.md`：新增第 6 节 阿里云 DashScope (HappyHorse / 通义万相) API Key 申请与网页配置指南。
  3. 更新 `doc/user_guide.md`：新增 4.7 视觉视频生成控制台的操作使用说明。
* **功能影响**:
  保证了代码功能与部署、需求、用户文档之间的完全同步与高度一致。

### 3. 优化导航排版与扩展视频编辑与自定义模型支持
* **需求背景**:
  解决顶部导航栏因选项过多导致折行换行的问题，支持用户自主添加任意自定义视频模型，为“视频编辑”场景补充专用的原视频文件上传入口，并将默认示例替换为更加安适沉静的低调视效。
* **修改范围**:
  1. 修改 `src/App.jsx`：从顶栏移除“部署使用说明”Tab，实现导航按钮单行齐平排列；新增“+ 添加模型”动态弹层与 `localStorage` 持久化，允许用户自定义拓展模型 ID；为“视频编辑”模式添加专用的 MP4/WebM 原视频上传框与控制播放器；更新预设 Prompt 气泡与案例卡片为低调风静物与自然景象。
  2. 同步更新 `doc/requirements.md`、`doc/deployment.md` 与 `doc/user_guide.md` 说明。
* **功能影响**:
  解决了导航换行不雅的问题，增强了视频编辑模式在实际工作流中的可用度与通用扩展性。

## [1.5.0] - 2026-07-20

### 1. 调整媒体数据存储架构并迁入 media 目录
* **需求背景**:
  为了理顺项目结构，避免根目录下静态资源散乱，需要将原先存放在 `public/` 根目录下的 `media-data.json` 数据库转移到 `public/media/` 目录下。同时，由于原先 `public/media` 采用软链接，需要恢复为普通物理文件夹，以保证本地静态资源的无缝预览和完整归档。
* **修改范围**:
  1. 移动及生成 `media-data.json` 至 `public/media/media-data.json`。
  2. 修改 `scan-media.js` 脚本的输出路径为 `public/media/media-data.json`。
  3. 修改 `src/App.jsx` 前台 fetch 请求路径，由 `/media-data.json` 改为 `/media/media-data.json`。
* **功能影响**:
  项目目录结构更具自洽性，所有媒体资源及对应的描述数据库全部归总于 `media` 目录下，为后续静态打包及多环境分发提供了更清晰的结构保障。

### 2. 移除二进制扫描打包 bin 目录及相关脚本
* **需求背景**:
  先前构建 Windows & macOS 可执行程序的 pkg 二进制依赖增加了项目无谓的体积与黑盒逻辑，并不符合静态轻量级网页的设计理念。用户希望移除 `bin/` 可执行程序及其相关的复杂脚本，全量回归原生的 Node.js 脚本扫描流程。
* **修改范围**:
  1. 彻底删除 `bin/` 文件夹及其中包含的 Windows/macOS 二进制文件。
  2. 删除 `package.json` 内的 `"build:bin"` 脚本。
  3. 修改配套文档（`README.md`、`doc/deployment.md`、`doc/user_guide.md` 和 `doc/requirements.md`），删除所有二进制可执行文件的使用指引，更新为原生的 `npm run scan` 命令行模式。
* **功能影响**:
  简化了项目的依赖结构与工作流，减少了二进制文件的打包冗余，显著提升了项目的易维护性与开源合规安全性。

### 3. 实现数据库缺失检查提示与极速导入缓存模式
* **需求背景**:
  转移数据库文件后，为了避免新用户克隆或切换目录未进行首次扫描导致页面空白，前台在加载或切换目录失败时需要给出友好的中文提示引导用户。同时，当前端进行本地文件夹导入时，如果目录下已存在 `media-data.json`，希望能够直接读取并开启极速导入，而无需全量在浏览器端二次解密元数据。
* **修改范围**:
  1. 在 `src/App.jsx` 初始化与重新加载默认库的 catch 回调中，新增 Toast 提示，引导用户执行 `npm run scan` 同步生成数据库。
  2. 扩展前端导入流程 `handleImportDirectory`，在选定目录下检测是否存在 `media-data.json`；若存在，自动反序列化缓存并透传给 `scanLocalDirectory`，跳过图片元数据的解密，开启极速加载；若不存在，给出友情警告并采用浏览器端实时解析。
  3. 支持 Toast 针对不同类型（`success` / `error` / `warning`）呈现不同的 Lucide 状态图标与微动效。
* **功能影响**:
  强化了网站的容错性与健壮性，同时在极大加速大目录本地导入速度的同时，给用户带来了更加直观和可预期的交互状态反馈。

## [1.4.0] - 2026-07-19

### 1. 新增 AI 自然语言提示词大师 (AI Prompt Master) 模块
* **需求背景**:
  前沿图像生成大模型（如 Z-Image、Flux.1、SD3、Midjourney 等）具备极强的自然语义理解能力，不再依赖传统的 comma-separated (逗号分隔) 标签，而是需要用连贯、富有创意的段落式英语描述。用户需要一个能对接本地或云端大模型接口的助手，智能地将简单画脑洞扩充为富含细节的英文提示词。
* **修改范围**:
  1. 修改 `src/App.jsx`，新增 “AI 提示词大师” 主 Tab。
  2. 实现本地/云端大语言模型 API 连接配置面板，支持 Ollama (本地)、DeepSeek、OpenAI 及自定义兼容 API 服务商配置与 localStorage 本地持久化。
  3. 新增大模型“接口连线测试”状态反馈。
  4. 声明艺术风格、构图视角、光影氛围三大维度的参数化选择卡片及英文 Prompt 注入项。
  5. 编写大模型 API 调用、段落文本生成和 JSON 级联解析逻辑，同时附带详细的本地 Ollama 故障排错排障帮助文本。
  6. 修改 `src/App.css`，为 AI 提示词大师的主体栅格、接口配置折叠抽屉、参数点选药丸与 Loading 动态发光骨架屏等进行全方位样式修饰，并在三套主题下进行完美自适应开发。
* **功能影响**:
  完成了从 Danbooru 传统标签生成器到现代 AI 自然语言提示词生成器的跨越。用户可极速在本地借助大模型，完成创意细节扩充与艺术修饰，生成高画质、多风格的生图描述，大幅提升 Flux/Z-Image/Midjourney 创作者的工作流品质。

## [1.3.0] - 2026-07-19

### 1. 新增提示词生成器“灵感与多风格随机推荐”面板
* **需求背景**:
  创作者在构建 AI 生图 Prompt 时常常面临“冷启动”困难（缺少创意灵感）或者人工排重、过滤冲突标签心智负担较重的问题。需要一套能够基于本地庞大提示词标签库进行智能关联、冲突排除并级联展开暴露度标签的风格化随机推荐引擎。
* **修改范围**:
  1. 修改 `src/App.jsx`，编写 `handleRandomGenerate(activeStyleKey)` 智能推荐与校验算法，注入 12 种不同生图风格（动漫、写实、赛博朋克、奇幻、国风、科幻、田园、多人、限制级等）的特有种子标签组合，并开发属性黑名单过滤（如多人合照自动剔除 `1boy` 等单人标签，二次元过滤写实标签）与 `Nudity` 标签级联拓展逻辑。
  2. 修改 `src/App.jsx` 前台，在 Prompt Builder 顶部新增多风格气泡随机按钮面板，增加 Toast 提示与选中状态标记。
  3. 修改 `src/App.css`，为 12 种生图风格按钮匹配对应的渐变色、微动效和响应式布局。
* **功能影响**:
  极大提升了创作者构建创意提示词的效率。一键即可生成符合特定生图审美且完全不冲突的高画质 Prompt，同时支持在前台在此基础上做精细化二次微调（权重与顺序），激发无限创作潜力。

### 2. 优化本地媒体目录绑定方式为软链接 (Symlink)
* **需求背景**:
  之前项目绑定本地 ComfyUI 输出文件夹时采用直接读取或拷贝，对用户本地磁盘空间产生负担且不利于实时多媒体资源的扫描同步。
* **修改范围**:
  1. 更新 `scan-media.js` 及 CLI 流程，首次运行或切换目录时自动建立从项目 `public/media` 到用户任意选定输出路径的软链接 (Junction)。
  2. 修复文档，将文档中所有原有的 images 绑定说明升级并修正为 `media` 软链接的结构与机制。
* **功能影响**:
  实现零磁盘空间占用即可快速渲染全量媒体库，并无缝同步最新的视频、音频和图片资源，极大降低了本地部署成本和数据延迟。

## [1.2.2] - 2026-07-17

### 1. 实现全站分类名称的中英文双语对照显示
* **需求背景**:
  原画廊中，分类（如 `cyberpunk`, `nature`）及提示词生成器 sidebar 分类名称虽然通过 static JSON 数据进行了部分汉化，但展示不够统一。画廊媒体库仅显示了英文目录名，而提示词生成器仅显示了中文。用户希望在所有涉及分类展示的界面上均能直观看到中英文双语名称，以便于查找和心智对照。
* **修改范围**:
  1. 修改 `src/App.jsx`：
     - 新增 `mediaCategoryTranslations` 映射字典与 `getMediaCategoryDisplayName` 双语转换辅助函数，支持对默认分类（赛博朋克、自然、奇幻、视频、音频、测试等）的中英文转换。
     - 更新首页分类预览卡片、画廊切换 Tab 栏、画廊卡片上的分类徽章、媒体详情弹窗以及提示词生成器的侧边栏、搜索框 placeholder、已选标签分类标签等位置的渲染逻辑，全部统一为中英文双语格式展示（如 `赛博朋克 (Cyberpunk)` 或 `饰品/配饰 (Accessory)`）。
  2. 修改 `src/index.css`：
     - 为 `.category-video`、`.category-vedio` 和 `.category-audio` 徽章新增配套的霓虹发光与磨砂彩色样式，使多媒体类别徽章在前台页面表现更具视觉质感。
  3. 更新配套文档：同步修缮了 `doc/requirements.md` (需求文档) 与 `doc/user_guide.md` (用户使用文档)。
* **功能影响**:
  统一了全站所有分类名称的视觉呈现，中英文双向显示直观清晰，大幅改善了跨文化 and 多语种环境下的用户浏览及提示词构建心智对照体验。

### 2. 优化提示词生成器翻译规则与混合匹配回退机制
* **需求背景**:
  虽然有庞大的 `zh-CN.csv` 和前版规则引擎，但部分长标签（例如气象类 `Sultry_Weather`、`Tsunami_Weather`）因包含生僻单词，原规则引擎只要有任一单词未被翻译即放弃整句，直接退回英文。用户希望优化翻译逻辑，能够只翻译能识别的基词，并补充气象等基词字典。
* **修改范围**:
  1. 修改 `build-tags.js`：
     - 在基词字典 `vocab` 中扩充气象与气候类常用基础词汇（如 `sultry` -> 闷热, `tsunami` -> 海啸, `vortex` -> 涡旋 等）。
     - 重构 `translateTag` 的下划线词组翻译流程：若检测到非全匹配但包含至少一个可识别基词，则只翻译能看懂的单词，未翻译的单词保持英文原样，并按自适应拼合方式输出（如 `glaze 天气`），而非直接放弃返回 `null`。
  2. 运行 `npm run scan`：重新编译并翻译生成了全套的本地提示词库数据库 `public/tag-data.json`，提升了分类中英文的翻译覆盖率。
* **功能影响**:
  极大提高了生僻长标签和复合短语的翻译覆盖率，即使无法完全匹配，也能够通过混合翻译提供关键的中文词义线索，改善用户的编写与查找体验。

### 3. 合并全量本地化翻译字典，实现画师与版权大类的双语汉化及规范格式化
* **需求背景**:
  用户提供了更庞大、包含超 15 万词条的社区翻译词典 `zh_CN2.csv`，需要将其与原有精细调整的 `zh-CN.csv` 合并为一个总字典。同时，画师（Artist）和作品版权（Copyright）库由于缺乏完整翻译，原先呈现下划线蛇形英文（如 `hiiragi_syuu`），需要支持 Title Case 格式化与高频词汉化。
* **修改范围**:
  1. 融合两个翻译字典：采用原版 `zh-CN.csv` 优先覆盖重复项的原则，将 `zh_CN2.csv` 与 `zh-CN.csv` 融合，生成去重并按首字母排序的 15.4 万词条终版 `tag/zh-CN.csv`，并删除了多余的 `zh_CN2.csv`。
  2. 修改 `build-tags.js`：
     - 引入了 `formatTitleCase` 辅助函数将蛇形词条转换为标准的驼峰 Title Case 格式（如 `Hiiragi Syuu`）。
     - 增加热门对照字典，使常用画师和主流 IP 呈现为 `中文 (English)` 格式，其余则规范展示驼峰英文名。
  3. 运行 `npm run scan` 重新扫描生成了覆盖率极高的提示词数据库 `public/tag-data.json`。
* **功能影响**:
  完成了超大翻译词库的完整融合，实现了全大类（尤其是画师和版权库）的高质量混合双语展示，避免了英文下划线的不雅外观，极大地提高了检索和对照体验。

## [1.2.1] - 2026-07-16

### 1. 优化 Danbooru 提示词本地化翻译机制与规则引擎
* **需求背景**:
  原翻译引擎主要依赖完整的静态字典匹配和简单的下划线拆分，对于某些带特定领域后缀的标签（如视角、天气、面料、情绪、纹身等）和年龄描述（如 `12_years_old`）的自动翻译覆盖度不足，导致大量专业或特定描述词退回纯英文，降低了中文搜索与阅读体验。
* **修改范围**:
  1. 修改 `build-tags.js`，引入基词（`vocab`）及静态词典精简转换函数 `getShortTranslation`。
  2. 新增年龄模式正则规则（`^(\d+)_years?_old$` -> `$1岁`）。
  3. 新增针对 20 种特定分类后缀（如 `_theme`、`_animal`、`_creature`、`_environment`、`_lighting` 等）的自动拆分拼装逻辑。
  4. 扩充 perspectives, age, fabric, seasons, nationalities 等维度的内置基词映射表，并清洗数据中的多余符号与括号内容。
* **功能影响**:
  显著提升了提示词库的本地化翻译覆盖率。在不破坏原有功能的基础上，使大批生僻复合标签、视角与年龄标签具备了准确顺畅的双语对照翻译，优化了前台中文模糊检索体验。

## [1.2.0] - 2026-07-16

### 1. 新增 Danbooru 提示词生成器模块 (Prompt Generator)
* **需求背景**:
  Pony XL/V6 和 Illustrious XL 大模型对提示词的画质词、评级标签格式以及放置顺序有极其独特的要求（如 Pony 偏向 score_9 起手，Illustrious 建议角色标签置前、质量词置后）。人工编写容易遗漏或排版错误，需要一个可视化的 Danbooru 标签管理和 Prompt 构建生成工具。
* **修改范围**:
  1. 修改 `src/App.jsx`，新增提示词生成器专有状态、模型和分级设定、搜索范围，添加 Danbooru 标签库解析及排重拼接算法。
  2. 新增提示词生成器 Tab 界面，左侧展示 28 个原生分类的菜单与标签胶囊网格，右侧展示已选标签调整区与 Positive/Negative Live 实时预览编辑区。
  3. 支持点击已选标签的加减按钮精细调节权重 (0.1 ~ 2.5) 与移动方向键调整提示词顺序，提供独立防抖复制和 Toast 状态提示。
  4. 修改 `src/App.css`，加入符合系统三套视觉风格（科技暗黑、清新雅致、炫酷动感）的 Prompt 辅助排版样式。
  5. 优化 `package.json` 中的 `npm run scan` 脚本，串联 `build-tags.js` 实现一键更新媒体库及提示词词库的流水线。
  6. 全面更新需求文档 `doc/requirements.md`、用户手册 `doc/user_guide.md` 和部署指南 `doc/deployment.md`。
* **功能影响**:
  在前台实现了与模型相匹配的高画质提示词拼接器，大幅提升了创作者构建 AI 生成指令的开发和拼装效率，多端风格体验完美统一。

### 2. 新增提示词中文本地化翻译与中英双语搜索
* **需求背景**:
  原 Danbooru 提示词生成器仅支持英文标签的查看和检索，对于非英语母语的 AI 艺术创作者，寻找准确的描述词（如服装细节、姿势动作）门槛较高。需要在提示词生成器中引入本地化中文对照，并支持中文检索。
* **修改范围**:
  1. 修改 `build-tags.js`：集成 `byzod/a1111-sd-webui-tagcomplete-CN` 社区翻译字典，并开发“精确匹配 + 下划线常见词汇（`vocab`）切分翻译”的混合翻译引擎，自动下载或加载 `tag/zh-CN.csv` 并将翻译字段打包入 `public/tag-data.json`。
  2. 修改 `src/App.jsx`：支持在标签展示网格和已选 Builder 区域同时展现中英双语对照（如 `long_hair (长发)`）；更新检索过滤算法，实现中英双向检索与匹配。
  3. 更新文档：同步修缮 `doc/requirements.md`、`doc/deployment.md` 及 `doc/user_guide.md`，增加关于中文翻译逻辑、离线构建及操作指令的描述。
* **功能影响**:
  极大降低了非英语创作者的使用门槛。创作者可直接用中文检索所需的 Danbooru 标签，并在前台以中英对照的形式调节提示词权重与顺序，提升了 Prompt 生产效率与体验。

## [1.1.0] - 2026-07-08

### 1. 项目重命名与媒体架构升级
* **需求背景**: 
  随着画廊从单纯的图片展示扩展到支持音频和视频的全面扫描与在线播放，项目需要全局统一术语和目录命名，从“图像展示 (Images)”升级为“多媒体展示 (Media)”。
* **修改范围**: 
  1. 重命名后端扫描脚本 `scan-images.js` 为 `scan-media.js`，重命名公共资源文件夹 `public/images` 为 `public/media`。
  2. 更改数据库索引文件名从 `images-data.json` 到 `media-data.json`。
  3. 更新 `src/App.jsx` 前端组件中的 fetch 请求和部署说明卡片。
  4. 修改 `package.json` 里的运行与打包脚本，并更新 `setup-demo-data.js` 演示数据生成脚本。
  5. 重新构建并打包发布跨平台扫描器可执行程序 (`bin/scanner-win.exe` 和 `bin/scanner-macos`)。
  6. 同步更新全部配套文档（`README.md`、`doc/requirements.md`、`doc/user_guide.md`、`doc/deployment.md`）。
* **功能影响**: 
  统一了全链路的媒体存储和扫描逻辑，扫描输出格式与展示数据流更加规范，用户可在本地媒体文件夹中无缝添加多媒体文件并在画廊内完美预览。

### 2. 修复首页分类预览卡片图片与文本渲染异常
* **需求背景**:
  当本地分类目录（如 `test` 目录）中的媒体文件文件名带有空格或特殊字符，或者分类中包含音视频等非图像媒体文件时，首页的分类卡片由于 CSS 背景图解析错误而无法渲染封面大图，且在浅色主题下文字发白不可见。
* **修改范围**:
  1. 修改 `src/App.jsx`，增加对非 image 类型媒体文件的过滤，仅选择真正的图像类型作为分类封面。
  2. 修复 `src/App.jsx` 中 `backgroundImage` 的 `url()` 未被双引号/单引号包裹的 CSS 语法解析 Bug，添加单引号包裹。
  3. 修改 `src/App.css`，为分类预览卡片 `.cat-preview-card` 添加默认渐变背景作为缺省占位图。
* **功能影响**:
  已彻底解决含空格文件名导致的分类封面图加载失败问题，并优化了非图像媒体类型的占位体验，在各种主题（包括薄荷浅色主题）下渲染均能保持完美的视觉一致性。

### 3. 项目展示品牌与定位重命名为 PromptMedia
* **需求背景**:
  由于项目已扩展至支持音频和视频的全面扫描与在线播放，不再仅仅是纯图片的展示画廊，原品牌名“PromptGallery (分类画廊)”已无法准确涵盖现在的“多媒体展示与播放”定位。
* **修改范围**:
  1. 修改前端主页面 `src/App.jsx` 中的 Logo 品牌名、说明文案及页脚版权信息，将“PromptGallery”升级为“PromptMedia”，“分类画廊”更名为“分类媒体库”。
  2. 更新本地 Node.js 扫描器控制台提示 `scan-media.js` 以及前端应用标题 `index.html`。
  3. 修改配套文档 `README.md`、`doc/requirements.md`、`doc/user_guide.md` 和 `doc/deployment.md` 中所有“PromptGallery”与“分类画廊”字样。
* **功能影响**:
  完成了由图像画廊到多媒体分类库的品牌及定位升级，前端界面和相关文档用语高度一致，产品形象更为专业和准确。

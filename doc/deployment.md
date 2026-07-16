# PromptMedia - 编译部署与上线指南

本指南面向运维及前端开发人员，指导如何将 PromptMedia 媒体库项目编译打包并部署到各类 Web 服务器或托管平台上。

---

## 1. 运行环境要求
- **本地编译环境:** Node.js v18.0.0 或更高版本，npm v9.0.0 或更高版本。
- **目标服务器:** 任何支持托管静态 HTML/JS/CSS 的服务器（如 Nginx, Apache, IIS）或静态托管托管平台（如 Vercel, Netlify, GitHub Pages）。

---

## 2. 本地调试与准备

### 2.1 依赖安装
在项目根目录下执行安装依赖：
```bash
npm install
```

### 2.2 扫描本地图片与提示词词库
在启动调试前，确保您已将至少一个 ComfyUI 生成媒体放置于 `public/media/` 的分类文件夹中，然后执行：
```bash
# 扫描媒体元数据并编译标签库
npm run scan

# 启动 Vite 本地开发服务器
npm run dev
```
> [!NOTE]
> `npm run scan` 执行了两个操作：一是通过 `scan-media.js` 解析媒体元数据生成 `public/media-data.json`；二是通过 `build-tags.js` 读取 `tag/Data/` 目录下的提示词文本，排重汇总后生成 `public/tag-data.json` 用于前台“提示词生成器”使用。
> 若只需单独重新编译提示词库，可以直接运行：
> `node build-tags.js`

> [!TIP]
> `build-tags.js` 运行时若本地不存在 `tag/zh-CN.csv`，将尝试通过网络下载中文翻译对照词库。若处于离线或网络受限环境，脚本将自动忽略并回退到内置词组与拼写翻译引擎的翻译状态，确保构建流水线不中断。新增的词组拆分规则、专有维度基词及特定分类后缀匹配（如 `_theme`, `_animal`, `_weather` 等）均由内置规则引擎处理，无需网络下载即可生成基础翻译。

打开浏览器访问控制台显示的本地地址即可预览网站效果。

---

## 3. 打包与静态编译

执行前端项目编译打包：
```bash
npm run build
```
编译完成后，项目根目录下会生成一个 `dist/` 文件夹。该文件夹包含了网站运行所需的全部纯静态文件：
- `dist/index.html` (主入口)
- `dist/assets/` (合并压缩后的 JS 和 CSS 代码)
- `dist/media-data.json` (被提取的媒体元数据 JSON 库)
- `dist/tag-data.json` (被汇总提取的提示词标签 JSON 库)
- `dist/media/` (原始分类媒体目录)

---

## 4. 部署方案

### 4.1 Nginx 服务器部署 (自建物理机/云服务器)
1. 将 `dist/` 目录下的所有文件上传至服务器对应的网页根目录，例如 `/var/www/imageshow/`。
2. 修改 Nginx 配置文件 (通常为 `nginx.conf` 或虚拟主机配置文件)，添加如下配置项：
   ```nginx
   server {
       listen 80;
       server_name your_domain.com; # 替换您的域名

       root /var/www/imageshow;
       index index.html;

       # 路由解析设置（针对单页面应用）
       location / {
           try_files $uri $uri/ /index.html;
       }

       # 静态资源缓存策略
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp)$ {
           expires 30d;
           add_header Cache-Control "public, no-transform";
       }

       # 对元数据 JSON 禁用强缓存，防止媒体更新后前台不刷新
       location ~* /(media-data|tag-data)\.json$ {
           add_header Cache-Control "no-cache, no-store, must-revalidate";
           expires 0;
       }

       # 开启 Gzip 压缩，提升网络传输速率
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml;
   }
   ```
3. 重新加载 Nginx 配置以生效：
   ```bash
   nginx -s reload
   ```

### 4.2 Vercel 一键云端托管
1. 将本地项目推送至您的 GitHub / GitLab 仓库。
2. 登录 [Vercel 官网](https://vercel.com/)，点击 **Add New Project**。
3. 导入您的仓库，在设置面板中保持默认项即可：
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. 点击 **Deploy**。Vercel 会自动拉取代码，执行 Node.js 扫描脚本（在打包流程中运行）并发布，生成一个公网可访问的 HTTPS 域名。

### 4.3 GitHub Pages 托管
如果您打算将画廊部署在 GitHub 免费静态页面上：
1. 修改 `vite.config.js`，添加 `base` 路径前缀（若您的项目域名是二级目录，例如 `https://username.github.io/imageshow/`）：
   ```javascript
   export default defineConfig({
     plugins: [react()],
     base: '/imageshow/' // 替换为您的仓库名
   })
   ```
2. 安装 `gh-pages` 部署工具：
   ```bash
   npm install gh-pages --save-dev
   ```
3. 在 `package.json` 中的 `scripts` 节点添加：
   ```json
   "predeploy": "npm run scan && npm run build",
   "deploy": "gh-pages -d dist"
   ```
4. 终端执行 `npm run deploy`，脚本会自动完成本地扫描、前端构建、并自动新建并推送到 GitHub 仓库的 `gh-pages` 分支进行发布。

---

## 5. 日常维护建议
- **自动化扫描流水线:** 如果使用 Git 进行协作管理，可以将 `npm run scan` 写在 Git 客户端的 `pre-commit` 钩子中，每次提交代码时自动触发扫描，保障远程静态库数据永远是最新的。
- **打包部署后的免 Node 环境更新**: 为了方便非技术人员在已打包的静态包中进行维护，您可以直接将 `bin/scanner-win.exe` 或 `bin/scanner-macos` 复制到编译出的 `dist/` 文件夹中并双击运行。程序会自动探测环境并在 `dist/media` 进行挂载和重写 `dist/media-data.json`，省去了部署端安装 Node.js 与前端依赖的麻烦。
- **图片尺寸建议:** 建议 ComfyUI 生成图片直接使用 JPG 或经过 WebP 压缩，或在前台展示时采用 WebP 格式，单个图片体积控制在 2MB 以下，从而提供最佳的页面首屏加载和瀑布流滚动流畅度。

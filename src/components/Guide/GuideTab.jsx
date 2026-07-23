import React from 'react';

export function GuideTab() {
  return (
    <div className="guide-tab animate-fade-in">
      <div className="guide-layout">
        {/* Sidebar Checklist */}
        <div className="guide-sidebar glass-panel">
          <h3>📋 目录</h3>
          <ul>
            <li><a href="#req">1. 系统需求与架构</a></li>
            <li><a href="#how-it-works">2. 扫描与渲染原理</a></li>
            <li><a href="#use">3. 使用说明</a></li>
            <li><a href="#metadata">4. ComfyUI 元数据说明</a></li>
            <li><a href="#deploy">5. 部署指南</a></li>
          </ul>
        </div>

        {/* Main Guide Content */}
        <div className="guide-content-wrapper glass-panel">
          <section id="req">
            <h2>1. 系统需求与架构</h2>
            <p>本网站为 <strong>全静态纯前端展示页面</strong>，无需任何数据库或动态后端服务。所有的媒体及其元数据在部署/打包时被一次性解析并生成前端索引文件。</p>
            <ul>
              <li><strong>前端框架:</strong> React 19, Vite 8, Vanilla CSS</li>
              <li><strong>运行环境:</strong> 浏览器支持现代 HTML5, Node.js v16+ (仅用于扫描本地媒体)</li>
              <li><strong>无后端优势:</strong> 零服务器压力，可直接托管至 GitHub Pages、Gitee Pages、Vercel 或本地直接浏览器双击预览。</li>
            </ul>
          </section>

          <hr />

          <section id="how-it-works">
            <h2>2. 扫描与渲染原理</h2>
            <div className="principle-box">
              <p>网站数据流如下：</p>
              <ol>
                <li>用户将 ComfyUI 生成的媒体分类存放在 <code>/public/media/[分类目录]/</code>。</li>
                <li>在根目录执行 <code>npm run scan</code>。</li>
                <li>Node 脚本 <code>scan-media.js</code> 会读取所有子文件夹，解析 PNG Chunks 中的 <code>tEXt/iTXt</code> 字段，或 WebP 的 <code>XMP</code> 属性。</li>
                <li>若媒体被压缩剥离了元数据，脚本会自动检查同名 <code>.json</code> 侧边栏文件。</li>
                <li>脚本生成 <code>public/media-data.json</code> 前端数据库，React 启动后直接 Fetch 该数据并提供搜索、过滤、展示。</li>
              </ol>
            </div>
          </section>

          <hr />

          <section id="use">
            <h2>3. 使用说明</h2>
            <div className="guide-methods-container">

              <div className="guide-method-card glass-panel">
                <div className="method-badge gradient-bg">最简单 (免 Node)</div>
                <h3>📁 方法一：网页前端直连切换 (推荐)</h3>
                <p>直接在网页上操作，无需运行任何脚本或可执行文件：</p>
                <ol>
                  <li>点击顶部导航栏的 <strong>“选择本地目录”</strong> 按钮。</li>
                  <li>在浏览器弹出的文件选择器中，选择您的 ComfyUI <code>output</code> 文件夹（或任何包含分类子目录的媒体文件夹）。</li>
                  <li>在浏览器上方弹出权限询问时，点击 <strong>“允许访问”</strong> 授予只读权限。</li>
                  <li>网页端程序会直接在本地解压缩 PNG/WebP 媒体并提取所有提示词参数，极速载入浏览！</li>
                </ol>
                <p className="note-text"><em>注：因安全限制，刷新页面后需重新选择目录授权。若想永久展示，请使用方法二。</em></p>
              </div>

              <div className="guide-method-card glass-panel">
                <div className="method-badge secondary">双击运行 (便携可执行程序)</div>
                <h3>⚡ 方法二：双击本地可执行程序</h3>
                <p>项目根目录下内置了打包好的无 Node.js 运行时依赖包：</p>
                <ul>
                  <li><strong>Windows:</strong> 双击项目根目录下 <code>bin/scanner-win.exe</code> 运行。</li>
                  <li><strong>macOS:</strong> 在终端执行 <code>bin/scanner-macos</code>（首次如遇权限拦截需在系统设置中允许，或 <code>chmod +x</code> 授权）。</li>
                </ul>
                <ol>
                  <li>首次运行：在弹出的黑框控制台中，<strong>直接拖入您的媒体文件夹</strong>并回车，程序会自动为您创建无占用的软链接绑定。</li>
                  <li>更新目录：未来当您增删媒体时，<strong>只需再次双击它</strong>，数秒内即可自动在后台同步完所有元数据。</li>
                  <li>若要彻底更换绑定目录，可加上参数 <code>--switch</code> 启动，或直接删除项目根目录的 <code>directory-config.json</code>。</li>
                </ol>
              </div>

              <div className="guide-method-card glass-panel">
                <div className="method-badge outline">开发者模式</div>
                <h3>🛠️ 方法三：常规 Node.js 命令扫描</h3>
                <p>适合前端开发与部署流程：</p>
                <ol>
                  <li>将您的 ComfyUI 外部媒体文件夹挂载到 <code>/public/media/</code> (支持直接在 media 目录下新建子文件夹来分类)。</li>
                  <li>在项目根目录下执行命令行：<code>npm run scan</code>。</li>
                  <li>扫描完成后，执行 <code>npm run dev</code> 启动本地预览，或执行 <code>npm run build</code> 构建平铺静态包。</li>
                </ol>
              </div>

            </div>
          </section>

          <hr />

          <section id="metadata">
            <h2>4. ComfyUI 元数据解析机制</h2>
            <p>ComfyUI 将其工作流及生成节点配置以下列格式存储在媒体中：</p>
            <ul>
              <li><strong>PNG 格式:</strong> 存储在二进制头部的 <code>tEXt</code> 文本区块中，关键字为 <code>prompt</code> (生成图 graph API) 和 <code>workflow</code> (前端 UI 连线图)。</li>
              <li><strong>WebP 格式:</strong> 存储在 RIFF 块的 <code>XMP </code> 元数据段，以 XML 标签包含属性 <code>comfyui:prompt</code> 及 <code>comfyui:workflow</code>。</li>
            </ul>
            <p>本项目的扫描引擎会自动解析上述区块，并智能提取 <code>KSampler</code> 节点相连的输入节点，过滤正向/负向提示词，提取 Seed、采样器、步数等核心生成参数，极其直观。</p>
          </section>

          <hr />

          <section id="deploy">
            <h2>5. 静态部署与平铺包分发指南</h2>
            <p>由于本项目为完全零后端架构，极易部署和打包分享：</p>

            <div className="deploy-method">
              <h3>📦 1. 离线平铺分发包 (适合免 Node 发送给他人使用)</h3>
              <ol>
                <li>在开发根目录下执行打包命令：<code>npm run build</code></li>
                <li>编译产物保存在 <code>dist/</code> 目录下。</li>
                <li><strong>打包免 Node 运行环境</strong>：将项目中的 <code>bin/scanner-win.exe</code> 复制到 <code>dist/</code> 文件夹下，然后将整个 <code>dist/</code> 文件夹打包发送给他人。</li>
                <li><strong>使用方法</strong>：他人解压后，双击 <code>dist/</code> 中的 <code>scanner-win.exe</code>，程序会自动检测到处于打包平铺环境，并在 <code>dist/media</code> 创建软链接并实时写出 <code>dist/media-data.json</code>。使用 Live Server 容器或静态 web 服务器启动即可脱离 Node 环境使用！</li>
              </ol>
            </div>

            <div className="deploy-method" style={{ marginTop: '1.5rem' }}>
              <h3>🚀 2. Vercel / Netlify 线上部署</h3>
              <ol>
                <li>将您的 PromptMedia 仓库推送至您的 GitHub 账号下。</li>
                <li>在 Vercel 或 Netlify 仪表盘中，点击“新建项目”并选择您的 GitHub 仓库。</li>
                <li>构建指令（Build Command）填写：<code>npm run build</code>。</li>
                <li>打包目录（Output Directory）填写：<code>dist</code>。</li>
                <li>点击部署，您的 AI 提示词分类媒体库就会立刻全球上线！</li>
              </ol>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

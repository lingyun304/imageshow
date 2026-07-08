# 变更记录

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

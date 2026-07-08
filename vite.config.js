import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    //host: '0.0.0.0', // 0.0.0.0，允许本机所有网络接口及 IP 访问 (包括 127.0.0.1 和局域网 IP)
    fs: {
      strict: false // 允许 Vite 访问和读取项目外的软链接目录文件 (如 ComfyUI 的外部输出文件夹)
    }
  }
})

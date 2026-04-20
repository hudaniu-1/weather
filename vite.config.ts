import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // 默认写在 node_modules/.vite，在 Windows 上易被杀毒/同步盘占用导致 “Access is denied”
  cacheDir: 'vite-cache',
  plugins: [react()],
})

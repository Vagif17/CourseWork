import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5243',
        changeOrigin: true,
        secure: false
      },
      '/hubs': {
        target: 'http://127.0.0.1:5243',
        ws: true,
        changeOrigin: true,
        secure: false
      },
      '/Uploads': {
        target: 'http://127.0.0.1:5243',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
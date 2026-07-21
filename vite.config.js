import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const TARGET_URL = process.env.VITE_API_URL || 'https://arogyax-server.vercel.app';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/employee-auth': {
        target: TARGET_URL,
        changeOrigin: true,
        secure: false
      },
      '/admin': {
        target: TARGET_URL,
        changeOrigin: true,
        secure: false
      },
      '/manager': {
        target: TARGET_URL,
        changeOrigin: true,
        secure: false
      },
      '/org': {
        target: TARGET_URL,
        changeOrigin: true,
        secure: false
      },
      '/auth': {
        target: TARGET_URL,
        changeOrigin: true,
        secure: false
      },
      '/user': {
        target: TARGET_URL,
        changeOrigin: true,
        secure: false
      },
      '/medicines': {
        target: TARGET_URL,
        changeOrigin: true,
        secure: false
      },
      '/prescriptions': {
        target: TARGET_URL,
        changeOrigin: true,
        secure: false
      },
      '/appointments': {
        target: TARGET_URL,
        changeOrigin: true,
        secure: false
      },
      '/pharmacy': {
        target: TARGET_URL,
        changeOrigin: true,
        secure: false
      },
      '/health': {
        target: TARGET_URL,
        changeOrigin: true,
        secure: false
      }
    }
  }
})

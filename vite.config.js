import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/employee-auth': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false
      },
      '/admin': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false
      },
      '/manager': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false
      },
      '/org': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false
      },
      '/auth': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false
      },
      '/user': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false
      },
      '/medicines': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false
      },
      '/prescriptions': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false
      },
      '/health': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

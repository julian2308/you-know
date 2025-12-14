import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    minify: false,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendors': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendors': ['@mui/material', '@mui/icons-material'],
          'recharts': ['recharts'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    hmr: {
      host: 'localhost',
      port: 5173,
    },
  },
})

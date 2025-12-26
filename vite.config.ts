import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy API requests to backend during development
      '/api': {
        target: 'https://backend-onlytrack.cameron.bonsigne.dev-campus.fr',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost', // Réécrire le domaine des cookies pour localhost
      },
    },
  },
  build: {
    outDir: 'dist',
  },
})

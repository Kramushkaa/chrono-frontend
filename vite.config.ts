import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths()
  ],
  resolve: {
    alias: {
      // Alias with @ prefix
      '@app': path.resolve(__dirname, './src/app'),
      '@features': path.resolve(__dirname, './src/features'),
      '@shared': path.resolve(__dirname, './src/shared'),
      // Alias without @ prefix for imports like 'shared/api/api'
      'shared': path.resolve(__dirname, './src/shared'),
      'features': path.resolve(__dirname, './src/features'),
      'app': path.resolve(__dirname, './src/app'),
    }
  },
  server: {
    port: 3000,
    open: true,
    host: true
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-helmet': ['react-helmet-async']
        }
      }
    }
  },
  envPrefix: 'VITE_',
  // Настройка для совместимости с некоторыми зависимостями
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})


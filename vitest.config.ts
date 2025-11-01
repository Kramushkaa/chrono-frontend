import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: [
          'src/shared/**/*.{ts,tsx}',
          'src/features/**/*.{ts,tsx}',
        ],
        exclude: [
          'src/**/*.d.ts',
          'src/**/index.ts',
          'src/**/__tests__/**',
          'src/**/node_modules/**',
        ],
        thresholds: {
          lines: 30,
          functions: 30,
          branches: 30,
          statements: 30,
        },
      },
      include: [
        'src/**/__tests__/**/*.{test,spec}.{ts,tsx}',
        'src/**/*.{test,spec}.{ts,tsx}',
      ],
      exclude: [
        'node_modules',
        'build',
        'dist',
      ],
    },
  })
)


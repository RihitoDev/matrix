import path from 'path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
setupFiles: ['./vitest.setup.ts'],
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/app/layout.tsx', '**/*.test.{ts,tsx}', 'src/lib/utils.ts', 'src/components/ui/card/index.ts', 'src/components/ui/select.tsx', 'src/modules/vacancies/components/information-step.tsx',],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
})

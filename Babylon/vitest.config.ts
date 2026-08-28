import { defineConfig } from 'vitest/config'

export default defineConfig({
  cacheDir: '../node_modules/.vite/vitest-babylon',
  test: {
    include: ['src/tests/**/*.test.ts'],
    globals: true,
    environment: 'node',
  },
})

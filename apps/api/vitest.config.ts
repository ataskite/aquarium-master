import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/test-setup.ts'],
    include: ['src/**/*.test.ts'],
    exclude: ['dist/**', 'node_modules/**'],
    testTimeout: 30000,
    hookTimeout: 30000,
    // Integration tests share a single database; run files sequentially to
    // avoid cross-file cleanDatabase interference.
    fileParallelism: false,
  },
});

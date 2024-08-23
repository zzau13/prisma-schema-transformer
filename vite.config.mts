import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      reporter: ['json', 'text-summary'],
      extension: ['mts'],
      exclude: ['bin.mts', 'test'],
    },
  },
});

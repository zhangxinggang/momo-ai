import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    passWithNoTests: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@renderer': path.resolve(__dirname, 'src/renderer'),
      '@preload': path.resolve(__dirname, 'src/preload'),
      '~~': path.resolve(__dirname, '../../packages/momo-markdown/src'),
      '~': path.resolve(__dirname, '../../packages/momo-markdown/src/components/MdEditor'),
    },
  },
});

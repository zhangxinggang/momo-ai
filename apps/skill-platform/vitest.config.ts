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
      '@momo/agent-contracts': path.resolve(
        __dirname,
        '../../packages/momo-agent-contracts/src/index.ts',
      ),
      '@momo/harness-adapter': path.resolve(
        __dirname,
        '../../packages/momo-harness-adapter/src/index.ts',
      ),
      '@preload': path.resolve(__dirname, 'src/preload'),
      '~~': path.resolve(__dirname, '../../packages/momo-markdown/src'),
      '~': path.resolve(__dirname, '../../packages/momo-markdown/src/components/MdEditor'),
    },
  },
});

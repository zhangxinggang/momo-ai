import { FlatCompat } from '@eslint/eslintrc';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** 与根目录 .eslintrc.cjs 一致：extends @umijs/fabric/dist/eslint */
export default [
  {
    ignores: [
      'dist/**',
      'release/**',
      'node_modules/**',
      'coverage/**',
      'website/**',
      'src/renderer/dist/**',
      '**/*.d.ts',
      '**/*.js',
      '*.tsbuildinfo',
    ],
  },
  ...compat.extends(require.resolve('@umijs/fabric/dist/eslint')),
];

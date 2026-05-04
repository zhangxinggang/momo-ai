import { builtinModules } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import packageJson from './package.json';
import { buildRollupInput } from './scripts/discover-rollup-input';

const packageRoot = dirname(fileURLToPath(import.meta.url));
const nodeBuiltins = new Set(
  builtinModules.flatMap((moduleName) => [moduleName, `node:${moduleName}`]),
);
const dependencyNames = Object.keys(packageJson.dependencies || {});
const srcRoot = resolve(packageRoot, 'src').replace(/\\/g, '/');
const distRoot = resolve(packageRoot, 'dist');

function isExternalDependency(source: string): boolean {
  if (nodeBuiltins.has(source) || source.startsWith('node:')) {
    return true;
  }

  return dependencyNames.some(
    (dependency) => source === dependency || source.startsWith(`${dependency}/`),
  );
}

function isExternalId(source: string): boolean {
  const normalizedSource = source.replace(/\\/g, '/');
  if (normalizedSource.startsWith(srcRoot)) {
    return false;
  }
  if (source.startsWith('.')) {
    return false;
  }
  return isExternalDependency(source);
}

/** 与 src 目录一致的输出，便于 __dirname / requireAlias 等运行时路径解析 */
const preserveModulesOutput = {
  preserveModules: true,
  preserveModulesRoot: srcRoot,
};

export default defineConfig({
  build: {
    ssr: true,
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    target: 'node20',
    minify: false,
    rollupOptions: {
      input: buildRollupInput(packageRoot),
      external: isExternalId,
      output: [
        {
          format: 'es',
          dir: distRoot,
          ...preserveModulesOutput,
          entryFileNames: '[name].mjs',
          chunkFileNames: '[name].mjs',
        },
        {
          format: 'cjs',
          dir: distRoot,
          ...preserveModulesOutput,
          entryFileNames: '[name].cjs',
          chunkFileNames: '[name].cjs',
        },
      ],
    },
  },
});

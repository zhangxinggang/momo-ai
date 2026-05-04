import { builtinModules } from 'node:module';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import packageJson from './package.json';

const nodeBuiltins = new Set(
  builtinModules.flatMap((moduleName) => [moduleName, `node:${moduleName}`]),
);
const dependencyNames = Object.keys(packageJson.dependencies || {});
/** 运行时由 Electron 提供，禁止打进 bundle */
const runtimeExternals = ['electron'];
const srcRoot = resolve(__dirname, 'src').replace(/\\/g, '/');
const outDir = resolve(__dirname, 'dist/src');

function isExternalDependency(source: string): boolean {
  if (nodeBuiltins.has(source) || source.startsWith('node:')) {
    return true;
  }

  return dependencyNames.some(
    (dependency) => source === dependency || source.startsWith(`${dependency}/`),
  );
}

function externalId(source: string): boolean {
  const normalizedSource = source.replace(/\\/g, '/');
  if (normalizedSource.startsWith(srcRoot)) {
    return false;
  }
  if (source.startsWith('.')) {
    return false;
  }
  if (runtimeExternals.some((name) => source === name || source.startsWith(`${name}/`))) {
    return true;
  }
  return isExternalDependency(source);
}

const mainEntries = {
  index: resolve(__dirname, 'src/index.ts'),
  'main/dev': resolve(__dirname, 'src/main/dev.ts'),
  'main/index': resolve(__dirname, 'src/main/index.ts'),
  'preload/index': resolve(__dirname, 'src/preload/index.ts'),
};

export default defineConfig({
  build: {
    outDir,
    emptyOutDir: true,
    sourcemap: true,
    target: 'node20',
    lib: {
      entry: mainEntries,
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        // es -> .js 便于 import；cjs -> .cjs 便于 require
        const suffix = format === 'es' ? 'js' : 'cjs';
        return `${entryName}.${suffix}`;
      },
    },
    rollupOptions: {
      external: externalId,
    },
  },
});

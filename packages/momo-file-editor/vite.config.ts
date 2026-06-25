import react from '@vitejs/plugin-react';
import { builtinModules } from 'node:module';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const packageRoot = resolve(import.meta.dirname);
const nodeBuiltins = new Set(
  builtinModules.flatMap((moduleName) => [moduleName, `node:${moduleName}`]),
);

const runtimeExternals = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'antd',
  '@momo/markdown',
  '@momo/markdown-styles',
  '@file-viewer/react',
  '@file-viewer/preset-all',
  'lucide-react',
  'codemirror',
];

function isExternalId(source: string): boolean {
  if (nodeBuiltins.has(source) || source.startsWith('node:')) {
    return true;
  }
  if (source.startsWith('.') || source.startsWith('/')) {
    return false;
  }
  if (source.startsWith('@codemirror/') || source.startsWith('@lezer/')) {
    return true;
  }
  if (source.startsWith('@ant-design/')) {
    return true;
  }
  return runtimeExternals.some(
    (dependency) => source === dependency || source.startsWith(`${dependency}/`),
  );
}

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    lib: {
      entry: {
        index: resolve(packageRoot, 'src/index.ts'),
        node: resolve(packageRoot, 'src/node.ts'),
      },
      formats: ['es'],
      fileName: (format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: isExternalId,
      treeshake: {
        moduleSideEffects(id) {
          return id.includes('.less') || id.includes('.css');
        },
      },
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'index.css') {
            return 'index.css';
          }
          return 'assets/[name][extname]';
        },
      },
    },
    cssCodeSplit: false,
  },
});

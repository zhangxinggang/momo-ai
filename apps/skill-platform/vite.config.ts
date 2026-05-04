import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type PluginOption } from 'vite';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';

/** 主进程 native / 运行时动态依赖，禁止打进 bundle */
const MAIN_PROCESS_EXTERNALS = [
  'better-sqlite3',
  'typeorm',
  'reflect-metadata',
  'electron',
  'log4js',
  '@log4js-node/smtp',
  '@napi-rs/canvas',
  'pdf-parse',
];

function isMainProcessExternal(id: string): boolean {
  if (id.includes('@napi-rs/canvas')) {
    return true;
  }
  return MAIN_PROCESS_EXTERNALS.some((name) => id === name || id.startsWith(`${name}/`));
}

/** antd 6 ESM 顶部的 "use client" 在 Rollup 打包时会刷屏告警，预处理后移除 */
function stripUseClientDirective(): PluginOption {
  return {
    name: 'strip-use-client-directive',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('node_modules') || !/\buse client\b/.test(code)) {
        return null;
      }
      const stripped = code.replace(/^\s*['"]use client['"];?\s*\r?\n?/gm, '');
      return stripped === code ? null : { code: stripped, map: null };
    },
  };
}

function suppressModuleLevelDirectiveWarn(): PluginOption {
  return {
    name: 'suppress-module-level-directive-warn',
    config() {
      return {
        build: {
          rollupOptions: {
            onwarn(warning, defaultHandler) {
              if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
                return;
              }
              defaultHandler(warning);
            },
          },
        },
      };
    },
  };
}

const sharedResolveAlias = {
  '@': path.resolve(__dirname, 'src'),
  '@renderer': path.resolve(__dirname, 'src/renderer'),
  '@preload': path.resolve(__dirname, 'src/preload/index.ts'),
  '@preload/api': path.resolve(__dirname, 'src/preload/api'),
  '@momo/electron': path.resolve(__dirname, '../electron/src/index.ts'),
};

export default defineConfig({
  plugins: [
    stripUseClientDirective(),
    suppressModuleLevelDirectiveWarn(),
    react(),
    electron([
      {
        entry: 'src/main/index.ts',
        onstart(args) {
          // Start Electron, vite-plugin-electron will auto-set VITE_DEV_SERVER_URL
          // 启动 Electron，vite-plugin-electron 会自动设置 VITE_DEV_SERVER_URL
          // Override default argv to remove "--no-sandbox" which causes
          // "不支持的资源类型: --no-sandbox" on macOS with Electron 33.
          // The default startup() uses [".", "--no-sandbox"] but --no-sandbox
          // is a Linux-only Chromium flag and unnecessary on macOS/Windows.
          // 覆盖默认 argv，移除 "--no-sandbox" 参数。该参数仅适用于 Linux，
          // 在 macOS/Windows 上会导致 Electron 启动失败。
          args.startup(['.']);
        },
        vite: {
          resolve: {
            alias: sharedResolveAlias,
          },
          build: {
            outDir: 'out/main',
            rollupOptions: {
              // log4js 在运行时用动态 require 加载 @log4js-node/smtp 等 appender，
              // @napi-rs/canvas 含 .node 原生模块，须整包外置由 Node 运行时加载。
              external: isMainProcessExternal,
              onwarn(warning, defaultHandler) {
                if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
                  return;
                }
                defaultHandler(warning);
              },
            },
          },
        },
      },
      {
        entry: 'src/preload/index.ts',
        onstart(args) {
          args.reload();
        },
        vite: {
          resolve: {
            alias: sharedResolveAlias,
          },
          build: {
            outDir: 'out/preload',
          },
        },
      },
    ]) as PluginOption[],
    renderer() as PluginOption,
  ],
  resolve: {
    alias: {
      ...sharedResolveAlias,
      '@momo/aichat': path.resolve(__dirname, '../../packages/momo-aichat/src/index.ts'),
      '@momo/knowledge': path.resolve(__dirname, '../../packages/momo-knowledge/src/index.ts'),
      '@momo/aichat/styles.css': path.resolve(
        __dirname,
        '../../packages/momo-aichat/src/styles/chat.css',
      ),
      '@momo/workflow': path.resolve(__dirname, '../../packages/momo-workflow/src/index.ts'),
      '@momo/file-editor': path.resolve(__dirname, '../../packages/momo-file-editor/src/index.ts'),
      '@momo/tree': path.resolve(__dirname, '../../packages/momo-tree/src/index.ts'),
      // 须先于 @momo/markdown，否则 @momo/markdown/src/... 会被错误归到主入口
      '@momo/markdown/src': path.resolve(__dirname, '../../packages/momo-markdown/src'),
      '@momo/markdown': path.resolve(__dirname, '../../packages/momo-markdown/src/index.ts'),
      '@momo/markdown-styles': path.resolve(
        __dirname,
        '../../packages/momo-markdown/src/components/MdEditor/styles/style.less',
      ),
      '~': path.resolve(__dirname, '../../packages/momo-markdown/src/components/MdEditor'),
      '~~': path.resolve(__dirname, '../../packages/momo-markdown/src'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  optimizeDeps: {
    include: ['fflate'],
  },
  build: {
    outDir: 'out/renderer',
    // Performance: Disable sourcemap in production to reduce bundle size
    // 性能：生产环境禁用 sourcemap 以减少打包体积
    sourcemap: process.env.NODE_ENV === 'development',
    rollupOptions: {
      output: {
        // Manual chunks for better code splitting and caching
        // 手动分块以获得更好的代码分割和缓存
        manualChunks: {
          // Core React libraries
          // React 核心库
          'react-vendor': ['react', 'react-dom'],
          // UI/Animation libraries
          // UI/动画库
          'ui-vendor': ['framer-motion', 'antd', '@ant-design/icons'],
          // Markdown rendering (@momo/markdown)
          'markdown-vendor': ['@momo/markdown'],
          'markdown-it-vendor': ['markdown-it', 'markdown-it-mermaid', 'mermaid'],
          // Icon library (large)
          // 图标库（较大）
          icons: ['lucide-react'],
        },
      },
    },
  },
});

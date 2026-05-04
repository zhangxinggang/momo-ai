import react from '@vitejs/plugin-react';
import { rmSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { build, LibraryFormats } from 'vite';
import { buildType } from './build.type';

const __dirname = fileURLToPath(new URL('..', import.meta.url));
const resolvePath = (p: string) => path.resolve(__dirname, p);

void (async () => {
  const moduleEntry = {
    index: resolvePath('src'),
    MdEditor: resolvePath('src/components/MdEditor'),
    MdPreview: resolvePath('src/components/MdPreview'),
    NormalToolbar: resolvePath('src/components/NormalToolbar'),
    DropdownToolbar: resolvePath('src/components/DropdownToolbar'),
    ModalToolbar: resolvePath('src/components/ModalToolbar'),
    MdCatalog: resolvePath('src/components/MdCatalog'),
    MdModal: resolvePath('src/components/MdEditor/components/Modal'),
    config: resolvePath('src/config'),
  };

  const entries: Array<[LibraryFormats, any]> = [
    [
      'es',
      {
        ...moduleEntry,
        // 这里只有利用vite构建的assetFileNames为文件名的特性构建样式文件
        preview: resolvePath('src/components/MdEditor/styles/preview.less'),
        style: resolvePath('src/components/MdEditor/styles/style.less'),
      },
    ],
    ['cjs', moduleEntry],
  ];

  const extnames = {
    es: 'mjs',
    cjs: 'cjs',
  };

  rmSync(resolvePath('lib'), { recursive: true, force: true });

  await buildType();

  await Promise.all(
    entries.map(([t, entry]) => {
      return build({
        base: '/',
        publicDir: false,
        define: {
          // vite没有标记这个常理，在打包的时候，会将runtime-dev打包进去
          'process.env.NODE_ENV': '"production"',
        },
        resolve: {
          alias: {
            '~~': resolvePath('src'),
            '~': resolvePath('src/components/MdEditor'),
          },
        },
        plugins: [react()],
        css: {
          modules: {
            localsConvention: 'camelCase', // 默认只支持驼峰，修改为同事支持横线和驼峰
          },
          preprocessorOptions: {
            less: {
              javascriptEnabled: true,
            },
          },
        },
        build: {
          emptyOutDir: false,
          cssCodeSplit: true,
          outDir: resolvePath('lib'),
          lib: {
            entry,
            name: 'MdEditorRT',
            formats: [t],
            fileName(format) {
              switch (format) {
                case 'es': {
                  return 'es/[name].mjs';
                }
                case 'cjs': {
                  return 'cjs/[name].cjs';
                }
                default: {
                  return 'umd/[name].js';
                }
              }
            },
          },
          rollupOptions: {
            external: [
              'react',
              'react-dom',
              'react-dom/client',
              'react/jsx-runtime',
              'medium-zoom',
              'codemirror',
              'lucide-react',
              /@vavt\/.*/,
              /@codemirror\/.*/,
              /@lezer\/.*/,
              /markdown-it.*/,
            ],
            output: {
              chunkFileNames: `${t}/chunks/[name].${extnames[t]}`,
              assetFileNames: '[name][extname]',
            },
          },
        },
      });
    }),
  );
})();

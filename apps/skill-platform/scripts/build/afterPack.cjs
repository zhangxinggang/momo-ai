const fs = require('fs');
const path = require('path');

/** 渲染产物目录（vite build outDir） */
const RENDERER_DIR = 'dist/renderer';
/** 构建时同步的 static（logo 等） */
const DIST_STATIC_DIR = 'dist/static';
/** @momo/electron loadWindowContent 约定的静态目录名 */
const STATIC_FOLDER_NAME = 'static';
const CONFIG_FILE = 'appConf.cjs';
const DEFAULT = 'default';

/**
 * 打包后将运行时所需文件拷到可执行文件同层（process.cwd()）。
 * asar 仅含主/预加载进程；页面与配置走 cwd，与 getAPPRootPath 约定一致。
 */
module.exports = async function (context) {
  const { appOutDir } = context;
  const appRoot = path.join(__dirname, '../..');

  // 删除不必要的多语言，仅保留中文
  const localeDir = path.join(appOutDir, 'locales');
  try {
    const files = fs.readdirSync(localeDir);
    for (const file of files) {
      if (!/zh-CN\.pak$/.test(file)) {
        fs.unlinkSync(path.join(localeDir, file));
      }
    }
  } catch {
    // locales 目录可能不存在
  }

  const staticDest = path.join(appOutDir, STATIC_FOLDER_NAME);
  const copyList = [
    {
      source: path.join(appRoot, RENDERER_DIR),
      dest: staticDest,
    },
    {
      source: path.join(appRoot, DIST_STATIC_DIR),
      dest: staticDest,
    },
    {
      source: path.join(appRoot, CONFIG_FILE),
      dest: path.join(appOutDir, CONFIG_FILE),
    },
    {
      source: path.join(appRoot, DEFAULT),
      dest: path.join(appOutDir, DEFAULT),
    },
  ];

  for (const item of copyList) {
    if (!fs.existsSync(item.source)) {
      console.warn(`[afterPack] skip missing: ${item.source}`);
      continue;
    }
    await fs.promises.cp(item.source, item.dest, { recursive: true });
  }
};

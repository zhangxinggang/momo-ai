import * as fs from 'fs/promises';
import * as path from 'path';

import { getSkillRuntimeDir } from '../../../runtime-paths';

const PRELOAD_FILE_NAME = 'skill-module-paths.cjs';

/** 写入 module.paths 预加载脚本，供 node --require 使用 */
export async function ensureSkillModulePreloadScript(): Promise<string> {
  const runtimeDir = getSkillRuntimeDir();
  await fs.mkdir(runtimeDir, { recursive: true });
  const preloadPath = path.join(runtimeDir, PRELOAD_FILE_NAME);
  const content = `'use strict';
const path = require('path');
const dirs = (process.env.SKILL_MODULE_PATHS || '')
  .split(path.delimiter)
  .map((item) => item.trim())
  .filter(Boolean);
for (const dir of dirs) {
  module.paths.unshift(dir);
}
`;
  await fs.writeFile(preloadPath, content, 'utf8');
  return preloadPath;
}

/** 为 node 命令注入 --require 预加载（命令行仍使用 node 名称） */
export function injectNodeModulePreload(commandLine: string, preloadPath: string): string {
  const trimmed = commandLine.trim();
  if (!/^node\b/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.includes('--require') || trimmed.includes('-r ')) {
    return trimmed;
  }

  return trimmed.replace(/^node\b/i, `node --require "${preloadPath}"`);
}

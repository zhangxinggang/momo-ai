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
const Module = require('module');

const runtimeDirs = (process.env.SKILL_MODULE_PATHS || '')
  .split(path.delimiter)
  .map((item) => item.trim())
  .filter(Boolean);

for (const dir of runtimeDirs) {
  module.paths.unshift(dir);
}

const workspaceRoot = (process.env.SKILL_REPO_PATH || '').trim();

function isAllowedNodeModulesPath(candidate) {
  const resolved = path.resolve(candidate);
  if (path.basename(resolved) !== 'node_modules') {
    return false;
  }
  for (const dir of runtimeDirs) {
    if (resolved === path.resolve(dir)) {
      return true;
    }
  }
  if (workspaceRoot) {
    const ws = path.resolve(workspaceRoot);
    if (resolved.startsWith(ws + path.sep)) {
      return true;
    }
  }
  return false;
}

if (runtimeDirs.length > 0 || workspaceRoot) {
  const originalNodeModulePaths = Module._nodeModulePaths;
  Module._nodeModulePaths = function skillNodeModulePaths(from) {
    const paths = originalNodeModulePaths.call(this, from);
    const filtered = paths.filter(isAllowedNodeModulesPath);
    return filtered.length > 0 ? filtered : paths.slice(0, 1);
  };
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

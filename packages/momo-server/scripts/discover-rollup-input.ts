import { readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { REQUIRE_ALIAS_SRC_DIRS } from '../src/require-alias';

const MAIN_ENTRY_KEY = 'index';

function collectTsEntries(
  currentDir: string,
  srcRoot: string,
  entries: Record<string, string>,
): void {
  for (const name of readdirSync(currentDir)) {
    const filePath = join(currentDir, name);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      collectTsEntries(filePath, srcRoot, entries);
      continue;
    }

    if (!stat.isFile() || !name.endsWith('.ts')) {
      continue;
    }

    const entryKey = relative(srcRoot, filePath).replace(/\\/g, '/').replace(/\.ts$/, '');
    if (entryKey === MAIN_ENTRY_KEY) {
      continue;
    }
    entries[entryKey] = filePath;
  }
}

/**
 * 主入口 + requireAlias 目录下全部 .ts，供 NKRequire 动态 require 的模块不会被 tree-shake 掉。
 */
export function buildRollupInput(packageRoot: string): Record<string, string> {
  const srcRoot = resolve(packageRoot, 'src');
  const input: Record<string, string> = {
    [MAIN_ENTRY_KEY]: join(srcRoot, `${MAIN_ENTRY_KEY}.ts`),
  };

  for (const aliasDir of REQUIRE_ALIAS_SRC_DIRS) {
    const aliasRoot = join(srcRoot, aliasDir);
    collectTsEntries(aliasRoot, srcRoot, input);
  }

  return input;
}

import * as fs from 'fs/promises';
import * as path from 'path';

function extractNodeScriptPath(commandLine: string): string | null {
  const candidates = [
    ...commandLine.matchAll(
      /["']([^"']+\.(?:js|mjs|cjs))["']|(?:^|\s)([\w./\\-]+\.(?:js|mjs|cjs))(?=\s|$)/gi,
    ),
  ]
    .map((match) => (match[1] ?? match[2] ?? '').replace(/\\/g, '/'))
    .filter(Boolean)
    .filter((scriptPath) => !/skill-module-paths|node_modules/i.test(scriptPath));

  return candidates.length > 0 ? candidates[candidates.length - 1]! : null;
}

/** 全局通用的 Node 脚本禁用模式（与具体技能无关） */
const DISALLOWED_SCRIPT_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  {
    pattern: /\beval\s*\(/,
    message: '禁止使用 eval()',
  },
  {
    pattern: /renderToStaticMarkup|react-dom\/server/,
    message:
      '禁止在 headless 脚本中使用 React SSR（renderToStaticMarkup），请遵循 SKILL 指令指定的工具链',
  },
  {
    pattern: /require\s*\(\s*['"]react-icons/,
    message: '禁止 require react-icons 做组件渲染，请改用 emoji 或 SKILL 指令指定的方式',
  },
];

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

/** 校验待执行的 Node 脚本是否含全局禁用模式 */
export async function validateNodeScripts(
  repoPath: string,
  commandLines: string[],
): Promise<string | null> {
  const checked = new Set<string>();

  for (const commandLine of commandLines) {
    const relativePath = extractNodeScriptPath(commandLine);
    if (!relativePath || checked.has(relativePath)) {
      continue;
    }
    checked.add(relativePath);

    const fullPath = path.join(repoPath, relativePath);
    if (!(await pathExists(fullPath))) {
      continue;
    }

    let source: string;
    try {
      source = await fs.readFile(fullPath, 'utf8');
    } catch {
      continue;
    }

    for (const rule of DISALLOWED_SCRIPT_PATTERNS) {
      if (rule.pattern.test(source)) {
        return `${relativePath}：${rule.message}`;
      }
    }
  }

  return null;
}

import * as fs from 'fs/promises';
import * as path from 'path';

import type { IAgentAppProfile } from '@/types/constants/agent-app-profile';
import { getPlatformById } from '@/types/constants/platforms';
import type { DAgentAppPrepareSubmitResult } from '@/types/modules/agent-app';

import { getPlatformRootDir } from '../skill/installer/utils';

/** 声明式钩子动作（不执行 shell） */
type THookActionType = 'deny' | 'append' | 'prepend' | 'replace';

interface IDeclarativeHookRule {
  type: THookActionType;
  matcher?: string;
  reason?: string;
  append?: string;
  prepend?: string;
  replace?: string;
  prompt?: string;
}

function joinRelative(base: string, relativePath: string): string {
  return path.join(base, ...relativePath.split(/[\\/]+/).filter(Boolean));
}

async function resolveRealPathWithin(rootPath: string, targetPath: string): Promise<string | null> {
  try {
    const [realRoot, realTarget] = await Promise.all([
      fs.realpath(rootPath),
      fs.realpath(targetPath),
    ]);
    const relative = path.relative(realRoot, realTarget);
    return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
      ? realTarget
      : null;
  } catch {
    return null;
  }
}

function matchesPrompt(matcher: string | undefined, prompt: string): boolean {
  if (!matcher || !matcher.trim()) {
    return true;
  }
  try {
    return new RegExp(matcher, 'i').test(prompt);
  } catch {
    return prompt.toLowerCase().includes(matcher.toLowerCase());
  }
}

function normalizeHookEntry(raw: unknown): IDeclarativeHookRule | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }
  const entry = raw as Record<string, unknown>;

  // 含 command/shell 的条目一律跳过（安全子集）
  if (typeof entry.command === 'string' || typeof entry.shell === 'string') {
    return null;
  }

  const matcher = typeof entry.matcher === 'string' ? entry.matcher : undefined;
  const reason = typeof entry.reason === 'string' ? entry.reason : undefined;

  if (entry.type === 'deny' || entry.action === 'deny' || entry.deny === true) {
    return { type: 'deny', matcher, reason: reason || '发送已被 hooks 拦截' };
  }

  if (typeof entry.replace === 'string' && entry.replace.trim()) {
    return { type: 'replace', matcher, replace: entry.replace, reason };
  }

  if (typeof entry.prepend === 'string' && entry.prepend.trim()) {
    return { type: 'prepend', matcher, prepend: entry.prepend, reason };
  }

  if (typeof entry.append === 'string' && entry.append.trim()) {
    return { type: 'append', matcher, append: entry.append, reason };
  }

  // Cursor/Claude 常见：仅 prompt 字段 → 追加到用户内容
  if (typeof entry.prompt === 'string' && entry.prompt.trim()) {
    return { type: 'append', matcher, append: entry.prompt, reason };
  }

  if (entry.type === 'append' && typeof entry.text === 'string') {
    return { type: 'append', matcher, append: entry.text, reason };
  }

  if (entry.type === 'prepend' && typeof entry.text === 'string') {
    return { type: 'prepend', matcher, prepend: entry.text, reason };
  }

  return null;
}

function extractHookRules(parsed: unknown): IDeclarativeHookRule[] {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return [];
  }
  const root = parsed as Record<string, unknown>;
  const hooksNode = root.hooks;
  let candidates: unknown[] = [];

  if (Array.isArray(hooksNode)) {
    candidates = hooksNode;
  } else if (hooksNode && typeof hooksNode === 'object' && !Array.isArray(hooksNode)) {
    const map = hooksNode as Record<string, unknown>;
    const keys = [
      'beforeSubmitPrompt',
      'BeforeSubmitPrompt',
      'UserPromptSubmit',
      'userPromptSubmit',
      'beforeSubmit',
    ];
    for (const key of keys) {
      const value = map[key];
      if (Array.isArray(value)) {
        candidates.push(...value);
      }
    }
  }

  // 兼容顶层数组字段
  for (const key of ['beforeSubmitPrompt', 'UserPromptSubmit']) {
    const value = root[key];
    if (Array.isArray(value)) {
      candidates.push(...value);
    }
  }

  const rules: IDeclarativeHookRule[] = [];
  for (const item of candidates) {
    const rule = normalizeHookEntry(item);
    if (rule) {
      rules.push(rule);
    }
  }
  return rules;
}

async function loadHookRulesFromFile(filePath: string): Promise<IDeclarativeHookRule[]> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(raw) as unknown;
    return extractHookRules(parsed);
  } catch {
    return [];
  }
}

async function collectHookRules(
  profile: IAgentAppProfile,
  folderPaths: string[],
): Promise<IDeclarativeHookRule[]> {
  const rules: IDeclarativeHookRule[] = [];

  for (const folder of folderPaths) {
    for (const relative of profile.projectHookFiles) {
      const safePath = await resolveRealPathWithin(folder, joinRelative(folder, relative));
      if (safePath) {
        rules.push(...(await loadHookRulesFromFile(safePath)));
      }
    }
  }

  const platform = getPlatformById(profile.platformId);
  if (platform) {
    const root = getPlatformRootDir(platform);
    for (const relative of profile.globalHookFiles) {
      rules.push(...(await loadHookRulesFromFile(joinRelative(root, relative))));
    }
  }

  return rules;
}

function applyRules(content: string, rules: IDeclarativeHookRule[]): DAgentAppPrepareSubmitResult {
  let next = content;

  for (const rule of rules) {
    if (!matchesPrompt(rule.matcher, next)) {
      continue;
    }
    if (rule.type === 'deny') {
      return {
        action: 'deny',
        reason: rule.reason || '发送已被 hooks 拦截',
      };
    }
    if (rule.type === 'replace' && rule.replace) {
      next = rule.replace;
      continue;
    }
    if (rule.type === 'prepend' && rule.prepend) {
      next = `${rule.prepend.trim()}\n\n${next}`;
      continue;
    }
    if (rule.type === 'append' && rule.append) {
      next = `${next}\n\n${rule.append.trim()}`;
    }
  }

  return { action: 'allow', content: next };
}

/** 执行声明式 beforeSubmit hooks（无 shell） */
export async function evaluateAgentAppBeforeSubmit(
  profile: IAgentAppProfile,
  folderPaths: string[],
  content: string,
): Promise<DAgentAppPrepareSubmitResult> {
  const rules = await collectHookRules(profile, folderPaths);
  if (rules.length === 0) {
    return { action: 'allow', content };
  }
  return applyRules(content, rules);
}

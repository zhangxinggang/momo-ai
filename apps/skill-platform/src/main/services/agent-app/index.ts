import * as fs from 'fs/promises';
import * as path from 'path';

import {
  AGENT_APP_PROFILES,
  getAgentAppProfile,
  type IAgentAppProfile,
} from '@/types/constants/agent-app-profile';
import { getPlatformById } from '@/types/constants/platforms';
import type {
  DAgentAppContext,
  DAgentAppDetectResult,
  DAgentAppDetectionItem,
  DAgentAppListSlashResult,
  DAgentAppPrepareSubmitInput,
  DAgentAppPrepareSubmitResult,
  DAgentAppResourceSource,
} from '@/types/modules/agent-app';

import { getPlatformGlobalRulePath } from '../skill/installer/utils';
import { evaluateAgentAppBeforeSubmit } from './hooks';
import { expandAgentAppSlashContent, listAgentAppSlashCommands } from './slash';

const RULES_CHAR_BUDGET = 20_000;
const MAX_RULE_FILES = 24;
const MAX_RULE_FILE_CHARS = 8_000;

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
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

async function readTextFile(filePath: string, maxChars: number): Promise<string | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const trimmed = content.trim();
    if (!trimmed) {
      return null;
    }
    if (trimmed.length <= maxChars) {
      return trimmed;
    }
    return `${trimmed.slice(0, maxChars)}\n\n…（已截断）`;
  } catch {
    return null;
  }
}

async function collectRuleFilesFromPath(
  targetPath: string,
  out: string[],
  depth: number,
): Promise<void> {
  if (out.length >= MAX_RULE_FILES || depth > 4) {
    return;
  }
  try {
    const stat = await fs.stat(targetPath);
    if (stat.isFile()) {
      const ext = path.extname(targetPath).toLowerCase();
      if (ext === '.md' || ext === '.mdc' || ext === '.txt' || !ext) {
        out.push(targetPath);
      }
      return;
    }
    if (!stat.isDirectory()) {
      return;
    }
    const entries = await fs.readdir(targetPath, { withFileTypes: true });
    for (const entry of entries) {
      if (out.length >= MAX_RULE_FILES) {
        break;
      }
      if (entry.name.startsWith('.') && entry.name !== '.') {
        // 允许扫描目录本身由上层指定；跳过隐藏子项中的无关文件
        if (entry.isDirectory()) {
          continue;
        }
      }
      const child = path.join(targetPath, entry.name);
      if (entry.isDirectory()) {
        await collectRuleFilesFromPath(child, out, depth + 1);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (ext === '.md' || ext === '.mdc' || ext === '.txt') {
          out.push(child);
        }
      }
    }
  } catch {
    // 忽略不可读路径
  }
}

function appendBudget(parts: string[], next: string, budget: { left: number }): boolean {
  if (budget.left <= 0) {
    return false;
  }
  if (next.length <= budget.left) {
    parts.push(next);
    budget.left -= next.length;
    return true;
  }
  parts.push(`${next.slice(0, budget.left)}\n\n…（已截断）`);
  budget.left = 0;
  return false;
}

async function loadRulesForProfile(
  profile: IAgentAppProfile,
  folderPaths: string[],
  sources: DAgentAppResourceSource[],
): Promise<string[]> {
  const chunks: string[] = [];
  const budget = { left: RULES_CHAR_BUDGET };
  const platform = getPlatformById(profile.platformId);

  const globalRulePath = platform ? getPlatformGlobalRulePath(platform) : null;
  if (globalRulePath && (await pathExists(globalRulePath))) {
    const text = await readTextFile(globalRulePath, MAX_RULE_FILE_CHARS);
    if (text) {
      sources.push({ scope: 'global', path: globalRulePath, kind: 'rule' });
      appendBudget(chunks, `### 全局规则（${path.basename(globalRulePath)}）\n\n${text}`, budget);
    }
  }

  const ruleFiles: string[] = [];
  for (const folder of folderPaths) {
    for (const relative of profile.projectRulePaths) {
      const absolute = path.join(folder, ...relative.split(/[\\/]+/).filter(Boolean));
      const safePath = await resolveRealPathWithin(folder, absolute);
      if (safePath) {
        await collectRuleFilesFromPath(safePath, ruleFiles, 0);
      }
    }
  }

  const uniqueFiles = [...new Set(ruleFiles)];
  for (const filePath of uniqueFiles) {
    if (budget.left <= 0) {
      break;
    }
    const text = await readTextFile(filePath, MAX_RULE_FILE_CHARS);
    if (!text) {
      continue;
    }
    sources.push({ scope: 'project', path: filePath, kind: 'rule' });
    appendBudget(chunks, `### 项目规则（${path.basename(filePath)}）\n\n${text}`, budget);
  }

  return chunks;
}

function normalizePathKey(value: string): string {
  return process.platform === 'win32' ? value.toLowerCase() : value;
}

async function inspectMarker(
  folderPath: string,
  marker: IAgentAppProfile['projectMarkers'][number],
): Promise<boolean> {
  const markerPath = path.resolve(folderPath, ...marker.path.split(/[\\/]+/).filter(Boolean));
  const relative = path.relative(folderPath, markerPath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return false;
  }
  try {
    const safeMarkerPath = await resolveRealPathWithin(folderPath, markerPath);
    if (!safeMarkerPath) {
      return false;
    }
    const stat = await fs.stat(safeMarkerPath);
    return marker.kind === 'dir' ? stat.isDirectory() : stat.isFile();
  } catch {
    return false;
  }
}

/** 探测文件夹下存在的 Agent 应用；只允许显式 Profile 的 primary marker 命中。 */
export async function detectAgentApps(
  folderPaths: string[],
  requestKey = '',
): Promise<DAgentAppDetectResult> {
  const normalized: string[] = [];
  const errors: DAgentAppDetectResult['errors'] = [];
  const seenRoots = new Set<string>();

  for (const rawPath of folderPaths) {
    const candidate = rawPath.trim();
    if (!candidate) {
      continue;
    }
    try {
      const realPath = await fs.realpath(candidate);
      const stat = await fs.stat(realPath);
      if (!stat.isDirectory()) {
        errors.push({ folderPath: candidate, code: 'not-directory' });
        continue;
      }
      const key = normalizePathKey(realPath);
      if (!seenRoots.has(key)) {
        seenRoots.add(key);
        normalized.push(realPath);
      }
    } catch (error) {
      const code = (error as NodeJS.ErrnoException)?.code === 'ENOENT' ? 'not-found' : 'unreadable';
      errors.push({ folderPath: candidate, code });
    }
  }

  const byPlatform = new Map<string, DAgentAppDetectionItem>();
  for (const folderPath of normalized) {
    for (const profile of AGENT_APP_PROFILES) {
      const markerMatches = await Promise.all(
        profile.projectMarkers.map(async (marker) => ({
          marker,
          matched: await inspectMarker(folderPath, marker),
        })),
      );
      if (!markerMatches.some(({ marker, matched }) => matched && marker.strength === 'primary')) {
        continue;
      }

      const matchedMarkers = markerMatches
        .filter(({ matched }) => matched)
        .map(({ marker }) => ({
          folderPath,
          markerPath: marker.path,
          strength: marker.strength,
        }));
      const existing = byPlatform.get(profile.platformId);
      if (existing) {
        existing.matchedFolderPaths.push(folderPath);
        existing.matchedMarkers.push(...matchedMarkers);
      } else {
        byPlatform.set(profile.platformId, {
          platformId: profile.platformId,
          matchedFolderPaths: [folderPath],
          matchedMarkers,
        });
      }
    }
  }

  const profileOrder = new Map<string, number>(
    AGENT_APP_PROFILES.map((item, index) => [item.platformId, index]),
  );
  const items = [...byPlatform.values()].sort(
    (left, right) =>
      (profileOrder.get(left.platformId) ?? Number.MAX_SAFE_INTEGER) -
      (profileOrder.get(right.platformId) ?? Number.MAX_SAFE_INTEGER),
  );

  return { requestKey, folderPaths: normalized, items, errors };
}

/** 解析 Agent 应用规则，生成本轮可注入的系统提示。Skill/Command 仅通过显式 Invocation 加载。 */
export async function resolveAgentAppContext(
  agentAppId: string,
  folderPaths: string[],
): Promise<DAgentAppContext | null> {
  const platform = getPlatformById(agentAppId);
  const profile = getAgentAppProfile(agentAppId);
  if (!platform || !profile) {
    return null;
  }

  const normalizedFolders = [...new Set(folderPaths.map((item) => item.trim()).filter(Boolean))];
  const detection = await detectAgentApps(normalizedFolders);
  if (!detection.items.some((item) => item.platformId === agentAppId)) {
    return null;
  }
  const sources: DAgentAppResourceSource[] = [];
  const ruleChunks = await loadRulesForProfile(profile, normalizedFolders, sources);

  if (ruleChunks.length === 0) {
    return {
      agentAppId,
      agentAppName: platform.name,
      systemPrompt: '',
      sources,
    };
  }

  const sections: string[] = [
    `你正在按「${platform.name}」Agent 应用约定工作。请优先遵循下列规则。`,
  ];

  if (ruleChunks.length > 0) {
    sections.push(`## ${platform.name} 规则\n\n${ruleChunks.join('\n\n')}`);
  }
  return {
    agentAppId,
    agentAppName: platform.name,
    systemPrompt: sections.join('\n\n'),
    sources,
  };
}

export async function listAgentAppSlash(
  agentAppId: string,
  folderPaths: string[],
  query?: string,
): Promise<DAgentAppListSlashResult> {
  const profile = getAgentAppProfile(agentAppId);
  if (!profile) {
    return { items: [], warning: '未知 Agent 应用' };
  }
  const normalizedFolders = [...new Set(folderPaths.map((item) => item.trim()).filter(Boolean))];
  const detection = await detectAgentApps(normalizedFolders);
  if (!detection.items.some((item) => item.platformId === agentAppId)) {
    return { items: [], warning: '当前目录已无法检测到所选 Agent' };
  }
  const resources = await listAgentAppSlashCommands(profile, normalizedFolders, query);
  const items = resources.map(({ sourcePath: _sourcePath, ...item }) => item);
  return { items };
}

export async function prepareAgentAppSubmit(
  input: DAgentAppPrepareSubmitInput,
): Promise<DAgentAppPrepareSubmitResult> {
  const profile = getAgentAppProfile(input.agentAppId);
  if (!profile) {
    return {
      action: 'allow',
      content: input.content,
      displayContent: input.displayContent,
    };
  }

  const normalizedFolders = [
    ...new Set(input.folderPaths.map((item) => item.trim()).filter(Boolean)),
  ];
  const detection = await detectAgentApps(normalizedFolders);
  if (!detection.items.some((item) => item.platformId === input.agentAppId)) {
    return {
      action: 'deny',
      reason: '当前目录已无法检测到所选 Agent，请重新编辑项目',
      displayContent: input.displayContent,
    };
  }

  let apiContent = input.content;
  let displayContent = input.displayContent;

  const expanded = await expandAgentAppSlashContent(
    profile,
    normalizedFolders,
    apiContent,
    input.invocation,
  );
  if (expanded) {
    apiContent = expanded.content;
    // 界面仍保留用户输入的斜杠原文
    displayContent = input.displayContent || input.content;
  }

  const hookResult = await evaluateAgentAppBeforeSubmit(profile, normalizedFolders, apiContent);
  if (hookResult.action === 'deny') {
    return {
      action: 'deny',
      reason: hookResult.reason,
      displayContent,
    };
  }

  return {
    action: 'allow',
    content: hookResult.content ?? apiContent,
    displayContent,
    invocation: expanded
      ? {
          resourceId: expanded.resource.resourceId,
          resourceRevision: expanded.resource.resourceRevision,
          command: expanded.resource.command,
          kind: expanded.resource.kind,
          scope: expanded.resource.scope,
        }
      : undefined,
  };
}

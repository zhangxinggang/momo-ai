import {
  ensureSkillSessionWorkspace,
  isSkillApiAvailable,
  writeSessionWorkspaceFile,
} from '@renderer/services/skill/api';

import { parseSkillRunCommands } from './skill-run-commands';

/** 带文件路径的代码块语言标记（```lang:相对路径） */
const ARTIFACT_FILE_LANGS = new Set([
  'artifact',
  'json',
  'javascript',
  'js',
  'typescript',
  'ts',
  'python',
  'py',
  'markdown',
  'md',
  'text',
  'txt',
  'ini',
  'env',
  'yaml',
  'yml',
  'html',
  'htm',
  'css',
  'xml',
  'csv',
  'sql',
  'sh',
  'bash',
  'powershell',
  'ps1',
]);

const ARTIFACT_PATH_BLOCK_RE = /```(\w+):([^\n`]+)\n([\s\S]*?)```/g;
const LEGACY_ARTIFACT_BLOCK_RE = /```artifact:([^\n`]+)\n([\s\S]*?)```/g;

export interface ISkillArtifactFile {
  path: string;
  content: string;
}

function normalizeArtifactPath(filePath: string): string {
  return filePath.trim().replace(/\\/g, '/').replace(/^\/+/, '');
}

function pushArtifact(
  artifacts: ISkillArtifactFile[],
  seenPaths: Set<string>,
  filePath: string,
  content: string,
): void {
  const normalizedPath = normalizeArtifactPath(filePath);
  const body = content.replace(/\s+$/, '');
  if (!normalizedPath || !body || seenPaths.has(normalizedPath)) {
    return;
  }
  seenPaths.add(normalizedPath);
  artifacts.push({ path: normalizedPath, content: body });
}

/** 从模型回复中解析可写入工作区的文件块（artifact: 与 lang:path 格式） */
export function parseSkillArtifacts(text: string): ISkillArtifactFile[] {
  const artifacts: ISkillArtifactFile[] = [];
  const seenPaths = new Set<string>();

  let match: RegExpExecArray | null;
  ARTIFACT_PATH_BLOCK_RE.lastIndex = 0;
  while ((match = ARTIFACT_PATH_BLOCK_RE.exec(text)) !== null) {
    const lang = match[1].toLowerCase();
    if (!ARTIFACT_FILE_LANGS.has(lang)) {
      continue;
    }
    pushArtifact(artifacts, seenPaths, match[2], match[3]);
  }

  LEGACY_ARTIFACT_BLOCK_RE.lastIndex = 0;
  while ((match = LEGACY_ARTIFACT_BLOCK_RE.exec(text)) !== null) {
    pushArtifact(artifacts, seenPaths, match[1], match[2]);
  }

  return artifacts;
}

/** 确保会话工作区已就绪（种子拷贝技能仓库） */
export async function prepareSkillSessionWorkspace(
  skillId: string,
  sessionId: string,
): Promise<string | null> {
  if (!isSkillApiAvailable() || !skillId.trim() || !sessionId.trim()) {
    return null;
  }
  try {
    const result = await ensureSkillSessionWorkspace(skillId, sessionId);
    return result.workspaceDir?.trim() || null;
  } catch {
    return null;
  }
}

/** 将 artifact 写入 SKILL 对话会话工作区（不修改原技能仓库） */
export async function writeSessionArtifacts(
  skillId: string,
  sessionId: string,
  artifacts: ISkillArtifactFile[],
): Promise<{ writtenPaths: string[]; workspaceDir: string | null }> {
  if (!isSkillApiAvailable() || !sessionId.trim()) {
    return { writtenPaths: [], workspaceDir: null };
  }

  const workspaceDir = await prepareSkillSessionWorkspace(skillId, sessionId);
  if (!workspaceDir || artifacts.length === 0) {
    return { writtenPaths: [], workspaceDir };
  }

  const written: string[] = [];
  for (const artifact of artifacts) {
    await writeSessionWorkspaceFile(sessionId, artifact.path, artifact.content);
    written.push(artifact.path);
  }
  return { writtenPaths: written, workspaceDir };
}

/** 从 skill-run 命令中提取 node/python 脚本相对路径 */
export function extractScriptPathFromCommand(commandLine: string): string | null {
  const nodeMatch = commandLine.match(
    /\bnode\s+(?:--[^\s]+\s+)*["']?((?:[\w.-]+[/\\])+\.(?:js|mjs|cjs))["']?/i,
  );
  if (nodeMatch?.[1]) {
    return normalizeArtifactPath(nodeMatch[1]);
  }
  const pyMatch = commandLine.match(
    /\b(?:python|py)\s+(?:-[^\s]+\s+)*["']?((?:[\w.-]+[/\\])+\.py)["']?/i,
  );
  if (pyMatch?.[1]) {
    return normalizeArtifactPath(pyMatch[1]);
  }
  return null;
}

/** 检测回复中声明了 .env 但未成功写入工作区的路径 */
export function findMissingEnvArtifacts(reply: string, writtenPaths: string[]): string[] {
  const writtenSet = new Set(writtenPaths.map(normalizeArtifactPath));
  const envPathsInReply = new Set<string>();

  let match: RegExpExecArray | null;
  ARTIFACT_PATH_BLOCK_RE.lastIndex = 0;
  while ((match = ARTIFACT_PATH_BLOCK_RE.exec(reply)) !== null) {
    const filePath = normalizeArtifactPath(match[2]);
    const baseName = filePath.slice(filePath.lastIndexOf('/') + 1).toLowerCase();
    if (baseName === '.env' || baseName.startsWith('.env.')) {
      envPathsInReply.add(filePath);
    }
  }

  const missing: string[] = [];
  for (const envPath of envPathsInReply) {
    if (!writtenSet.has(envPath)) {
      missing.push(envPath);
    }
  }
  return missing;
}

/** 检查 skill-run 引用的脚本是否已写入 artifact */
export function findMissingArtifactScripts(reply: string, writtenPaths: string[]): string[] {
  const writtenSet = new Set(writtenPaths.map(normalizeArtifactPath));
  const parsedArtifacts = parseSkillArtifacts(reply);
  const artifactPaths = new Set(parsedArtifacts.map((item) => normalizeArtifactPath(item.path)));

  const missing: string[] = [];
  for (const commandLine of parseSkillRunCommands(reply)) {
    const scriptPath = extractScriptPathFromCommand(commandLine);
    if (!scriptPath) {
      continue;
    }
    if (writtenSet.has(scriptPath)) {
      continue;
    }
    if (artifactPaths.has(scriptPath)) {
      missing.push(scriptPath);
    }
  }
  return [...new Set(missing)];
}

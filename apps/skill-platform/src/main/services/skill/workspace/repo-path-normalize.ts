import * as path from 'path';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** 技能仓库目录名（如 pptx） */
export function getRepoFolderBaseName(repoPath: string): string {
  return path.basename(path.normalize(repoPath.trim()));
}

/** 将 skills/<技能名>/ 前缀剥离为仓库内相对路径 */
export function stripRedundantSkillPathPrefix(filePath: string, repoFolderName: string): string {
  const normalized = filePath.replace(/\\/g, '/').trim();
  if (!repoFolderName || !normalized) {
    return normalized;
  }

  const escaped = escapeRegex(repoFolderName);
  const prefixRe = new RegExp(`^(?:\\./)?skills/${escaped}(?:/|$)`, 'i');
  if (prefixRe.test(normalized)) {
    return normalized.replace(prefixRe, '').replace(/^\/+/, '');
  }

  return normalized;
}

/**
 * 修正命令行中错误的 skills/<skill>/ 路径前缀。
 * 技能在 PromptHub 仓库根目录执行时，不应再带 monorepo 式 skills/<name>/ 前缀。
 */
export function normalizeRepoPathsInCommand(commandLine: string, repoPath: string): string {
  const folderName = getRepoFolderBaseName(repoPath);
  if (!folderName) {
    return commandLine;
  }

  const escaped = escapeRegex(folderName);
  return commandLine.replace(new RegExp(`skills[/\\\\]${escaped}[/\\\\]`, 'gi'), '');
}

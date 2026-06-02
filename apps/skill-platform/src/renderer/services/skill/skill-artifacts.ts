const ARTIFACT_BLOCK_RE = /```artifact:([^\n`]+)\n([\s\S]*?)```/g;

export interface ISkillArtifactFile {
  path: string;
  content: string;
}

/** 从模型回复中解析 artifact 代码块 */
export function parseSkillArtifacts(text: string): ISkillArtifactFile[] {
  const artifacts: ISkillArtifactFile[] = [];
  let match: RegExpExecArray | null = ARTIFACT_BLOCK_RE.exec(text);

  while (match) {
    const filePath = match[1].trim();
    const content = match[2].replace(/\s+$/, '');
    if (filePath && content) {
      artifacts.push({ path: filePath, content });
    }
    match = ARTIFACT_BLOCK_RE.exec(text);
  }

  return artifacts;
}

/** 确保技能本地仓库路径可用 */
export async function ensureSkillRepoPath(skillId: string): Promise<string | null> {
  if (!window.api?.skill?.getRepoPath) {
    return null;
  }
  try {
    const repoPath = await window.api.skill.getRepoPath(skillId);
    return typeof repoPath === 'string' && repoPath.trim() ? repoPath.trim() : null;
  } catch {
    return null;
  }
}

/** 将 artifact 写入技能本地仓库 */
export async function writeSkillArtifacts(
  skillId: string,
  artifacts: ISkillArtifactFile[],
): Promise<string[]> {
  if (!window.api?.skill?.writeLocalFile || artifacts.length === 0) {
    return [];
  }

  await ensureSkillRepoPath(skillId);

  const written: string[] = [];
  for (const artifact of artifacts) {
    await window.api.skill.writeLocalFile(skillId, artifact.path, artifact.content);
    written.push(artifact.path);
  }
  return written;
}

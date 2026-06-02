import fs from 'fs/promises';
import type { SkillDB } from '../../database';
import { SkillInstaller } from '../../services/skill';

export interface ISkillIPCContext {
  db: SkillDB;
}

export async function ensureLocalRepoPath(db: SkillDB, skillId: string): Promise<string | null> {
  const skill = await db.getById(skillId);
  if (!skill) return null;

  const managedRepoPath = SkillInstaller.getLocalRepoPath(skill.name);
  const candidateRepoPath =
    skill.local_repo_path && (await SkillInstaller.isManagedRepoPath(skill.local_repo_path))
      ? skill.local_repo_path
      : managedRepoPath;

  try {
    const candidateStat = await fs.stat(candidateRepoPath);
    if (candidateStat.isDirectory()) {
      if (skill.local_repo_path !== candidateRepoPath) {
        await db.update(skillId, { local_repo_path: candidateRepoPath });
      }
      return candidateRepoPath;
    }
  } catch {
    // fall through to bootstrap from DB content
  }

  if (skill.local_repo_path && !(await SkillInstaller.isManagedRepoPath(skill.local_repo_path))) {
    try {
      const externalRepoStat = await fs.stat(skill.local_repo_path);
      if (externalRepoStat.isDirectory()) {
        const savedRepoPath = await SkillInstaller.saveToLocalRepo(
          skill.name,
          skill.local_repo_path,
        );
        if (skill.local_repo_path !== savedRepoPath) {
          await db.update(skillId, { local_repo_path: savedRepoPath });
        }
        return savedRepoPath;
      }
    } catch {
      // fall through to bootstrap from DB content
    }
  }

  const repoContent = skill.instructions || skill.content || '';
  if (!repoContent.trim()) {
    return null;
  }

  const savedRepoPath = await SkillInstaller.saveContentToLocalRepo(skill.name, repoContent);
  if (skill.local_repo_path !== savedRepoPath) {
    await db.update(skillId, { local_repo_path: savedRepoPath });
  }
  return savedRepoPath;
}

export async function resolveRepoPath(db: SkillDB, skillId: string): Promise<string | null> {
  if (typeof skillId !== 'string' || skillId.trim() === '') {
    return null;
  }

  const skill = await db.getById(skillId);
  if (!skill) return null;

  const repoPath =
    skill.local_repo_path && (await SkillInstaller.isManagedRepoPath(skill.local_repo_path))
      ? skill.local_repo_path
      : SkillInstaller.getLocalRepoPath(skill.name);
  try {
    const repoStat = await fs.stat(repoPath);
    if (repoStat.isDirectory()) {
      return repoPath;
    }
  } catch {
    return null;
  }

  return null;
}

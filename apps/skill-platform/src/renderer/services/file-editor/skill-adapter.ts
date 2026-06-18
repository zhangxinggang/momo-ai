import type { IFileEditorAdapter, IFileTreeEntry } from '@momo/file-editor';
import { normalizeRelativePath } from '@momo/file-editor';

function isHiddenSkillRepoEntry(repoPath: string): boolean {
  return repoPath
    .split(/[/\\]+/)
    .filter(Boolean)
    .some((segment) => segment === '.git' || segment === '.aim');
}

export interface ISkillFileEditorAdapterOptions {
  skillId: string;
  localPath?: string;
}

/** 技能本地仓库文件读写适配器 */
export function createSkillFileEditorAdapter(
  options: ISkillFileEditorAdapterOptions,
): IFileEditorAdapter {
  const { skillId, localPath } = options;
  const isPathMode = Boolean(localPath);

  return {
    async listTree() {
      const list = isPathMode
        ? await window.api.skill.listLocalFilesByPath(localPath!)
        : await window.api.skill.listLocalFiles(skillId);
      return list.map((entry) => ({
        relativePath: normalizeRelativePath(entry.path),
        isDirectory: entry.isDirectory,
        size: entry.size,
      }));
    },

    filterEntry: (entry: IFileTreeEntry) => !isHiddenSkillRepoEntry(entry.relativePath),

    selectInitialPath: (entries: IFileTreeEntry[]) => {
      const skillMd = entries.find(
        (entry) => !entry.isDirectory && entry.relativePath.toLowerCase() === 'skill.md',
      );
      return (
        skillMd?.relativePath ?? entries.find((entry) => !entry.isDirectory)?.relativePath ?? null
      );
    },

    async readFile(relativePath: string) {
      const result = isPathMode
        ? await window.api.skill.readLocalFileByPath(localPath!, relativePath)
        : await window.api.skill.readLocalFile(skillId, relativePath);
      return result?.content ?? '';
    },

    async writeFile(relativePath: string, content: string) {
      try {
        if (isPathMode) {
          await window.api.skill.writeLocalFileByPath(localPath!, relativePath, content);
        } else {
          await window.api.skill.writeLocalFile(skillId, relativePath, content);
        }
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },

    async deletePath(relativePath: string) {
      try {
        if (isPathMode) {
          await window.api.skill.deleteLocalFileByPath(localPath!, relativePath);
        } else {
          await window.api.skill.deleteLocalFile(skillId, relativePath);
        }
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },

    async createDirectory(relativePath: string) {
      try {
        if (isPathMode) {
          await window.api.skill.createLocalDirByPath(localPath!, relativePath);
        } else {
          await window.api.skill.createLocalDir(skillId, relativePath);
        }
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
  };
}

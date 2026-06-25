import type { IFileEditorAdapter, IFileTreeEntry } from '@momo/file-editor';
import { isCodeEditorPath, normalizeRelativePath } from '@momo/file-editor';
import {
  createSkillLocalDir,
  createSkillLocalDirByPath,
  deleteSkillLocalFile,
  deleteSkillLocalFileByPath,
  listSkillLocalFiles,
  listSkillLocalFilesByPath,
  moveSkillLocalPath,
  moveSkillLocalPathByPath,
  readSkillLocalFile,
  readSkillLocalFileBuffer,
  readSkillLocalFileBufferByPath,
  readSkillLocalFileByPath,
  writeSkillLocalFile,
  writeSkillLocalFileByPath,
} from '@renderer/services/skill/api';

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
        ? await listSkillLocalFilesByPath(localPath!)
        : await listSkillLocalFiles(skillId);
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
        ? await readSkillLocalFileByPath(localPath!, relativePath)
        : await readSkillLocalFile(skillId, relativePath);
      let content = result?.content ?? '';
      if (isCodeEditorPath(relativePath)) {
        try {
          const buffer = isPathMode
            ? await readSkillLocalFileBufferByPath(localPath!, relativePath)
            : await readSkillLocalFileBuffer(skillId, relativePath);
          if (buffer) {
            content = new TextDecoder('utf-8').decode(buffer);
          }
        } catch (error) {
          console.error(error);
        }
      }
      return content;
    },

    async readFileBuffer(relativePath: string) {
      try {
        return isPathMode
          ? await readSkillLocalFileBufferByPath(localPath!, relativePath)
          : await readSkillLocalFileBuffer(skillId, relativePath);
      } catch (error) {
        console.error(error);
        return null;
      }
    },

    async writeFile(relativePath: string, content: string) {
      try {
        if (isPathMode) {
          await writeSkillLocalFileByPath(localPath!, relativePath, content);
        } else {
          await writeSkillLocalFile(skillId, relativePath, content);
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
          await deleteSkillLocalFileByPath(localPath!, relativePath);
        } else {
          await deleteSkillLocalFile(skillId, relativePath);
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
          await createSkillLocalDirByPath(localPath!, relativePath);
        } else {
          await createSkillLocalDir(skillId, relativePath);
        }
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },

    movePath(fromRelativePath: string, toRelativePath: string) {
      return isPathMode
        ? moveSkillLocalPathByPath(localPath!, fromRelativePath, toRelativePath)
        : moveSkillLocalPath(skillId, fromRelativePath, toRelativePath);
    },
  };
}

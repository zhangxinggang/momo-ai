import type { INoteReferenceNode, INoteReferencesConfig } from '@momo/aichat';
import { resolveNoteMentionsInContent } from '@momo/aichat';

import { getBuiltinSkillPrompt } from '@/shared/builtin-skills';
import { getWorkspaceIpc } from '@renderer/services/ipc';
import { listNoteTree, readNoteFile } from '@renderer/services/note/api';
import { useChatProjectStore } from '@renderer/store/chat';

const WORKSPACE_REFERENCE_PREFIX = 'workspace:';
const WORKSPACE_FOLDER_PREFIX = 'workspace-folder:';

interface IWorkspaceTreeEntry {
  name?: string;
  path: string;
  type: 'file' | 'directory';
}

function getPathName(path: string): string {
  return (
    path
      .replace(/[\\/]+$/, '')
      .split(/[\\/]/)
      .at(-1) || path
  );
}

function buildWorkspaceReference(rootPath: string, relativePath: string): string {
  return `${WORKSPACE_REFERENCE_PREFIX}${encodeURIComponent(rootPath)}::${encodeURIComponent(relativePath)}`;
}

function parseWorkspaceReference(
  reference: string,
): { rootPath: string; relativePath: string } | null {
  if (!reference.startsWith(WORKSPACE_REFERENCE_PREFIX)) return null;
  const separator = reference.indexOf('::', WORKSPACE_REFERENCE_PREFIX.length);
  if (separator < 0) return null;
  try {
    return {
      rootPath: decodeURIComponent(reference.slice(WORKSPACE_REFERENCE_PREFIX.length, separator)),
      relativePath: decodeURIComponent(reference.slice(separator + 2)),
    };
  } catch {
    return null;
  }
}

function buildWorkspaceFolderId(rootPath: string, relativePath: string): string {
  return `${WORKSPACE_FOLDER_PREFIX}${encodeURIComponent(rootPath)}::${encodeURIComponent(relativePath)}`;
}

function parseWorkspaceFolderId(
  folderId: string,
): { rootPath: string; relativePath: string } | null {
  if (!folderId.startsWith(WORKSPACE_FOLDER_PREFIX)) return null;
  const separator = folderId.indexOf('::', WORKSPACE_FOLDER_PREFIX.length);
  if (separator < 0) return null;
  try {
    return {
      rootPath: decodeURIComponent(folderId.slice(WORKSPACE_FOLDER_PREFIX.length, separator)),
      relativePath: decodeURIComponent(folderId.slice(separator + 2)),
    };
  } catch {
    return null;
  }
}

function buildWorkspaceNodes(
  rootPath: string,
  parentRelativePath: string,
  entries: IWorkspaceTreeEntry[],
): INoteReferenceNode[] {
  return entries
    .map((entry) => {
      const name = entry.name || getPathName(entry.path);
      const relativePath = parentRelativePath ? `${parentRelativePath}/${name}` : name;
      return entry.type === 'directory'
        ? {
            id: buildWorkspaceFolderId(rootPath, relativePath),
            name,
            kind: 'folder' as const,
            noteType: 'workspace',
          }
        : {
            id: buildWorkspaceReference(rootPath, relativePath),
            name,
            kind: 'file' as const,
            noteType: 'workspace',
          };
    })
    .sort(
      (left, right) =>
        Number(right.kind === 'folder') - Number(left.kind === 'folder') ||
        left.name.localeCompare(right.name),
    );
}

function resolveWorkspaceDirectoryPath(rootPath: string, relativePath: string): string {
  if (!relativePath) return rootPath;
  const separator = rootPath.includes('\\') ? '\\' : '/';
  return `${rootPath.replace(/[\\/]+$/, '')}${separator}${relativePath.replace(/[\\/]/g, separator)}`;
}

async function readReferenceContent(reference: string): Promise<string> {
  const workspaceReference = parseWorkspaceReference(reference);
  if (workspaceReference) {
    const api = getWorkspaceIpc();
    if (!api) throw new Error('工作区 API 不可用');
    const separator = workspaceReference.rootPath.includes('\\') ? '\\' : '/';
    const filePath = `${workspaceReference.rootPath.replace(/[\\/]+$/, '')}${separator}${workspaceReference.relativePath.replace(/[\\/]/g, separator)}`;
    const result = (await api.readFile(filePath)) as {
      success?: boolean;
      content?: string;
      error?: string;
    };
    if (!result?.success) throw new Error(result?.error || '读取工作区文件失败');
    return result.content ?? '';
  }

  const result = await readNoteFile(reference);
  if (typeof result === 'string') return result;
  return result.content ?? '';
}

/** 构建 AI 对话 @ 引用配置；选择工作区后同时暴露笔记与工作区文件。 */
export function createNoteReferencesConfig(): INoteReferencesConfig | undefined {
  return {
    get systemHint() {
      return getBuiltinSkillPrompt('chatReference');
    },
    listTree: async () => {
      const notes = await listNoteTree();
      const workspacePaths = useChatProjectStore.getState().activeFolderPaths;
      if (workspacePaths.length === 0) return notes;

      const api = getWorkspaceIpc();
      if (!api) return notes;
      const workspaceRoots = await Promise.all(
        workspacePaths.map(async (rootPath) => {
          const result = (await api.listDir(rootPath)) as {
            success?: boolean;
            entries?: IWorkspaceTreeEntry[];
          };
          return {
            id: buildWorkspaceFolderId(rootPath, ''),
            name: getPathName(rootPath),
            kind: 'folder' as const,
            noteType: 'workspace',
            children: result?.success
              ? buildWorkspaceNodes(rootPath, '', result.entries ?? [])
              : [],
          };
        }),
      );

      return [
        {
          id: 'reference-category:notes',
          name: '笔记',
          kind: 'folder' as const,
          noteType: 'note',
          children: notes,
        },
        {
          id: 'reference-category:workspace',
          name: '工作区文件',
          kind: 'folder' as const,
          noteType: 'workspace',
          children: workspaceRoots,
        },
      ];
    },
    loadChildren: async (folder) => {
      const workspaceFolder = parseWorkspaceFolderId(folder.id);
      if (!workspaceFolder) {
        return folder.children ?? [];
      }
      const api = getWorkspaceIpc();
      if (!api) return [];
      const directoryPath = resolveWorkspaceDirectoryPath(
        workspaceFolder.rootPath,
        workspaceFolder.relativePath,
      );
      const result = (await api.listDir(directoryPath)) as {
        success?: boolean;
        entries?: IWorkspaceTreeEntry[];
      };
      return result?.success
        ? buildWorkspaceNodes(
            workspaceFolder.rootPath,
            workspaceFolder.relativePath,
            result.entries ?? [],
          )
        : [];
    },
    readContent: readReferenceContent,
    resolveContent: async (content: string) =>
      resolveNoteMentionsInContent(content, readReferenceContent),
  };
}

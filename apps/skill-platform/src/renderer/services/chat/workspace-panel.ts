import { create } from 'zustand';

export type WorkspacePanelRequest =
  | { id: number; tab: 'browser'; url: string }
  | { id: number; tab: 'files'; root: string; relativePath: string }
  | { id: number; tab: 'review'; runId: string; path?: string };

export const useWorkspacePanelRequest = create<{ request: WorkspacePanelRequest | null }>(() => ({
  request: null,
}));
let requestId = 0;
export function openChatBrowser(url: string) {
  if (!/^https?:\/\//i.test(url)) return;
  useWorkspacePanelRequest.setState({ request: { id: ++requestId, tab: 'browser', url } });
}
export function openChatReview(runId: string, path?: string) {
  useWorkspacePanelRequest.setState({ request: { id: ++requestId, tab: 'review', runId, path } });
}

/** Segment boundaries prevent matching sibling directories such as project-old. */
export function workspaceFileTarget(roots: string[], absolutePath: string) {
  const normalize = (value: string) => value.replace(/\\/g, '/').replace(/\/+$/, '');
  const target = normalize(absolutePath);
  const windowsPath = /^[a-z]:\//i.test(target) || target.startsWith('//');
  const key = (value: string) => (windowsPath ? value.toLowerCase() : value);
  for (const root of [...roots].sort((a, b) => b.length - a.length)) {
    const normalizedRoot = normalize(root);
    if (key(target) !== key(normalizedRoot) && !key(target).startsWith(key(normalizedRoot) + '/'))
      continue;
    const relativePath = target.slice(normalizedRoot.length).replace(/^\//, '');
    if (relativePath.split('/').includes('..')) return null;
    return { root, relativePath };
  }
  return null;
}
export function openChatWorkspaceFile(roots: string[], absolutePath: string): boolean {
  const target = workspaceFileTarget(roots, absolutePath);
  if (!target) return false;
  useWorkspacePanelRequest.setState({ request: { id: ++requestId, tab: 'files', ...target } });
  return true;
}

import fs from 'node:fs/promises';
import path from 'node:path';

// Review is best-effort; a large checkout must not exhaust the Electron heap.
export const SNAPSHOT_LIMITS = {
  contentBytes: 16 * 1024 * 1024,
  entries: 10_000,
  depth: 32,
  durationMs: 10_000,
};
const IGNORED_DIRECTORIES = new Set([
  '.git',
  '.cache',
  '.next',
  '.nuxt',
  '.output',
  '.pnpm-store',
  '.turbo',
  '.venv',
  '.yarn',
  '__pycache__',
  'node_modules',
  'dist',
  'build',
  'out',
  'coverage',
  'target',
  'vendor',
  'venv',
  'site-packages',
  'logs',
  'temp',
]);

export interface WorkspaceSnapshot {
  files: Map<string, { root: string; content: string }>;
  // Existing but unreadable/oversized files must never be reported as newly created.
  seen: Set<string>;
  complete: boolean;
  contentBytes: number;
}

export async function snapshotWorkspace(
  roots: string[],
  read: (root: string, filename: string) => Promise<string | null>,
  signal?: AbortSignal,
  limits = SNAPSHOT_LIMITS,
): Promise<WorkspaceSnapshot> {
  const result: WorkspaceSnapshot = {
    files: new Map(),
    seen: new Set(),
    complete: true,
    contentBytes: 0,
  };
  const visited = new Set<string>();
  const deadline = Date.now() + limits.durationMs;
  let entries = 0;
  let exhausted = false;
  const check = () => {
    signal?.throwIfAborted();
    if (entries >= limits.entries || Date.now() >= deadline) exhausted = true;
    if (exhausted) result.complete = false;
    return !exhausted;
  };
  const scan = async (root: string, directory: string, depth: number): Promise<void> => {
    if (!check()) return;
    if (depth > limits.depth) {
      result.complete = false;
      return;
    }
    const key = process.platform === 'win32' ? directory.toLowerCase() : directory;
    if (visited.has(key)) return;
    visited.add(key);
    try {
      // Stream directory entries instead of allocating an entire directory listing.
      const dir = await fs.opendir(directory);
      for await (const entry of dir) {
        if (!check()) break;
        entries++;
        const name = entry.name.toLowerCase();
        // Electron treats ASAR archives as virtual directories and caches their headers.
        if (entry.isSymbolicLink() || name.endsWith('.asar') || name.endsWith('.asar.unpacked'))
          continue;
        const target = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          if (!IGNORED_DIRECTORIES.has(name)) await scan(root, target, depth + 1);
        } else if (entry.isFile() && !result.seen.has(target)) {
          result.seen.add(target);
          const content = await read(root, target).catch(() => null);
          if (!check()) break;
          if (content === null) continue;
          // Account for V8's two-byte strings, not just their UTF-8 file size.
          const bytes = content.length * 2;
          if (result.contentBytes + bytes > limits.contentBytes) {
            exhausted = true;
            result.complete = false;
            break;
          }
          result.files.set(target, { root, content });
          result.contentBytes += bytes;
        }
      }
    } catch (error) {
      signal?.throwIfAborted();
      // A disappearing or inaccessible subtree makes the inventory incomplete.
      if (!(error instanceof Error)) throw error;
      result.complete = false;
    }
  };
  try {
    for (const root of new Set(roots.map((value) => path.resolve(value)))) {
      if (!check()) break;
      await scan(root, root, 0);
    }
    signal?.throwIfAborted();
    return result;
  } catch (error) {
    result.files.clear();
    result.seen.clear();
    throw error;
  }
}

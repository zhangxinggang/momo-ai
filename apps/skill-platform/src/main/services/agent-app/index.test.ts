import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../skill/installer/utils', () => ({
  getPlatformGlobalRulePath: () => '',
  getPlatformRootDir: () => '',
  getPlatformSkillsDir: () => '',
}));

import { detectAgentApps } from './index';

const temporaryRoots: string[] = [];

async function createRoot(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-agent-detect-'));
  temporaryRoots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) => fs.rm(root, { recursive: true, force: true })),
  );
});

describe('detectAgentApps', () => {
  it('returns only agents with a primary marker', async () => {
    const root = await createRoot();
    await fs.mkdir(path.join(root, '.cursor'));
    await fs.writeFile(path.join(root, 'AGENTS.md'), 'shared rules');

    const result = await detectAgentApps([root], 'request-1');

    expect(result.requestKey).toBe('request-1');
    expect(result.items.map((item) => item.platformId)).toEqual(['cursor']);
  });

  it('merges matches for the same agent across selected roots', async () => {
    const first = await createRoot();
    const second = await createRoot();
    await fs.mkdir(path.join(first, '.codex'));
    await fs.mkdir(path.join(second, '.codex'));

    const result = await detectAgentApps([first, second], 'request-2');

    expect(result.items).toHaveLength(1);
    expect(result.items[0].platformId).toBe('codex');
    expect(result.items[0].matchedFolderPaths).toHaveLength(2);
  });

  it('reports unreadable input without inventing an agent', async () => {
    const missing = path.join(os.tmpdir(), 'momo-agent-missing-' + Date.now());
    const result = await detectAgentApps([missing], 'request-3');

    expect(result.items).toEqual([]);
    expect(result.errors).toEqual([{ folderPath: missing, code: 'not-found' }]);
  });
});

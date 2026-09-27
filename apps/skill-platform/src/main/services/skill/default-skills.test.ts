import { strToU8, zipSync } from 'fflate';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SkillDB } from '../../database';

const runtime = vi.hoisted(() => ({ root: '' }));
const repo = vi.hoisted(() => ({ save: vi.fn(async () => 'local-repo') }));
vi.mock('../../runtime-paths', () => ({
  getProjectRoot: () => runtime.root,
  getAppTempDir: () => path.join(runtime.root, 'temp'),
}));
vi.mock('./installer/repo', () => ({ saveToLocalRepo: repo.save }));

import {
  getDefaultSkillsDir,
  importDefaultSkills,
  listDefaultSkillPreviews,
} from './default-skills';

afterEach(async () => {
  if (runtime.root) await fs.rm(runtime.root, { recursive: true, force: true });
  runtime.root = '';
  repo.save.mockClear();
});

describe('default user skills', () => {
  it('lists and imports only user ZIPs, leaving builtIn rules outside the user database', async () => {
    runtime.root = await fs.mkdtemp(path.join(os.tmpdir(), 'aim-user-skill-test-'));
    const user = path.join(runtime.root, 'default/skills/user');
    const builtin = path.join(runtime.root, 'default/skills/builtIn');
    await fs.mkdir(user, { recursive: true });
    await fs.mkdir(builtin, { recursive: true });
    const archive = zipSync({
      'SKILL.md': strToU8(
        '---\nname: example\ndescription: A user skill\n---\n# Example\nDo the task.',
      ),
    });
    await fs.writeFile(path.join(user, 'example.zip'), archive);
    await fs.writeFile(path.join(builtin, 'internal.zip'), archive);
    const db = {
      getByName: vi.fn(async () => null),
      create: vi.fn(async () => ({ id: 'created' })),
      update: vi.fn(),
    };
    expect(getDefaultSkillsDir()).toBe(user);
    const previews = await listDefaultSkillPreviews(db as unknown as SkillDB);
    expect(previews.map((preview) => preview.zipFileName)).toEqual(['example.zip']);
    expect(previews[0].name).toBe('example');
    const result = await importDefaultSkills(
      db as unknown as SkillDB,
      ['example.zip', 'internal.zip'],
      { overwrite: false },
    );
    expect(result.imported).toBe(1);
    expect(result.failed.map((item) => item.zipFileName)).toEqual(['internal.zip']);
    expect(db.create).toHaveBeenCalledWith(
      expect.objectContaining({ source_url: 'default://example.zip' }),
    );
    expect(repo.save).toHaveBeenCalledOnce();
  });
});

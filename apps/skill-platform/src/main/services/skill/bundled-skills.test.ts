import { expect, it, vi } from 'vitest';
import { ensureBundledSkills } from './bundled-skills';
const imports = vi.hoisted(() => vi.fn().mockResolvedValue({ failed: [] }));
vi.mock('./default-skills', () => ({
  importDefaultSkills: imports,
  getDefaultSkillsDir: () => 'default/skills/user',
}));
vi.mock('node:fs/promises', () => ({
  default: {
    readFile: async () =>
      JSON.stringify([
        { name: 'tender-document-parser', autoInstall: true },
        { name: 'rea-page-rebuild', autoInstall: true },
        { name: 'optional-skill' },
      ]),
  },
}));
it('adds only missing feature skills and preserves installed user copies', async () => {
  const db = {
    getByName: vi.fn(async (name: string) =>
      name === 'tender-document-parser' ? { id: 'customized' } : null,
    ),
  };
  await ensureBundledSkills(db as never);
  expect(imports).toHaveBeenCalledWith(db, ['rea-page-rebuild.zip'], { overwrite: false });
});

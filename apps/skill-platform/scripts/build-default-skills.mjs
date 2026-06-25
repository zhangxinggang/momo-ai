import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { zipSync } from 'fflate';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, '..');
const outputDir = path.join(appRoot, 'default', 'skills');

/** 内置默认技能：源目录相对 monorepo 根路径 -> 输出 zip 文件名 */
const DEFAULT_SKILL_SOURCES = [
  {
    sourceRelativePath: '.cursor/skills/karpathy-guidelines',
    zipFileName: 'karpathy-guidelines.zip',
  },
];

function collectFiles(rootDir, currentDir = rootDir, prefix = '') {
  const files = {};
  for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
    const absolutePath = path.join(currentDir, entry.name);
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      Object.assign(files, collectFiles(rootDir, absolutePath, relativePath));
      continue;
    }
    if (!entry.isFile()) {
      continue;
    }
    files[relativePath.replace(/\\/g, '/')] = fs.readFileSync(absolutePath);
  }
  return files;
}

function buildDefaultSkillZip({ sourceRelativePath, zipFileName }) {
  const monorepoRoot = path.resolve(appRoot, '../..');
  const sourceDir = path.join(monorepoRoot, sourceRelativePath);
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`默认技能源目录不存在: ${sourceDir}`);
  }

  const skillMdPath = path.join(sourceDir, 'SKILL.md');
  if (!fs.existsSync(skillMdPath)) {
    throw new Error(`默认技能源目录缺少 SKILL.md: ${sourceDir}`);
  }

  const fileMap = collectFiles(sourceDir);
  const zipEntries = Object.fromEntries(
    Object.entries(fileMap).map(([relativePath, buffer]) => [
      relativePath,
      new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength),
    ]),
  );

  const zipped = zipSync(zipEntries, { level: 1 });
  const outputPath = path.join(outputDir, zipFileName);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, Buffer.from(zipped));
  console.log(`已生成 ${path.relative(appRoot, outputPath)} (${Object.keys(fileMap).length} 个文件)`);
}

for (const skillSource of DEFAULT_SKILL_SOURCES) {
  buildDefaultSkillZip(skillSource);
}

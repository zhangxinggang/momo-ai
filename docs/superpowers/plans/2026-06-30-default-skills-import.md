# 默认技能包导入 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在新建技能弹框增加「导入默认」，从 `default/skills/*.zip` 预览并批量导入到「我的技能」，同名时一次性确认是否覆盖。

**Architecture:** Main 进程 `default-skills.ts` 负责读 zip、解压、解析 SKILL.md、导入/覆盖；Renderer 复用 `SkillScanPreview` 预览与勾选；新增两条 IPC。

**Tech Stack:** TypeScript、Electron IPC、fflate（unzip）、现有 `parseSkillMd` / `saveToLocalRepo` / SkillDB

**Spec:** `docs/superpowers/specs/2026-06-30-default-skills-import-design.md`

---

## 文件变更一览

| 操作 | 文件 | 职责 |
|------|------|------|
| Create | `apps/skill-platform/default/skills/.gitkeep` | 占位目录（后续放入 zip） |
| Create | `apps/skill-platform/src/main/services/skill/default-skills.ts` | 列表预览 + 导入 |
| Modify | `apps/skill-platform/src/main/services/skill/index.ts` | 导出 default-skills |
| Modify | `apps/skill-platform/src/types/modules/skill.ts` | `IDefaultSkillPreview` / `IDefaultSkillImportResult` |
| Modify | `apps/skill-platform/src/types/constants/ipc-channels.ts` | 两个新通道 |
| Modify | `apps/skill-platform/src/main/ipc/skill/crud-handlers.ts` | 注册 IPC |
| Modify | `apps/skill-platform/src/main/ipc/index.ts` | 白名单（若有） |
| Modify | `apps/skill-platform/src/preload/api/skill.ts` | preload API |
| Modify | `apps/skill-platform/src/renderer/services/skill/api/index.ts` | renderer API |
| Modify | `apps/skill-platform/electron-builder.json` | 打包 default 目录 |
| Modify | `CreateSkillModeSelect.tsx` | 新入口 |
| Modify | `CreateSkillModal/types.ts` | `ECreateMode` |
| Modify | `useCreateSkillModal.ts` | default 模式逻辑 |
| Modify | `CreateSkillModal/index.tsx` | 渲染 default 面板 |
| Modify | `SkillScanPreview/index.tsx` | 支持 default-import 变体 |

---

### Task 1: 类型与 IPC 通道

**Files:**
- Modify: `apps/skill-platform/src/types/modules/skill.ts`
- Modify: `apps/skill-platform/src/types/constants/ipc-channels.ts`

- [ ] **Step 1: 在 skill.ts 末尾增加类型**

```typescript
export interface IDefaultSkillPreview {
  zipFileName: string;
  name: string;
  description: string;
  version?: string;
  author: string;
  tags: string[];
  instructions: string;
  extractDir: string;
  isInstalled: boolean;
  existingSkillId?: string;
}

export interface IDefaultSkillImportResult {
  imported: number;
  overwritten: number;
  skipped: number;
  failed: Array<{ zipFileName: string; reason: string }>;
}
```

- [ ] **Step 2: 增加 IPC 常量**

在 `ipc-channels.ts` 的 skill 区域添加：

```typescript
SKILL_LIST_DEFAULT_SKILLS: 'skill:listDefaultSkills',
SKILL_IMPORT_DEFAULT_SKILLS: 'skill:importDefaultSkills',
```

- [ ] **Step 3: 在 `apps/skill-platform/src/main/ipc/index.ts` 白名单数组中追加两个通道名（若项目有 channel 白名单）**

---

### Task 2: Main 服务 default-skills.ts

**Files:**
- Create: `apps/skill-platform/src/main/services/skill/default-skills.ts`
- Modify: `apps/skill-platform/src/main/services/skill/index.ts`
- Create: `apps/skill-platform/default/skills/.gitkeep`

- [ ] **Step 1: 创建目录占位**

`apps/skill-platform/default/skills/.gitkeep`（空文件）

- [ ] **Step 2: 实现 getDefaultSkillsDir 与 zip 解压辅助**

参考 `skillhub-archive.ts`，实现：

```typescript
import fs from 'fs/promises';
import path from 'path';
import { unzipSync } from 'fflate';
import { getProjectRoot, getAppTempDir } from '../../runtime-paths';
import { parseSkillMd } from './safety/validator';
import { saveToLocalRepo } from './installer/repo';
import type { SkillDB } from '../../database';
import type {
  DCreateSkill,
  IDefaultSkillImportResult,
  IDefaultSkillPreview,
} from '@/types/modules';

export function getDefaultSkillsDir(): string {
  return path.join(getProjectRoot(), 'default', 'skills');
}

function getDefaultImportCacheDir(zipFileName: string): string {
  const base = zipFileName.replace(/\.zip$/i, '');
  return path.join(getAppTempDir(), 'default-import', base);
}

// normalizeZipEntryPath、stripCommonZipRootPrefix、extractZipToDir
// 逻辑与 skillhub-archive.ts 一致
```

- [ ] **Step 3: 实现 listDefaultSkillPreviews**

```typescript
export async function listDefaultSkillPreviews(db: SkillDB): Promise<IDefaultSkillPreview[]> {
  const dir = getDefaultSkillsDir();
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }

  const zipFiles = entries.filter((f) => f.toLowerCase().endsWith('.zip'));
  const previews: IDefaultSkillPreview[] = [];

  for (const zipFileName of zipFiles) {
    try {
      const zipPath = path.join(dir, zipFileName);
      const buffer = await fs.readFile(zipPath);
      const extractDir = getDefaultImportCacheDir(zipFileName);
      await extractZipToDir(new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength), extractDir);

      const skillMdPath = await findSkillMdFile(extractDir);
      if (!skillMdPath) continue;

      const instructions = await fs.readFile(skillMdPath, 'utf-8');
      const parsed = parseSkillMd(instructions);
      if (!parsed?.frontmatter.name) continue;

      const name = parsed.frontmatter.name.trim();
      const existing = await db.getByName(name);

      previews.push({
        zipFileName,
        name,
        description: parsed.frontmatter.description ?? '',
        version: parsed.frontmatter.version,
        author: parsed.frontmatter.author ?? 'User',
        tags: parsed.frontmatter.tags ?? [],
        instructions,
        extractDir,
        isInstalled: Boolean(existing),
        existingSkillId: existing?.id,
      });
    } catch (err) {
      console.warn(`[default-skills] skip ${zipFileName}:`, err);
    }
  }

  return previews.sort((a, b) => a.name.localeCompare(b.name));
}
```

- [ ] **Step 4: 实现 importDefaultSkills**

```typescript
export async function importDefaultSkills(
  db: SkillDB,
  zipFileNames: string[],
  options: { overwrite: boolean },
): Promise<IDefaultSkillImportResult> {
  const previews = await listDefaultSkillPreviews(db);
  const previewMap = new Map(previews.map((p) => [p.zipFileName, p]));

  const result: IDefaultSkillImportResult = {
    imported: 0,
    overwritten: 0,
    skipped: 0,
    failed: [],
  };

  for (const zipFileName of zipFileNames) {
    const preview = previewMap.get(zipFileName);
    if (!preview) {
      result.failed.push({ zipFileName, reason: '预览数据不存在或 zip 无效' });
      continue;
    }

    try {
      if (preview.isInstalled && preview.existingSkillId) {
        if (!options.overwrite) {
          result.skipped += 1;
          continue;
        }
        await db.update(preview.existingSkillId, {
          description: preview.description,
          instructions: preview.instructions,
          content: preview.instructions,
          version: preview.version,
          author: preview.author,
          original_tags: preview.tags,
          source_url: `default://${preview.zipFileName}`,
        });
        const repoPath = await saveToLocalRepo(preview.name, preview.extractDir);
        await db.update(preview.existingSkillId, { local_repo_path: repoPath });
        result.overwritten += 1;
        continue;
      }

      const createData: DCreateSkill = {
        name: preview.name,
        description: preview.description,
        instructions: preview.instructions,
        content: preview.instructions,
        protocol_type: 'skill',
        version: preview.version,
        author: preview.author,
        tags: [],
        original_tags: preview.tags,
        is_favorite: false,
        source_url: `default://${preview.zipFileName}`,
      };
      const created = await db.create(createData);
      const repoPath = await saveToLocalRepo(preview.name, preview.extractDir);
      await db.update(created.id, { local_repo_path: repoPath });
      result.imported += 1;
    } catch (err) {
      result.failed.push({
        zipFileName,
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return result;
}
```

- [ ] **Step 5: 在 skill/index.ts 导出**

```typescript
export {
  getDefaultSkillsDir,
  listDefaultSkillPreviews,
  importDefaultSkills,
} from './default-skills';
```

---

### Task 3: IPC 与 Preload

**Files:**
- Modify: `apps/skill-platform/src/main/ipc/skill/crud-handlers.ts`
- Modify: `apps/skill-platform/src/preload/api/skill.ts`
- Modify: `apps/skill-platform/src/renderer/services/skill/api/index.ts`

- [ ] **Step 1: crud-handlers 注册**

```typescript
import { importDefaultSkills, listDefaultSkillPreviews } from '../../services/skill';

ipcMain.handle(IPC_CHANNELS.SKILL_LIST_DEFAULT_SKILLS, async () => {
  return listDefaultSkillPreviews(db);
});

ipcMain.handle(
  IPC_CHANNELS.SKILL_IMPORT_DEFAULT_SKILLS,
  async (_, zipFileNames: string[], options: { overwrite: boolean }) => {
    if (!Array.isArray(zipFileNames)) {
      throw new Error('skill:importDefaultSkills expects zipFileNames array');
    }
    return importDefaultSkills(db, zipFileNames, { overwrite: Boolean(options?.overwrite) });
  },
);
```

- [ ] **Step 2: preload**

```typescript
listDefaultSkills: () => ipcRenderer.invoke(IPC_CHANNELS.SKILL_LIST_DEFAULT_SKILLS),
importDefaultSkills: (zipFileNames: string[], options: { overwrite: boolean }) =>
  ipcRenderer.invoke(IPC_CHANNELS.SKILL_IMPORT_DEFAULT_SKILLS, zipFileNames, options),
```

- [ ] **Step 3: renderer api**

```typescript
export function listDefaultSkills() {
  return requireSkillIpc().listDefaultSkills();
}

export function importDefaultSkills(zipFileNames: string[], options: { overwrite: boolean }) {
  return requireSkillIpc().importDefaultSkills(zipFileNames, options);
}
```

---

### Task 4: 打包配置

**Files:**
- Modify: `apps/skill-platform/electron-builder.json`

- [ ] **Step 1: files 数组增加 default 目录**

```json
"files": ["dist/**/*", "appConf.cjs", "static/**/*", "server/**/*", "default/**/*", "!**/*.map"]
```

---

### Task 5: SkillScanPreview 支持 default-import 变体

**Files:**
- Modify: `apps/skill-platform/src/renderer/components/Skill/SkillScanPreview/index.tsx`

- [ ] **Step 1: 扩展 IProps**

```typescript
interface IProps {
  scannedSkills: IScannedSkill[];
  installedPaths?: Set<string>;
  /** default-import 模式：按名称标记已安装，隐藏重扫/路径面板 */
  variant?: 'local-scan' | 'default-import';
  installedNames?: Set<string>;
  onImport: (skills: IScannedSkill[], userTagsByPath?: Record<string, string[]>) => Promise<number>;
  onRescan?: (customPaths: string[]) => Promise<void>;
  onClose: () => void;
}
```

- [ ] **Step 2: isInstalled 逻辑**

```typescript
const allSkills = useMemo(() => {
  return scannedSkills.map((skill) => ({
    ...skill,
    isInstalled:
      variant === 'default-import'
        ? (installedNames?.has(skill.name.toLowerCase()) ?? false)
        : (installedPaths?.has(skill.localPath) ?? false),
  }));
}, [scannedSkills, installedPaths, installedNames, variant]);
```

- [ ] **Step 3: `variant === 'default-import'` 时**

- 不渲染「添加扫描路径 / 重新扫描」面板
- 标题文案改为「选择要导入的默认技能」
- `onRescan` 改为 optional，local-scan 模式仍必填

---

### Task 6: CreateSkillModal UI 与逻辑

**Files:**
- Modify: `CreateSkillModal/types.ts`
- Modify: `CreateSkillModeSelect.tsx`
- Modify: `useCreateSkillModal.ts`
- Modify: `CreateSkillModal/index.tsx`
- Create: `CreateSkillDefaultIntro.tsx`（可选小组件，或内联）

- [ ] **Step 1: types.ts**

```typescript
export type ECreateMode = 'select' | 'github' | 'manual' | 'scan' | 'ai' | 'default';
```

- [ ] **Step 2: CreateSkillModeSelect 增加按钮**

在「扫描本地」下方增加：

```tsx
<Button ... onClick={() => onSelectMode('default')}>
  <PackageIcon ... />
  <h3>导入默认</h3>
  <p>从应用内置技能包快速导入</p>
</Button>
```

`getCreateSkillModalTitle` 增加 `case 'default': return '导入默认';`

- [ ] **Step 3: useCreateSkillModal 状态与 handler**

```typescript
const [defaultPreviews, setDefaultPreviews] = useState<IDefaultSkillPreview[]>([]);
const [isLoadingDefault, setIsLoadingDefault] = useState(false);
const [showDefaultPreview, setShowDefaultPreview] = useState(false);

const defaultScanResults: IScannedSkill[] = useMemo(
  () =>
    defaultPreviews.map((p) => ({
      name: p.name,
      description: p.description,
      version: p.version,
      author: p.author,
      tags: p.tags,
      instructions: p.instructions,
      filePath: pathJoin(p.extractDir, 'SKILL.md'), // 或用占位，preview 不读 file
      localPath: `default:${p.zipFileName}`,
      platforms: ['default'],
    })),
  [defaultPreviews],
);

const installedDefaultNames = useMemo(
  () => new Set(defaultPreviews.filter((p) => p.isInstalled).map((p) => p.name.toLowerCase())),
  [defaultPreviews],
);

const handleLoadDefaultSkills = async () => {
  setIsLoadingDefault(true);
  setError(null);
  try {
    const previews = await listDefaultSkills();
    if (previews.length === 0) {
      setError('暂无默认技能包');
      return;
    }
    setDefaultPreviews(previews);
    setShowDefaultPreview(true);
  } catch (err) {
    setError('加载默认技能失败：' + String(err));
  } finally {
    setIsLoadingDefault(false);
  }
};

const handleDefaultImport = async (skills: IScannedSkill[]) => {
  const zipFileNames = skills.map((s) => s.localPath.replace(/^default:/, ''));
  const duplicateCount = skills.filter((s) =>
    installedDefaultNames.has(s.name.toLowerCase()),
  ).length;

  let overwrite = false;
  if (duplicateCount > 0) {
    overwrite = await new Promise<boolean>((resolve) => {
      Modal.confirm({
        title: '覆盖已有技能？',
        content: `选中的技能中有 ${duplicateCount} 个与库中已有技能同名，是否覆盖？覆盖将替换本地文件和 SKILL.md 内容，此操作不可撤销。`,
        okText: '全部覆盖',
        cancelText: '跳过同名',
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  }

  const result = await importDefaultSkills(zipFileNames, { overwrite });
  await useSkillStore.getState().loadSkills();

  const msg = `成功 ${result.imported}，覆盖 ${result.overwritten}，跳过 ${result.skipped}，失败 ${result.failed.length}`;
  // toast 或 setGithubImportNotice 风格提示
  if (result.failed.length === 0 && result.imported + result.overwritten > 0) {
    handleClose();
  }
  return result.imported + result.overwritten;
};
```

- [ ] **Step 4: CreateSkillModal/index.tsx**

- `mode === 'default' && !showDefaultPreview` → 展示 intro +「加载默认技能」按钮
- `showDefaultPreview` → 渲染 `SkillScanPreview`，`variant='default-import'`，`installedNames={installedDefaultNames}`

- [ ] **Step 5: handleClose 重置 default 相关 state**

---

### Task 7: 手动验证

- [ ] **Step 1: 准备测试 zip**

在 `default/skills/` 放入一个有效 skill zip（可从应用内 exportZip 导出）。

- [ ] **Step 2: 开发环境验证**

```bash
cd apps/skill-platform && pnpm dev
```

1. 新建技能 → 导入默认 → 看到预览列表
2. 导入新技能 → 出现在「我的技能」
3. 再次导入同名 → 弹出覆盖确认；取消则跳过；确认则内容更新

- [ ] **Step 3: 类型检查**

```bash
cd apps/skill-platform && pnpm exec tsc --noEmit
```

Expected: 无新增类型错误

---

## Spec 覆盖自检

| Spec 要求 | 对应 Task |
|-----------|-----------|
| default/skills 目录 | Task 2 |
| 打包 default | Task 4 |
| 预览 + 勾选 | Task 5, 6 |
| 同名覆盖确认 | Task 6 handleDefaultImport |
| Main 解压 + 导入 | Task 2, 3 |
| 边界：空目录、无效 zip | Task 2 list 跳过 + UI 提示 |
| IPC 双通道 | Task 1, 3 |

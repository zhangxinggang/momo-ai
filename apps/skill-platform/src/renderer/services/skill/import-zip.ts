import type {
  ILocalZipFileInput,
  ILocalZipImportItem,
  ILocalZipImportResult,
} from '@/types/modules';
import { Modal } from 'antd';

import { importLocalSkillZips, previewLocalSkillZips } from './api';

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('读取文件失败'));
        return;
      }
      const commaIndex = result.indexOf(',');
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error('读取文件失败'));
    reader.readAsDataURL(file);
  });
}

function isSkillMdFileName(fileName: string): boolean {
  return fileName.toLowerCase() === 'skill.md';
}

function collectImportFiles(fileList: FileList | File[]): File[] {
  return Array.from(fileList).filter((file) => {
    const lowerName = file.name.toLowerCase();
    return lowerName.endsWith('.zip') || isSkillMdFileName(file.name);
  });
}

function confirmOverwrite(skillName: string, fileName: string): Promise<boolean> {
  return new Promise((resolve) => {
    Modal.confirm({
      title: '覆盖已有技能？',
      content: `技能「${skillName}」（来自 ${fileName}）与库中已有技能同名。是否删除原有技能并导入新版本？`,
      okText: '覆盖',
      cancelText: '跳过',
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}

/** 将选中/拖入的 zip 或 SKILL.md 导入为我的 Skills；同名逐个确认是否覆盖 */
export async function importSkillZipFiles(fileList: FileList | File[]): Promise<ILocalZipImportResult> {
  const importFiles = collectImportFiles(fileList);
  if (importFiles.length === 0) {
    return { imported: 0, overwritten: 0, skipped: 0, failed: [] };
  }

  const inputs: ILocalZipFileInput[] = [];
  for (const file of importFiles) {
    try {
      const base64 = await readFileAsBase64(file);
      inputs.push({ fileName: file.name, base64 });
    } catch (err) {
      return {
        imported: 0,
        overwritten: 0,
        skipped: 0,
        failed: [
          {
            fileName: file.name,
            reason: err instanceof Error ? err.message : String(err),
          },
        ],
      };
    }
  }

  const previews = await previewLocalSkillZips(inputs);
  const inputByName = new Map(inputs.map((item) => [item.fileName, item]));
  const importItems: ILocalZipImportItem[] = [];
  const failed: ILocalZipImportResult['failed'] = [];

  for (const preview of previews) {
    const input = inputByName.get(preview.fileName);
    if (!input) {
      failed.push({ fileName: preview.fileName, reason: '找不到对应的文件数据' });
      continue;
    }
    if (preview.error) {
      failed.push({ fileName: preview.fileName, reason: preview.error });
      continue;
    }

    let overwrite = false;
    if (preview.isInstalled) {
      overwrite = await confirmOverwrite(preview.name, preview.fileName);
    }
    importItems.push({ ...input, overwrite });
  }

  if (importItems.length === 0) {
    return { imported: 0, overwritten: 0, skipped: 0, failed };
  }

  const result = await importLocalSkillZips(importItems);
  return {
    ...result,
    failed: [...failed, ...result.failed],
  };
}

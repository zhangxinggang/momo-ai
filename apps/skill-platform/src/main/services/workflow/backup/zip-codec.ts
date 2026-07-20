import type {
  IPrompt,
  IWorkflowTemplateManifest,
  IWorkflowTemplatePackagePayload,
  IWorkflowTemplateSkillFile,
  IWorkflowTemplateWorkflowFile,
} from '@/types/modules';
import { strToU8, unzipSync, zipSync } from 'fflate';

const MANIFEST_PATH = 'manifest.json';
const WORKFLOW_PATH = 'workflow.json';
const PROMPTS_PREFIX = 'prompts/';
const SKILLS_PREFIX = 'skills/';

function encodeJson(value: unknown): Uint8Array {
  return strToU8(JSON.stringify(value, null, 2));
}

function decodeJson<T>(bytes: Uint8Array): T {
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}

/** 将模板包编码为 zip 字节 */
export function encodeWorkflowTemplateZip(payload: IWorkflowTemplatePackagePayload): Uint8Array {
  const files: Record<string, Uint8Array> = {
    [MANIFEST_PATH]: encodeJson(payload.manifest),
    [WORKFLOW_PATH]: encodeJson(payload.workflow),
  };

  for (const prompt of payload.prompts) {
    files[`${PROMPTS_PREFIX}${prompt.id}.json`] = encodeJson(prompt);
  }

  for (const entry of payload.skills) {
    const skillId = entry.skill.id;
    const skillFile: IWorkflowTemplateSkillFile = {
      skill: entry.skill,
      filePaths: Object.keys(entry.files).sort(),
    };
    files[`${SKILLS_PREFIX}${skillId}/skill.json`] = encodeJson(skillFile);
    for (const [relativePath, content] of Object.entries(entry.files)) {
      const normalized = relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
      if (!normalized) {
        continue;
      }
      files[`${SKILLS_PREFIX}${skillId}/files/${normalized}`] = content;
    }
  }

  return zipSync(files, { level: 1 });
}

/** 从 zip 字节解码模板包 */
export function decodeWorkflowTemplateZip(bytes: Uint8Array): IWorkflowTemplatePackagePayload {
  let unzipped: Record<string, Uint8Array>;
  try {
    unzipped = unzipSync(bytes);
  } catch {
    throw new Error('工作流模板包损坏或不是有效 zip');
  }

  const manifestBytes = unzipped[MANIFEST_PATH];
  if (!manifestBytes) {
    throw new Error('工作流模板包缺少 manifest.json');
  }
  const manifest = decodeJson<IWorkflowTemplateManifest>(manifestBytes);
  if (manifest.version !== 1 || manifest.kind !== 'workflow-template') {
    throw new Error('不支持的工作流模板包版本或格式');
  }

  const workflowBytes = unzipped[WORKFLOW_PATH];
  if (!workflowBytes) {
    throw new Error('工作流模板包缺少 workflow.json');
  }
  const workflow = decodeJson<IWorkflowTemplateWorkflowFile>(workflowBytes);

  const prompts: IPrompt[] = [];
  const skills: IWorkflowTemplatePackagePayload['skills'] = [];
  const skillIds = new Set<string>();

  for (const path of Object.keys(unzipped)) {
    if (path.startsWith(PROMPTS_PREFIX) && path.endsWith('.json')) {
      prompts.push(decodeJson<IPrompt>(unzipped[path]));
      continue;
    }
    const skillMatch = path.match(/^skills\/([^/]+)\/skill\.json$/);
    if (skillMatch) {
      skillIds.add(skillMatch[1]);
    }
  }

  for (const skillId of skillIds) {
    const skillJsonPath = `${SKILLS_PREFIX}${skillId}/skill.json`;
    const skillFile = decodeJson<IWorkflowTemplateSkillFile>(unzipped[skillJsonPath]);
    const filesPrefix = `${SKILLS_PREFIX}${skillId}/files/`;
    const files: Record<string, Uint8Array> = {};
    for (const [path, content] of Object.entries(unzipped)) {
      if (path.startsWith(filesPrefix)) {
        const relative = path.slice(filesPrefix.length);
        if (relative) {
          files[relative] = content;
        }
      }
    }
    skills.push({ skill: skillFile.skill, files });
  }

  return { manifest, workflow, prompts, skills };
}

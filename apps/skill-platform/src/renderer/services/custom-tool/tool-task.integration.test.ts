import type { RuntimeTurnInput } from '@momo/agent-contracts';
import { beforeEach, expect, it, vi } from 'vitest';
import { listAgentAppSlash, prepareAgentAppSubmit } from '../../../main/services/agent-app';
import { executeFileTask } from './tool-task';

const state = vi.hoisted(() => ({
  skill: {
    id: 'tender',
    name: 'tender-document-parser',
    instructions: '按十个模块分析本次原件，保留原文出处。',
    protocol_type: 'skill',
    is_favorite: false,
    created_at: 1,
    updated_at: 1,
  },
  received: undefined as RuntimeTurnInput | undefined,
  expanded: '',
  beforeValidate: undefined as (() => void) | undefined,
}));
vi.mock('../../../main/database', () => ({
  SkillDB: class {
    async getAll() {
      return [state.skill];
    }
    async getById(id: string) {
      return id === state.skill.id ? state.skill : null;
    }
  },
}));
vi.mock('../../../main/services/skill/installer/utils', () => ({
  getPlatformGlobalRulePath: () => '',
}));
vi.mock('@momo/aichat', async () => ({
  ...(await import('../../../../../../packages/momo-aichat/src/utils/slash-token')),
  emptyProjection: () => ({ content: '', events: [], status: 'running' }),
  executeRuntimeTurn: async (_port: unknown, input: RuntimeTurnInput) => {
    state.received = input;
    state.beforeValidate?.();
    const prepared = await prepareAgentAppSubmit({
      folderPaths: input.folderPaths,
      content: input.apiInput!,
      displayContent: input.displayInput,
      invocations: input.invocations as never,
    });
    if (prepared.action === 'deny') throw new Error(prepared.reason);
    state.expanded = prepared.content || '';
    return { status: 'completed', content: 'root = PlainText("本次文件分析完成")', events: [] };
  },
}));
vi.mock('@renderer/services/agent-runtime/client', () => ({
  harnessPort: {},
  resourceContext: () => ({ projectId: 'project', folderPaths: [], resourceAgentAppIds: [] }),
}));
vi.mock('@renderer/services/agent-app/api', () => ({
  listAgentAppSlashCommands: () => listAgentAppSlash([], []),
}));
vi.mock('@renderer/services/aichat/runtime-view', () => ({
  getRuntimeViewPrompt: () => '',
  projectRuntimeView: (content: string) => ({ content, status: 'complete' }),
}));

const task = () => ({
  sessionId: 'file-task',
  projectId: 'project',
  modelId: 'model',
  skill: 'tender-document-parser',
  instruction: '解析上传文件',
  source: {
    sourceId: 'original',
    revision: '1',
    name: '招标文件.docx',
    size: 10,
    mimeType: 'application/octet-stream',
    encoding: 'base64' as const,
  },
  signal: new AbortController().signal,
  onUpdate: vi.fn(),
});
beforeEach(() => {
  state.received = undefined;
  state.expanded = '';
  state.beforeValidate = undefined;
  state.skill.instructions = '按十个模块分析本次原件，保留原文出处。';
});

it('passes a catalog-bound file task through the actual main-process resource expansion', async () => {
  await expect(executeFileTask(task())).resolves.toMatchObject({ status: 'completed' });
  expect(state.received!.invocations[0].token).toBeTruthy();
  expect(state.received!.apiInput).toContain(state.received!.invocations[0].token);
  expect(state.received!.sourceRefs[0].name).toBe('招标文件.docx');
  expect(state.expanded).toContain('按十个模块分析本次原件');
  expect(state.expanded).toContain('解析上传文件');
  expect(state.expanded).not.toContain('@[slash:');
});

it('still rejects a resource changed after catalog selection', async () => {
  state.beforeValidate = () => {
    state.skill.instructions = '资源已更新';
  };
  await expect(executeFileTask(task())).rejects.toThrow('已被修改或删除');
});

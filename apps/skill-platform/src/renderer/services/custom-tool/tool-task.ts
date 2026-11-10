import type { ResourceInvocation, SourceRef } from '@momo/agent-contracts';
import { emptyProjection, executeRuntimeTurn, type RunProjection } from '@momo/aichat';
import { harnessPort, resourceContext } from '@renderer/services/agent-runtime/client';
import { listAgentAppSlashCommands } from '@renderer/services/agent-app/api';
import { getRuntimeViewPrompt, projectRuntimeView } from '@renderer/services/aichat/runtime-view';
import { buildCustomToolGenerationMessages, validateGeneratedView } from './generation';
import type { IChatGeneratedView } from '@momo/aichat';

export function projectToolDefinition(
  content: string,
  streaming: boolean,
  kind: 'openui' | 'html' = 'openui',
): IChatGeneratedView | undefined {
  if (kind === 'openui') return projectRuntimeView(content, streaming);
  const blocks = [
    ...content.matchAll(/^```html[^\S\r\n]*\r?\n([\s\S]*?)(?:^```[^\S\r\n]*$|$(?![\s\S]))/gm),
  ];
  const source =
    blocks.at(-1)?.[1]?.trim() ||
    (/^\s*(?:<!doctype\s+html|<html)\b/i.test(content) ? content.trim() : '');
  if (!source) return undefined;
  const error = !streaming
    ? blocks.length > 1
      ? '请仅输出一个 HTML 界面代码块'
      : validateGeneratedView(source, 'html')
    : null;
  return {
    kind,
    content: source,
    status: streaming ? 'generating' : error ? 'error' : 'complete',
    ...(error ? { errorMessage: error } : {}),
  };
}

export interface IToolTaskSnapshot {
  sessionId: string;
  projectId?: string;
  source?: SourceRef;
  sources?: SourceRef[];
  projection: RunProjection;
  error?: string;
}

/** Tool tasks use their own logical session but the same port, broker and events as AI chat. */
export async function executeToolTask(input: {
  sessionId: string;
  projectId?: string;
  modelId: string;
  agentId?: string;
  sources?: SourceRef[];
  submission?: { message: string; formState?: Record<string, unknown> };
  instruction: string;
  skill?: string;
  invocations?: ResourceInvocation[];
  purpose?: 'result' | 'definition';
  definitionKind?: 'openui' | 'html';
  signal: AbortSignal;
  onUpdate: (projection: RunProjection) => void;
}) {
  input.signal.throwIfAborted();
  const context = resourceContext(input.projectId);
  const invocations: ResourceInvocation[] = [...(input.invocations || [])];
  if (input.skill) {
    const command = '/' + input.skill.replace(/^\//, '');
    const catalog = await listAgentAppSlashCommands({
      agentAppIds: context.resourceAgentAppIds,
      folderPaths: context.folderPaths,
      query: input.skill,
    });
    const skill = catalog.items.find((item) => item.kind === 'skill' && item.command === command);
    if (!skill) throw new Error(`未找到技能 ${command}，请先在技能模块导入后重试`);
    invocations.push(skill);
  }
  const turnId = crypto.randomUUID();
  const content = [
    invocations[0]?.command,
    input.instruction,
    input.submission
      ? `用户操作：${input.submission.message}\n表单输入：${JSON.stringify(input.submission.formState || {})}`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n');
  const projection = await executeRuntimeTurn(
    harnessPort,
    {
      ...context,
      sessionId: input.sessionId,
      turnId,
      idempotencyKey: turnId,
      modelProfileId: input.modelId,
      agentId: input.agentId || 'momo-default',
      modeId: 'ask',
      permissionMode: 'workspace-write',
      rawIntent: content,
      displayInput: content,
      invocations,
      sourceRefs: input.sources || [],
      systemPrompt: [
        input.purpose === 'definition' && input.definitionKind === 'html'
          ? buildCustomToolGenerationMessages('', 'html', '')[0].content
          : getRuntimeViewPrompt(),
        input.purpose === 'definition'
          ? input.definitionKind === 'html'
            ? '本轮创建 HTML 工具定义。先执行所选技能所需的采集与工具调用，再输出唯一 html 围栏中的完整 HTML。HTML 在沙箱展示，不用空按钮冒充已经实现的 AI 执行；需要原生 AI 执行流程时使用 OpenUI 任务组件。宿主将校验保存当前定义。'
            : '本轮创建可复用工具定义。先执行所选技能所需的网页采集、研究与工具调用，再输出完整 OpenUI 定义。需要用户填表或文件后处理的功能使用 AgentTask 或 FileTask，由宿主实际执行；业务指令、可选技能与输入字段随用户要求定义，不预填尚未执行的结果。仅输出一个 openui 围栏，宿主将校验并保存为当前工具。'
          : '这是工具任务的结果阶段。请根据任务和表单输入调用需要的工具，输出真正的任务结果，不重复输入表单、AgentTask、FileTask 或步骤条。原文件如有由宿主展示。保留所选技能定义的模块与证据，无依据不得填演示数据。',
      ].join('\n\n'),
    },
    input.signal,
    input.onUpdate,
  );
  if (projection.status === 'failed') throw new Error(projection.error || '任务失败，请重试');
  if (projection.status === 'completed') {
    const view =
      input.purpose === 'definition'
        ? projectToolDefinition(projection.content, false, input.definitionKind)
        : projectRuntimeView(projection.content, false);
    if (!view || view.status === 'error')
      throw new Error(view?.errorMessage || '本轮未返回可展示的任务结果，请重试');
    if (input.purpose !== 'definition' && /\b(?:FileTask|AgentTask)\s*\(/.test(view.content))
      throw new Error('本轮返回了输入页，请重试生成任务结果');
  }
  return projection;
}

export function executeFileTask(
  input: Omit<Parameters<typeof executeToolTask>[0], 'sources'> & { source: SourceRef },
) {
  return executeToolTask({ ...input, sources: [input.source] });
}

export function taskSources(snapshot: IToolTaskSnapshot): SourceRef[] {
  const refs = [...(snapshot.sources || []), ...(snapshot.source ? [snapshot.source] : [])];
  for (const event of snapshot.projection.events) {
    if (event.type.startsWith('artifact.') && event.payload.sourceRef)
      refs.push(event.payload.sourceRef as SourceRef);
  }
  return [...new Map(refs.map((ref) => [ref.sourceId, ref])).values()];
}

export function newToolTask(): IToolTaskSnapshot {
  return { sessionId: `tool-task-${crypto.randomUUID()}`, projection: emptyProjection() };
}

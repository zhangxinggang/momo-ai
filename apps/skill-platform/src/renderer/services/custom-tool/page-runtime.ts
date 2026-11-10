import {
  parseToolResult,
  reportSchema,
  toolResultSourceId,
  type ToolPageAction,
} from '@/shared/tool-page';
import { emptyProjection } from '@momo/aichat';
import {
  harnessSourceStore,
  uploadHarnessAttachments,
} from '@renderer/services/agent-runtime/client';
import { useToolTaskStore } from '@renderer/store/tool-task';
import { toolTaskErrorMessage } from './task-error';
import { executeToolTask, newToolTask, taskSources } from './tool-task';

const running = new Map<string, AbortController>();
export function pageTaskKey(toolId: string, projectId: string | undefined, actions: unknown) {
  let hash = 2166136261;
  for (const char of JSON.stringify(actions)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return `page:${projectId || 'uncategorized'}:${toolId}:${hash >>> 0}`;
}
export const isPageTaskRunning = (key: string) => running.has(key);
export function stopPageTask(key: string) {
  running.get(key)?.abort();
}

/** Owns execution outside the page/frame lifecycle; menu changes do not abort runs. */
export async function runPageTask(input: {
  key: string;
  action: ToolPageAction;
  modelId: string;
  projectId?: string;
  fields?: Record<string, unknown>;
  files?: File[];
}) {
  if (running.has(input.key)) throw new Error('当前任务仍在处理中');
  const files = input.files || [];
  if (
    files.length > 10 ||
    files.some((file) => !(file instanceof File) || file.size > 10 * 1024 * 1024)
  )
    throw new Error('每次最多上传 10 个文件，每个文件不超过 10 MB');
  if (JSON.stringify(input.fields || {}).length > 100_000) throw new Error('输入内容过长');
  const controller = new AbortController();
  running.set(input.key, controller);
  const store = useToolTaskStore.getState();
  const previous = store.tasks[input.key];
  const initial = { ...newToolTask(), projectId: input.projectId, projection: emptyProjection() };
  store.setTask(input.key, initial);
  try {
    const uploads = files.length ? await uploadHarnessAttachments(files) : [];
    controller.signal.throwIfAborted();
    const sources = files.length
      ? uploads.flatMap((file) => (file.sourceRef ? [file.sourceRef] : []))
      : previous?.sources || [];
    if (files.length && sources.length !== files.length) throw new Error('文件上传不完整，请重试');
    const snapshot = { ...initial, sources };
    store.setTask(input.key, snapshot);
    const projection = await executeToolTask({
      sessionId: snapshot.sessionId,
      projectId: input.projectId,
      modelId: input.modelId,
      sources,
      instruction: input.action.instruction,
      skill: input.action.skill,
      submission: { message: input.action.title, formState: input.fields || {} },
      resultAction: input.action,
      signal: controller.signal,
      onUpdate: (projection) => store.setTask(input.key, { ...snapshot, projection }),
    });
    controller.signal.throwIfAborted();
    if (projection.status !== 'completed') throw new Error('处理已停止，可以重试');
    let content = projection.content;
    const resultId = toolResultSourceId(content);
    if (resultId) {
      const ref = taskSources({ ...snapshot, projection }).find((ref) => ref.sourceId === resultId);
      if (!ref || ref.size > 8 * 1024 * 1024) throw new Error('结果文件不可用或超过 8 MB');
      const [source] = await harnessSourceStore.load([ref]);
      controller.signal.throwIfAborted();
      if (!source || source.originalAvailable === false) throw new Error('结果文件不可读取');
      content =
        source.encoding === 'utf8'
          ? source.content
          : new TextDecoder().decode(Uint8Array.from(atob(source.content), (c) => c.charCodeAt(0)));
    }
    if (content.length > 8 * 1024 * 1024) throw new Error('结果数据超过 8 MB');
    const result = parseToolResult(content, input.action);
    if (input.action.result === 'report') {
      const refs = taskSources({ ...snapshot, projection });
      const report = reportSchema.parse(result);
      for (const section of report.sections)
        for (const group of section.groups)
          for (const block of group.blocks) {
            if (block.type === 'file' && !refs.some((ref) => ref.sourceId === block.sourceId))
              throw new Error('报告引用的文件尚未生成，请重试');
          }
    }
    store.setTask(input.key, { ...snapshot, projection, result });
    return result;
  } catch (error) {
    const latest = useToolTaskStore.getState().tasks[input.key] || initial;
    const message = controller.signal.aborted
      ? '任务已停止，可以重试'
      : toolTaskErrorMessage(error);
    store.setTask(input.key, {
      ...latest,
      error: message,
      projection: {
        ...latest.projection,
        status: controller.signal.aborted ? 'cancelled' : 'failed',
      },
    });
    throw new Error(message);
  } finally {
    running.delete(input.key);
    const latest = useToolTaskStore.getState().tasks[input.key];
    if (latest) store.setTask(input.key, { ...latest });
  }
}

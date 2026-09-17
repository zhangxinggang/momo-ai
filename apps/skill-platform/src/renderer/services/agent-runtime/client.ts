import type { ChatRuntimePort } from '@momo/agent-contracts';
import {
  createRuntimeChatStream,
  normalizeFolderPaths,
  type IAiChatServices,
  type IChatAttachment,
  type IChatSourceInput,
  type IChatSourceRef,
} from '@momo/aichat';
import { useChatProjectStore } from '@renderer/store/chat';
import { useSettingsStore } from '@renderer/store/settings';
export const harnessPort: ChatRuntimePort = {
  describe: () => window.api.agentRuntime.describe(),
  listAgents: () => window.api.agentRuntime.listAgents(),
  startTurn: async (input) => {
    const project = useChatProjectStore.getState().projects.find((p) => p.id === input.projectId);
    if (!project) throw new Error('对话项目不存在');
    // Await the current settings, including models restored from older renderer-only storage.
    await window.api.settings.set({ aiModels: useSettingsStore.getState().aiModels });
    await window.api.agentRuntime.syncProjects([project]);
    return window.api.agentRuntime.startTurn(input);
  },
  respond: (input) => window.api.agentRuntime.respond(input),
  cancel: (input) => window.api.agentRuntime.cancel(input),
  events: (runId, afterSeq) => window.api.agentRuntime.events(runId, afterSeq),
  onEvent: (listener) => window.api.agentRuntime.onEvent(listener),
  controlGoal: (sessionId, action) => window.api.agentRuntime.controlGoal(sessionId, action),
  exportSession: (sessionId) => window.api.agentRuntime.exportSession(sessionId),
  setPermission: (sessionId, mode) => window.api.agentRuntime.setPermission(sessionId, mode),
};
export function resourceContext(projectId?: string) {
  const state = useChatProjectStore.getState();
  const id = projectId ?? state.ensureUncategorizedProject();
  const project =
    state.projects.find((p) => p.id === id) ??
    useChatProjectStore.getState().projects.find((p) => p.id === id);
  return {
    projectId: id,
    folderPaths: project?.folderPaths ?? [],
    resourceAgentAppId: project?.agentAppId ?? undefined,
  };
}

/** 为工作流等独立对话入口建立可被主进程校验的 Harness 项目。 */
export function ensureHarnessResourceContext(name: string, folderPaths: string[]) {
  const store = useChatProjectStore.getState();
  const normalizedPaths = normalizeFolderPaths(folderPaths);
  const existing = store.projects.find(
    (project) =>
      project.name === name &&
      JSON.stringify(normalizeFolderPaths(project.folderPaths)) === JSON.stringify(normalizedPaths),
  );
  if (existing) {
    return {
      projectId: existing.id,
      folderPaths: existing.folderPaths,
      resourceAgentAppId: existing.agentAppId ?? undefined,
    };
  }
  const created = store.createProject(name, normalizedPaths);
  if (created.ok) {
    return {
      projectId: created.project.id,
      folderPaths: created.project.folderPaths,
      resourceAgentAppId: undefined,
    };
  }
  return resourceContext();
}
export const harnessSourceStore = {
  save: (sources: IChatSourceInput[]): Promise<IChatSourceRef[]> =>
    window.api.agentRuntime.saveSources(sources),
  load: (refs: IChatSourceRef[]) => window.api.agentRuntime.loadSources(refs),
};

export function createHarnessChatOverrides(options?: {
  getAgentId?: () => string;
  getResourceContext?: () => ReturnType<typeof resourceContext>;
}): Partial<IAiChatServices> {
  const runtime: NonNullable<IAiChatServices['runtime']> = {
    port: harnessPort,
    getAgentId: options?.getAgentId ?? (() => 'momo-default'),
    getResourceContext: options?.getResourceContext ?? resourceContext,
  };
  return {
    runtime,
    callAIChatStream: createRuntimeChatStream({
      runtime,
      saveChatSources: harnessSourceStore.save,
    }),
    saveChatSources: harnessSourceStore.save,
    loadChatSources: harnessSourceStore.load,
    uploadFiles: uploadHarnessAttachments,
  };
}
export async function uploadHarnessAttachments(
  files: File[],
  progress?: (index: number, progress: number) => void,
): Promise<IChatAttachment[]> {
  if (
    files.length > 10 ||
    files.some((f) => f.size > 10 * 1024 * 1024) ||
    files.reduce((n, f) => n + f.size, 0) > 50 * 1024 * 1024
  )
    throw new Error('最多 10 个附件，每个 10 MiB，总计 50 MiB');
  const result: IChatAttachment[] = [];
  for (const [index, file] of files.entries()) {
    progress?.(index, 5);
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1]);
      reader.onerror = () => reject(new Error('读取附件失败'));
      reader.readAsDataURL(file);
    });
    progress?.(index, 40);
    const binding = await window.api.agentRuntime.prepareAttachment({
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      data,
    });
    result.push({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      mime: file.type,
      ext: file.name.split('.').pop() ?? '',
      text: '',
      snippet: '',
      sourceRef: binding.ref,
      imageBase64: file.type.startsWith('image/') ? data : undefined,
    });
    progress?.(index, 100);
  }
  return result;
}

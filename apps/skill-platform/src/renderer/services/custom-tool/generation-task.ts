import type { ICustomToolGeneratedFile, ICustomToolRuntimeInfo } from '@/types/modules';
import { useCustomToolStore } from '@renderer/store/custom-tool';

import { activateCustomTool, writeCustomToolGeneratedFiles } from './api';

let nextGenerationId = 0;
const controllers = new Map<string, { id: number; controller: AbortController }>();

function getEntryContent(files: ICustomToolGeneratedFile[]): string {
  return files.find((file) => file.path === 'index.html')?.content ?? '';
}

export function isCustomToolGenerationActive(toolPath: string, generationId: number): boolean {
  const task = useCustomToolStore.getState().generationTasks[toolPath];
  return task?.id === generationId && task.status === 'generating';
}

export function beginCustomToolGeneration(
  toolPath: string,
  previousFiles: ICustomToolGeneratedFile[],
  controller: AbortController,
): number {
  const existing = controllers.get(toolPath);
  existing?.controller.abort();

  nextGenerationId += 1;
  const id = nextGenerationId;
  controllers.set(toolPath, { id, controller });
  useCustomToolStore.setState((state) => ({
    generationTasks: {
      ...state.generationTasks,
      [toolPath]: {
        id,
        status: 'generating',
        streamHtml: getEntryContent(previousFiles),
        previousFiles: previousFiles.map((file) => ({ ...file })),
        errorMessage: '',
      },
    },
  }));
  return id;
}

export function publishCustomToolGenerationHtml(
  toolPath: string,
  generationId: number,
  html: string,
): void {
  if (!html || !isCustomToolGenerationActive(toolPath, generationId)) {
    return;
  }
  useCustomToolStore.setState((state) => {
    const task = state.generationTasks[toolPath];
    if (task?.id !== generationId || task.status !== 'generating') {
      return state;
    }
    return {
      generationTasks: {
        ...state.generationTasks,
        [toolPath]: { ...task, streamHtml: html },
      },
      ...(state.selectedId === toolPath ? { editorContent: html } : {}),
    };
  });
}

export function updateCustomToolGenerationSnapshot(
  toolPath: string,
  generationId: number,
  previousFiles: ICustomToolGeneratedFile[],
): void {
  useCustomToolStore.setState((state) => {
    const task = state.generationTasks[toolPath];
    if (task?.id !== generationId || task.status !== 'generating') {
      return state;
    }
    return {
      generationTasks: {
        ...state.generationTasks,
        [toolPath]: {
          ...task,
          previousFiles: previousFiles.map((file) => ({ ...file })),
        },
      },
    };
  });
}

export async function completeCustomToolGeneration(
  toolPath: string,
  generationId: number,
  files: ICustomToolGeneratedFile[],
): Promise<boolean> {
  if (!isCustomToolGenerationActive(toolPath, generationId)) {
    return false;
  }

  const entryContent = getEntryContent(files);
  await writeCustomToolGeneratedFiles(toolPath, files, {
    activate: false,
    requireCallable: true,
  });
  if (!isCustomToolGenerationActive(toolPath, generationId)) {
    return false;
  }

  let runtimeInfo: ICustomToolRuntimeInfo | null = null;
  if (useCustomToolStore.getState().selectedId === toolPath) {
    runtimeInfo = await activateCustomTool(toolPath);
  }
  if (!isCustomToolGenerationActive(toolPath, generationId)) {
    return false;
  }

  controllers.delete(toolPath);
  useCustomToolStore.setState((state) => {
    const task = state.generationTasks[toolPath];
    if (task?.id !== generationId || task.status !== 'generating') {
      return state;
    }
    return {
      generationTasks: {
        ...state.generationTasks,
        [toolPath]: {
          ...task,
          status: 'done',
          streamHtml: entryContent,
          errorMessage: '',
        },
      },
      ...(state.selectedId === toolPath
        ? {
            editorContent: entryContent,
            savedContent: entryContent,
            previewRevision: state.previewRevision + 1,
            runtimeInfo,
            runtimeError: runtimeInfo?.errorMessage ?? '',
            isLoadingRuntime: false,
          }
        : {}),
    };
  });
  return true;
}

export function failCustomToolGeneration(
  toolPath: string,
  generationId: number,
  errorMessage: string,
): boolean {
  if (!isCustomToolGenerationActive(toolPath, generationId)) {
    return false;
  }
  controllers.delete(toolPath);
  useCustomToolStore.setState((state) => {
    const task = state.generationTasks[toolPath];
    if (task?.id !== generationId || task.status !== 'generating') {
      return state;
    }
    return {
      generationTasks: {
        ...state.generationTasks,
        [toolPath]: { ...task, status: 'error', errorMessage },
      },
    };
  });
  return true;
}

async function restorePreviousFiles(
  toolPath: string,
  previousFiles: ICustomToolGeneratedFile[],
): Promise<void> {
  await writeCustomToolGeneratedFiles(toolPath, previousFiles, { activate: false });
  const entryContent = getEntryContent(previousFiles);
  let runtimeInfo: ICustomToolRuntimeInfo | null = null;
  if (useCustomToolStore.getState().selectedId === toolPath) {
    runtimeInfo = await activateCustomTool(toolPath);
  }
  useCustomToolStore.setState((state) =>
    state.selectedId === toolPath
      ? {
          editorContent: entryContent,
          savedContent: entryContent,
          previewRevision: state.previewRevision + 1,
          runtimeInfo,
          runtimeError: runtimeInfo?.errorMessage ?? '',
          isLoadingRuntime: false,
        }
      : state,
  );
}

export async function cancelCustomToolGeneration(
  toolPath: string,
  options: { rollback: boolean; clearTask?: boolean },
): Promise<void> {
  const task = useCustomToolStore.getState().generationTasks[toolPath];
  if (!task) {
    return;
  }

  const activeController = controllers.get(toolPath);
  if (activeController?.id === task.id) {
    activeController.controller.abort();
    controllers.delete(toolPath);
  }

  useCustomToolStore.setState((state) => {
    const current = state.generationTasks[toolPath];
    if (current?.id !== task.id) {
      return state;
    }
    const generationTasks = { ...state.generationTasks };
    if (options.clearTask || options.rollback) {
      delete generationTasks[toolPath];
    } else {
      generationTasks[toolPath] = { ...current, status: 'stopped' };
    }
    return { generationTasks };
  });

  if (options.rollback) {
    await restorePreviousFiles(toolPath, task.previousFiles);
  }
}

export async function undoCustomToolGeneration(toolPath: string): Promise<void> {
  await cancelCustomToolGeneration(toolPath, { rollback: true, clearTask: true });
}

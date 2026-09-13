import type { ICustomToolRuntimeInfo } from '@/types/modules';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  activate: vi.fn(),
  write: vi.fn(),
}));

vi.mock('./api', () => ({
  activateCustomTool: mocks.activate,
  writeCustomToolGeneratedFiles: mocks.write,
}));

import { useCustomToolStore } from '@renderer/store/custom-tool';

import {
  beginCustomToolGeneration,
  cancelCustomToolGeneration,
  completeCustomToolGeneration,
  publishCustomToolGenerationHtml,
} from './generation-task';

const runtimeInfo: ICustomToolRuntimeInfo = {
  toolPath: 'folder/tool',
  status: 'running',
  previewUrl: 'http://127.0.0.1:3000/',
  serviceRuntime: 'none',
  permissions: { mcp: [], skills: [] },
};

describe('custom tool background generation task', () => {
  beforeEach(() => {
    mocks.activate.mockReset().mockResolvedValue(runtimeInfo);
    mocks.write.mockReset().mockResolvedValue(null);
    useCustomToolStore.setState({
      selectedId: null,
      editorContent: '',
      savedContent: '',
      generationTasks: {},
      runtimeInfo: null,
      runtimeError: '',
    });
  });

  it('continues publishing in the task without overwriting another selected tool', async () => {
    useCustomToolStore.setState({ selectedId: 'folder/other', editorContent: '<p>other</p>' });
    const controller = new AbortController();
    const id = beginCustomToolGeneration(
      'folder/tool',
      [{ path: 'index.html', content: '<p>old</p>' }],
      controller,
    );

    publishCustomToolGenerationHtml('folder/tool', id, '<p>stream</p>');
    expect(useCustomToolStore.getState().editorContent).toBe('<p>other</p>');
    expect(useCustomToolStore.getState().generationTasks['folder/tool'].streamHtml).toBe(
      '<p>stream</p>',
    );

    await completeCustomToolGeneration('folder/tool', id, [
      { path: 'index.html', content: '<p>done</p>' },
    ]);

    expect(mocks.write).toHaveBeenCalledWith(
      'folder/tool',
      [{ path: 'index.html', content: '<p>done</p>' }],
      { activate: false },
    );
    expect(mocks.activate).not.toHaveBeenCalled();
    expect(useCustomToolStore.getState().generationTasks['folder/tool'].status).toBe('done');
    expect(useCustomToolStore.getState().editorContent).toBe('<p>other</p>');
  });

  it('aborts, clears the record and restores the previous version on exit', async () => {
    useCustomToolStore.setState({
      selectedId: 'folder/tool',
      editorContent: '<p>old</p>',
      savedContent: '<p>old</p>',
    });
    const controller = new AbortController();
    const previousFiles = [{ path: 'index.html', content: '<p>old</p>' }];
    const id = beginCustomToolGeneration('folder/tool', previousFiles, controller);
    publishCustomToolGenerationHtml('folder/tool', id, '<p>partial</p>');

    await cancelCustomToolGeneration('folder/tool', { rollback: true, clearTask: true });

    expect(controller.signal.aborted).toBe(true);
    expect(mocks.write).toHaveBeenCalledWith('folder/tool', previousFiles, { activate: false });
    expect(mocks.activate).toHaveBeenCalledWith('folder/tool');
    expect(useCustomToolStore.getState().generationTasks['folder/tool']).toBeUndefined();
    expect(useCustomToolStore.getState().editorContent).toBe('<p>old</p>');
    expect(useCustomToolStore.getState().savedContent).toBe('<p>old</p>');
  });
});

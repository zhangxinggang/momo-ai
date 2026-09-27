// @vitest-environment jsdom
import { App } from 'antd';
import React, { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { IAiChatServices } from '../../../../../../../packages/momo-aichat/src/adapters/types';
import { AiChatView } from '../../../../../../../packages/momo-aichat/src/components/AiChatView';
import {
  ChatProvider,
  useChatContext,
} from '../../../../../../../packages/momo-aichat/src/contexts/ChatContext';
import { executeRuntimeTurn } from '../../../../../../../packages/momo-aichat/src/runtime/execute';
import { emptyProjection } from '../../../../../../../packages/momo-aichat/src/runtime/projection';
import { createMemoryChatStorage } from '../../../../../../../packages/momo-aichat/src/storage/chat-storage';
import { buildStorageKeys } from '../../../../../../../packages/momo-aichat/src/types/chat';
import { ChatGeneratedView } from './index';

vi.mock('@momo/aichat', () => ({ MarkdownRenderer: () => null }));
vi.mock('@momo/file-editor', () => ({ BinaryFilePreview: () => null }));
vi.mock('@renderer/services/agent-runtime/client', () => ({
  harnessSourceStore: { load: vi.fn() },
}));
vi.mock('@renderer/services/system', () => ({ fetchFilePreviewBaseUrl: vi.fn() }));
vi.mock('@renderer/components/ui/MarkdownPreview', () => ({ MarkdownPreview: () => null }));
vi.mock('../../../../../../../packages/momo-aichat/src/runtime/execute', () => ({
  executeRuntimeTurn: vi.fn(),
}));
vi.mock('../../../../../../../packages/momo-aichat/src/hooks/useChatSync', () => ({
  useChatSync: () => ({ isSyncing: false }),
}));
vi.mock('../../../../../../../packages/momo-aichat/src/components/MarkdownRenderer', () => ({
  default: ({ content }: any) => createElement('div', {}, content),
}));
vi.mock('../../../../../../../packages/momo-aichat/src/components/ChatInputPanel', () => ({
  default: (props: any) =>
    createElement(
      'div',
      { 'data-composer': true },
      props.attachments.map((file: any) => createElement('span', { key: file.id }, file.name)),
    ),
}));
vi.mock('../../../../../../../packages/momo-aichat/src/components/ChatContextBanner', () => ({
  ChatContextBanner: () => null,
}));
vi.mock('../../../../../../../packages/momo-aichat/src/components/MessageCopyAction', () => ({
  MessageCopyAction: () => null,
}));
vi.mock('../../../../../../../packages/momo-aichat/src/components/MessageUserActions', () => ({
  MessageUserActions: () => null,
}));
vi.mock('../../../../../../../packages/momo-aichat/src/components/RunTimeline', () => ({
  RunTimeline: () => null,
}));

const form = `root = Form("parse", buttons, [uploadControl, noteControl])
buttons = Buttons([start])
start = Button("开始解析附件")
uploadControl = FormControl("招标文件", upload)
upload = TextArea("file", "上传招标文件")
noteControl = FormControl("补充说明", note)
note = TextArea("note", "填写解析要求", 3)`;
const ref = {
  sourceId: 'source:old',
  revision: 'v1',
  name: '会话已有标书.docx',
  mimeType: 'application/octet-stream',
  encoding: 'base64' as const,
  size: 100,
};
let container: HTMLDivElement, root: Root, services: IAiChatServices;
let state: ReturnType<typeof useChatContext>;
function Probe() {
  state = useChatContext();
  return null;
}
beforeEach(async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('requestAnimationFrame', () => 0);
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  window.matchMedia = vi
    .fn()
    .mockReturnValue({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  vi.mocked(executeRuntimeTurn)
    .mockReset()
    .mockResolvedValue({
      ...emptyProjection(),
      status: 'completed',
      content: '已读取原文件并完成解析',
    });
  const storage = createMemoryChatStorage();
  const keys = buildStorageKeys('file-action');
  storage.setItem(keys.CURRENT_SESSION_ID, 'chat');
  storage.setItem(
    keys.CHAT_SESSIONS,
    JSON.stringify([
      {
        id: 'chat',
        title: '解析任务',
        createdAt: 1,
        updatedAt: 1,
        messages: [
          {
            id: 'task',
            role: 'user',
            content: '/tender-document-parser 解析文件',
            timestamp: 1,
            attachments: [
              {
                id: 'old',
                name: ref.name,
                ext: 'docx',
                size: ref.size,
                mime: ref.mimeType,
                sourceRef: ref,
              },
            ],
          },
          {
            id: 'interrupted',
            role: 'assistant',
            content: '应用重启中断了上一轮执行',
            isError: true,
            timestamp: 2,
          },
          { id: 'continue', role: 'user', content: '请继续', timestamp: 3 },
          {
            id: 'view',
            role: 'assistant',
            content: form,
            timestamp: 4,
            generatedView: { kind: 'openui', content: form, status: 'complete' },
          },
        ],
      },
    ]),
  );
  services = {
    storageKeyPrefix: 'file-action',
    chatStorage: storage,
    defaultModel: 'model',
    callAIChatStream: vi.fn(),
    validateLocalFiles: () => ({ ok: true }),
    uploadFiles: vi.fn(async (files) =>
      files.map((file) => ({
        id: 'new',
        name: file.name,
        size: file.size,
        mime: file.type,
        ext: 'docx',
        text: '',
        snippet: '',
        sourceRef: { ...ref, sourceId: 'source:new', name: file.name, size: file.size },
      })),
    ),
    saveChatSources: vi.fn(async (sources) => sources.map((source) => source.sourceRef!)),
    loadChatSources: vi.fn(async (refs) =>
      refs.map((source) => ({ ...source, content: '原文件字节' })),
    ),
    runtime: {
      port: { events: vi.fn().mockResolvedValue([]) } as never,
      getAgentId: () => 'agent',
      getResourceContext: () => ({ projectId: 'project', folderPaths: [] }),
    },
    viewGeneration: {
      generate: vi.fn(),
      render: (message, actions) =>
        createElement(ChatGeneratedView, {
          message,
          onSelectFiles: actions?.attachFiles,
          onSubmit: actions?.submit,
          busy: actions?.busy,
        }),
    },
  };
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () =>
    root.render(
      createElement(
        App,
        {},
        createElement(ChatProvider, {
          services,
          children: createElement(
            React.Fragment,
            {},
            createElement(Probe),
            createElement(AiChatView),
          ),
        }),
      ),
    ),
  );
  await act(async () => state.setAgentMode('ui'));
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});
const button = () =>
  Array.from(container.querySelectorAll('button')).find(
    (element) => element.textContent === '开始解析附件',
  )!;
async function fillNote() {
  const note = container.querySelector(
    'textarea[placeholder="填写解析要求"]',
  ) as HTMLTextAreaElement;
  expect(note).not.toBeNull();
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(
      note,
      '解析所有',
    );
    note.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

it('submits the real rendered parse button, form fields and selected original to Harness exactly once', async () => {
  expect(button()).toBeDefined();
  const file = new File(['new-original-bytes'], '本次选择的标书.docx');
  const picker = container.querySelector('input[type=file]')!;
  await act(async () => {
    Object.defineProperty(picker, 'files', { value: [file] });
    picker.dispatchEvent(new Event('change', { bubbles: true }));
  });
  expect(services.uploadFiles).toHaveBeenCalledWith([file], expect.any(Function));
  expect(container.querySelector('[data-composer]')?.textContent).toContain(file.name);
  await fillNote();
  await act(async () => {
    button().click();
    button().click();
  });
  expect(executeRuntimeTurn).toHaveBeenCalledTimes(1);
  const input = vi.mocked(executeRuntimeTurn).mock.calls[0][1];
  expect(input.apiInput).toContain('/tender-document-parser');
  expect(input.apiInput).toContain('解析所有');
  expect(input.displayInput).toBe('开始解析附件');
  expect(input.sourceRefs).toMatchObject([{ sourceId: 'source:new', name: file.name }]);
  expect(container.querySelector('[data-composer]')?.textContent).not.toContain(file.name);
  expect(container.textContent).toContain('已读取原文件并完成解析');
  expect(services.viewGeneration!.generate).not.toHaveBeenCalled();
});

it('parses the existing conversation attachment from the button without selecting or uploading again', async () => {
  await fillNote();
  await act(async () => button().click());
  const input = vi.mocked(executeRuntimeTurn).mock.calls[0][1];
  expect(input.sourceRefs).toEqual([ref]);
  expect(input.apiInput).toContain('解析所有');
  expect(services.uploadFiles).not.toHaveBeenCalled();
  expect(services.viewGeneration!.generate).not.toHaveBeenCalled();
});

it('shows a submit failure next to the button and retains the selected file for retry', async () => {
  const file = new File(['original'], '重试.docx');
  const picker = container.querySelector('input[type=file]')!;
  await act(async () => {
    Object.defineProperty(picker, 'files', { value: [file] });
    picker.dispatchEvent(new Event('change', { bubbles: true }));
  });
  vi.mocked(services.saveChatSources).mockRejectedValueOnce(new Error('保存失败'));
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  await act(async () => button().click());
  error.mockRestore();
  expect(container.textContent).toContain('暂未提交');
  expect(container.querySelector('[data-composer]')?.textContent).toContain(file.name);
  expect(executeRuntimeTurn).not.toHaveBeenCalled();
  await act(async () => button().click());
  expect(executeRuntimeTurn).toHaveBeenCalledOnce();
});

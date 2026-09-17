// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  uploadFiles: vi.fn(),
  validateLocalFiles: vi.fn(),
  messageError: vi.fn(),
  saveChatSources: vi.fn(),
  sendMessage: vi.fn(),
}));
vi.mock('antd', () => ({
  App: { useApp: () => ({ message: { error: mocks.messageError }, modal: {} }) },
}));
vi.mock('@ant-design/icons', () => ({ LoadingOutlined: () => null }));
vi.mock('../../contexts/AiChatConfigContext', () => ({
  useAiChatConfig: () => ({
    uploadFiles: mocks.uploadFiles,
    validateLocalFiles: mocks.validateLocalFiles,
    saveChatSources: mocks.saveChatSources,
  }),
}));
vi.mock('../../contexts/ChatContext', () => ({
  useChatContext: () => ({
    currentSession: { id: 'session', messages: [] },
    currentSessionId: 'session',
    isSessionGenerating: () => false,
    sendMessage: mocks.sendMessage,
  }),
}));
vi.mock('../ChatInputPanel', async () => {
  const { createElement, forwardRef, useImperativeHandle } = await import('react');
  return {
    default: forwardRef((props: any, ref) => {
      useImperativeHandle(ref, () => ({ focus: vi.fn() }));
      return createElement(
        'div',
        { 'data-testid': 'composer', 'data-uploading': String(props.isUploading) },
        createElement('textarea', {
          placeholder: props.placeholder,
          value: props.value,
          onChange: (e: any) => props.onChange(e.target.value),
        }),
        createElement('button', { onClick: props.onSend }, '发送'),
        ...props.attachments.map((file: any) =>
          createElement(
            'span',
            { key: file.id, 'data-attachment': file.id },
            file.name,
            createElement(
              'button',
              {
                'aria-label': '移除 ' + file.name,
                onClick: () => props.onRemoveAttachment(file.id),
              },
              '移除',
            ),
          ),
        ),
      );
    }),
  };
});
vi.mock('../ChatContextBanner', () => ({ ChatContextBanner: () => null }));
vi.mock('../MarkdownRenderer', () => ({ default: () => null }));
vi.mock('../CollapsibleThinking', () => ({ default: () => null }));
vi.mock('../CitationCard', () => ({ default: () => null }));
vi.mock('../RunTimeline', () => ({ RunTimeline: () => null }));
vi.mock('../MessageCopyAction', () => ({ MessageCopyAction: () => null }));
vi.mock('../MessageUserActions', () => ({ MessageUserActions: () => null }));
vi.mock('../NoteReferenceText', () => ({ NoteReferenceText: () => null }));

import { AiChatView } from './index';

function attachment(file: File) {
  return {
    id: 'uploaded-' + file.name,
    name: file.name,
    size: file.size,
    mime: file.type,
    ext: 'docx',
    text: '',
    snippet: '',
    sourceRef: {
      sourceId: 'source:' + file.name,
      revision: 'a'.repeat(64),
      name: file.name,
      encoding: 'base64' as const,
      mimeType: file.type,
      size: file.size,
      originalAvailable: true,
    },
  };
}

function drag(target: Element, type: string, files: File[] = [], types = ['Files']) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'dataTransfer', { value: { files, types, dropEffect: 'none' } });
  target.dispatchEvent(event);
  return event;
}

let container: HTMLDivElement;
let root: Root;
let file: File;

beforeEach(async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('requestAnimationFrame', () => 0);
  mocks.messageError.mockReset();
  mocks.saveChatSources
    .mockReset()
    .mockImplementation(async (sources) => sources.map((s: any) => s.sourceRef));
  mocks.sendMessage.mockReset().mockResolvedValue(true);
  mocks.validateLocalFiles.mockReset().mockReturnValue({ ok: true });
  mocks.uploadFiles.mockReset().mockImplementation(async (files: File[]) => files.map(attachment));
  file = new File(['Office document bytes'], '需求文档.docx', {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () =>
    root.render(React.createElement(AiChatView, { inputValue: '请提取项目概述和评分标准' })),
  );
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe('chat file drag and drop', () => {
  it('uploads directly when a file is dropped onto the input', async () => {
    const input = container.querySelector('textarea')!;
    await act(async () => {
      drag(input, 'dragenter');
      drag(input, 'dragover');
    });
    expect(container.textContent).toContain('拖放添加文件');
    let event: Event;
    await act(async () => {
      event = drag(input, 'drop', [file]);
    });
    expect(event!.defaultPrevented).toBe(true);
    expect(mocks.uploadFiles).toHaveBeenCalledExactlyOnceWith([file], expect.any(Function));
    expect(container.querySelector('[data-attachment]')?.getAttribute('data-attachment')).toBe(
      'uploaded-' + file.name,
    );
    expect(container.textContent).not.toContain('拖放添加文件');
    expect(
      container.querySelector('[data-testid="composer"]')?.getAttribute('data-uploading'),
    ).toBe('false');
  });

  it('does not show a drop overlay or upload in the result area', async () => {
    const messages = container.querySelector('[style]')!;
    await act(async () => {
      drag(messages, 'dragenter');
      drag(messages, 'dragover');
    });
    expect(container.textContent).not.toContain('拖放添加文件');
    await act(async () => {
      drag(messages, 'drop', [file]);
    });
    expect(mocks.uploadFiles).not.toHaveBeenCalled();
    expect(container.querySelector('[data-attachment]')).toBeNull();
  });

  it('sends the raw source reference without a parsed body', async () => {
    await act(async () => {
      drag(container.querySelector('textarea')!, 'drop', [file]);
    });
    await act(async () => {
      container.querySelector('button')!.click();
    });
    const ref = attachment(file).sourceRef;
    expect(mocks.saveChatSources).toHaveBeenCalledWith([
      expect.objectContaining({ sourceRef: ref, content: '' }),
    ]);
    expect(mocks.sendMessage).toHaveBeenCalledWith(
      expect.any(String),
      [expect.objectContaining({ sourceRef: ref, name: file.name })],
      expect.objectContaining({ sourceRefs: [ref] }),
    );
    expect(container.querySelector('[data-attachment]')).toBeNull();
  });

  it('shows a pending attachment until the raw upload completes', async () => {
    let resolve: (value: ReturnType<typeof attachment>[]) => void;
    mocks.uploadFiles.mockReturnValue(
      new Promise((res) => {
        resolve = res;
      }),
    );
    await act(async () => {
      drag(container.querySelector('textarea')!, 'drop', [file]);
    });
    expect(
      container.querySelector('[data-testid="composer"]')?.getAttribute('data-uploading'),
    ).toBe('true');
    expect(container.textContent).toContain(file.name);
    await act(async () => {
      container.querySelector('button')!.click();
    });
    expect(mocks.sendMessage).not.toHaveBeenCalled();
    expect(container.querySelector('textarea')!.value).toBe('请提取项目概述和评分标准');
    await act(async () => {
      resolve!([attachment(file)]);
    });
    expect(
      container.querySelector('[data-testid="composer"]')?.getAttribute('data-uploading'),
    ).toBe('false');
    expect(container.querySelector('[data-attachment]')?.getAttribute('data-attachment')).toBe(
      'uploaded-' + file.name,
    );
    await act(async () => {
      container.querySelector('button')!.click();
    });
    expect(mocks.sendMessage).toHaveBeenCalledWith(
      '请提取项目概述和评分标准',
      expect.any(Array),
      expect.objectContaining({ sourceRefs: [attachment(file).sourceRef] }),
    );
  });

  it('keeps sending blocked until every retained upload completes', async () => {
    const second = new File(['raw bytes'], 'second.docx', { type: file.type });
    let resolveFirst: (value: ReturnType<typeof attachment>[]) => void;
    let resolveSecond: (value: ReturnType<typeof attachment>[]) => void;
    mocks.uploadFiles
      .mockReturnValueOnce(
        new Promise((res) => {
          resolveFirst = res;
        }),
      )
      .mockReturnValueOnce(
        new Promise((res) => {
          resolveSecond = res;
        }),
      );
    await act(async () => {
      drag(container.querySelector('textarea')!, 'drop', [file]);
    });
    await act(async () => {
      drag(container.querySelector('textarea')!, 'drop', [second]);
    });
    await act(async () => {
      resolveFirst!([attachment(file)]);
    });
    expect(
      container.querySelector('[data-testid="composer"]')?.getAttribute('data-uploading'),
    ).toBe('true');
    await act(async () => {
      container.querySelector('button')!.click();
    });
    expect(mocks.sendMessage).not.toHaveBeenCalled();
    await act(async () => {
      resolveSecond!([attachment(second)]);
    });
    expect(
      container.querySelector('[data-testid="composer"]')?.getAttribute('data-uploading'),
    ).toBe('false');
    await act(async () => {
      container.querySelector('button')!.click();
    });
    expect(mocks.sendMessage).toHaveBeenCalledWith(
      '请提取项目概述和评分标准',
      expect.any(Array),
      expect.objectContaining({
        sourceRefs: [attachment(file).sourceRef, attachment(second).sourceRef],
      }),
    );
  });

  it('lets typed text send after removing a pending attachment and ignores its late result', async () => {
    let resolve: (value: ReturnType<typeof attachment>[]) => void;
    mocks.uploadFiles.mockReturnValue(
      new Promise((res) => {
        resolve = res;
      }),
    );
    await act(async () => {
      drag(container.querySelector('textarea')!, 'drop', [file]);
    });
    await act(async () => {
      container
        .querySelector('[aria-label]')!
        .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(
      container.querySelector('[data-testid="composer"]')?.getAttribute('data-uploading'),
    ).toBe('false');
    await act(async () => {
      container.querySelector('button')!.click();
    });
    expect(mocks.sendMessage).toHaveBeenCalledWith(
      '请提取项目概述和评分标准',
      [],
      expect.objectContaining({ sourceRefs: [] }),
    );
    await act(async () => {
      resolve!([attachment(file)]);
    });
    expect(container.querySelector('[data-attachment]')).toBeNull();
  });

  it('removes a failed attachment and reports the error', async () => {
    mocks.uploadFiles.mockRejectedValue(new Error('附件上传失败'));
    await act(async () => {
      drag(container.querySelector('textarea')!, 'drop', [file]);
    });
    expect(mocks.messageError).toHaveBeenCalledWith('附件上传失败');
    expect(container.querySelector('[data-attachment]')).toBeNull();
    expect(
      container.querySelector('[data-testid="composer"]')?.getAttribute('data-uploading'),
    ).toBe('false');
  });

  it('applies the same validation to dropped files', async () => {
    mocks.validateLocalFiles.mockReturnValue({ ok: false, message: '文件超过大小限制' });
    await act(async () => {
      drag(container.querySelector('textarea')!, 'drop', [file]);
    });
    expect(mocks.uploadFiles).not.toHaveBeenCalled();
    expect(mocks.messageError).toHaveBeenCalledWith('文件超过大小限制');
    expect(container.querySelector('[data-attachment]')).toBeNull();
  });

  it('preserves ordinary text drops', async () => {
    let event: Event;
    await act(async () => {
      event = drag(container.querySelector('textarea')!, 'drop', [], ['text/plain']);
    });
    expect(event!.defaultPrevented).toBe(false);
    expect(mocks.uploadFiles).not.toHaveBeenCalled();
  });

  it('does not upload files dropped outside the chat', async () => {
    await act(async () => {
      drag(document.body, 'drop', [file]);
    });
    expect(mocks.uploadFiles).not.toHaveBeenCalled();
  });
});

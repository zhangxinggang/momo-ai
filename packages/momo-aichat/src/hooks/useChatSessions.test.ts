// @vitest-environment jsdom
import type { RunEvent } from '@momo/agent-contracts';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { IAiChatServices } from '../adapters/types';
import { AiChatConfigProvider } from '../contexts/AiChatConfigContext';
import { executeRuntimeTurn } from '../runtime/execute';
import { emptyProjection } from '../runtime/projection';
import { createMemoryChatStorage } from '../storage/chat-storage';
import { buildStorageKeys, type IChatGeneratedView, type IChatSession } from '../types/chat';
import { buildSlashInvocationToken } from '../utils/slash-token';
import { useChatSessions } from './useChatSessions';

vi.mock('../runtime/execute', () => ({ executeRuntimeTurn: vi.fn() }));
vi.mock('./useChatSync', () => ({ useChatSync: () => ({ isSyncing: false }) }));

describe('chat interface mode history', () => {
  let container: HTMLDivElement;
  let root: Root;
  let state: ReturnType<typeof useChatSessions>;
  let services: IAiChatServices;
  const keys = buildStorageKeys('view-test');
  const original: IChatSession = {
    id: 'session-1',
    title: '已有对话',
    createdAt: 1,
    updatedAt: 1,
    noteSnapshots: {
      'old.md': {
        path: 'old.md',
        content: '旧引用',
        snapshotAt: 1,
        isTruncated: false,
        originalLength: 3,
      },
    },
    messages: [
      { id: 'old-user', role: 'user', content: '原来的问题', timestamp: 1 },
      { id: 'old-assistant', role: 'assistant', content: '原来的回复', timestamp: 2 },
    ],
  };
  const view = (content: string): IChatGeneratedView => ({
    kind: 'openui',
    content,
    status: 'complete',
  });
  function Probe() {
    state = useChatSessions();
    return null;
  }
  async function mount() {
    await act(async () =>
      root.render(
        React.createElement(AiChatConfigProvider, {
          services,
          children: React.createElement(Probe),
        }),
      ),
    );
  }
  async function send(content: string) {
    await act(async () => {
      await state.sendMessage(content);
    });
  }
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    vi.mocked(executeRuntimeTurn).mockReset();
    const chatStorage = createMemoryChatStorage();
    chatStorage.setItem(keys.CHAT_SESSIONS, JSON.stringify([original]));
    chatStorage.setItem(keys.CURRENT_SESSION_ID, original.id);
    services = {
      storageKeyPrefix: 'view-test',
      chatStorage,
      defaultModel: 'model-1',
      callAIChatStream: vi.fn(),
      uploadFiles: vi.fn(),
      validateLocalFiles: () => ({ ok: true }),
      saveChatSources: vi.fn(),
      loadChatSources: vi.fn().mockResolvedValue([]),
      runtime: {
        port: {
          events: vi.fn().mockResolvedValue([]),
          clearSession: vi.fn().mockResolvedValue(undefined),
        } as never,
        getAgentId: () => 'agent-1',
        getResourceContext: () => ({ projectId: 'project-1', folderPaths: [] }),
      },
      viewGeneration: {
        generate: vi.fn(async (_input, onUpdate) => {
          const result = view('root = TextContent("新版")');
          onUpdate(result);
          return result;
        }),
        render: () => null,
      },
    };
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    await mount();
    await act(async () => state.setAgentMode('ui'));
  });
  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('appends every UI turn, retains old messages across mode changes, and restores previews', async () => {
    await send('生成一个看板');
    const firstView = state.currentSession!.messages.at(-1)!;
    await send('增加筛选');
    expect(state.currentSession!.messages).toHaveLength(6);
    expect(state.currentSession!.messages.slice(0, 2)).toEqual(original.messages);
    expect(state.currentSession!.messages[3]).toEqual(firstView);
    expect(services.viewGeneration!.generate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        currentView: firstView.generatedView,
        history: expect.arrayContaining([{ role: 'user', content: '生成一个看板' }]),
      }),
      expect.any(Function),
    );
    expect(executeRuntimeTurn).not.toHaveBeenCalled();
    expect(services.callAIChatStream).not.toHaveBeenCalled();
    await act(async () => state.setAgentMode('plan'));
    expect(state.currentSession!.messages).toHaveLength(6);
    await act(async () => vi.advanceTimersByTime(600));
    await act(async () => root.unmount());
    root = createRoot(container);
    await mount();
    expect(state.currentSession!.messages).toHaveLength(6);
    expect(state.currentSession!.messages[3].generatedView).toEqual(firstView.generatedView);
  });

  it('binds the draft project before the first message and preserves it on sending', async () => {
    const count = state.sessions.length;
    await act(async () => state.handleNewChatInProject('cursor-project'));
    expect(state.currentSession).toBeNull();
    expect(state.currentProjectId).toBe('cursor-project');
    expect(state.sessions).toHaveLength(count);
    await send('项目的第一条消息');
    expect(state.currentSession!.projectId).toBe('cursor-project');
    expect(state.currentProjectId).toBe('cursor-project');
    await act(async () => state.handleNewChatInProject('other-project'));
    expect(state.currentProjectId).toBe('other-project');
    await act(async () => state.switchToSession(original.id));
    expect(state.currentProjectId).toBeNull();
    await act(async () => state.handleNewChatInProject('cursor-project'));
    await act(async () => state.handleNewChat());
    expect(state.currentProjectId).toBeNull();
  });

  it('passes all selected Agent resource providers into the Harness request', async () => {
    services.runtime!.getResourceContext = (projectId) => ({
      projectId: projectId ?? 'project',
      folderPaths: ['/workspace'],
      resourceAgentAppIds: ['cursor', 'claude'],
    });
    vi.mocked(executeRuntimeTurn).mockResolvedValue({
      ...emptyProjection(),
      status: 'completed',
      content: 'done',
    });
    await act(async () => state.setAgentMode('ask'));
    await act(async () => state.handleNewChatInProject('multi-agent-project'));
    await send('review');
    expect(executeRuntimeTurn).toHaveBeenCalledWith(
      services.runtime!.port,
      expect.objectContaining({
        projectId: 'multi-agent-project',
        resourceAgentAppIds: ['cursor', 'claude'],
      }),
      expect.any(AbortSignal),
      expect.any(Function),
    );
  });

  it('uses the existing Harness plan path after selecting plan', async () => {
    vi.mocked(executeRuntimeTurn).mockResolvedValue({
      ...emptyProjection(),
      status: 'completed',
      content: '计划',
    });
    await act(async () => state.setAgentMode('plan'));
    await send('制定计划');
    expect(executeRuntimeTurn).toHaveBeenCalledWith(
      services.runtime!.port,
      expect.objectContaining({ modeId: 'plan' }),
      expect.any(AbortSignal),
      expect.any(Function),
    );
    expect(services.viewGeneration!.generate).not.toHaveBeenCalled();
    expect(state.currentSession!.messages.slice(0, 2)).toEqual(original.messages);
  });

  it.each(['skill', 'command'] as const)(
    'honors a selected %s in UI mode through Harness and freezes the execution path for retry',
    async (kind) => {
      const token = buildSlashInvocationToken({
        resourceId: 'tender-resource',
        resourceRevision: 'revision-1',
        command: '/tender-document-parser',
        kind,
        scope: 'project',
        agentAppId: 'cursor',
      });
      const sourceRef = {
        sourceId: 'source:original',
        revision: 'original-revision',
        name: '采购文件.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        encoding: 'base64' as const,
        size: 100,
        originalAvailable: true,
      };
      vi.mocked(services.loadChatSources).mockResolvedValue([{ ...sourceRef, content: 'bytes' }]);
      vi.mocked(executeRuntimeTurn)
        .mockResolvedValueOnce({ ...emptyProjection(), status: 'failed', error: '暂时失败' })
        .mockResolvedValueOnce({
          ...emptyProjection(),
          status: 'completed',
          content: '标书解析结果',
        });
      await act(async () => {
        await state.sendMessage(`${token} 解析文件`, undefined, { sourceRefs: [sourceRef] });
      });
      const user = state.currentSession!.messages.at(-2)!;
      expect(user.requestSnapshot?.agentMode).toBe('ask');
      expect(state.agentMode).toBe('ui');
      await act(async () => {
        await state.retryAssistantReply(user.id);
      });
      expect(executeRuntimeTurn).toHaveBeenCalledTimes(2);
      for (const [, input] of vi.mocked(executeRuntimeTurn).mock.calls) {
        expect(input).toMatchObject({
          apiInput: `${token} 解析文件`,
          modeId: 'ask',
          sourceRefs: [sourceRef],
          invocations: [expect.objectContaining({ token, resourceId: 'tender-resource', kind })],
        });
      }
      expect(services.viewGeneration!.generate).not.toHaveBeenCalled();
      expect(state.currentSession!.messages.at(-1)?.content).toBe('标书解析结果');
      expect(state.currentSession!.messages.at(-1)?.generatedView).toBeUndefined();
    },
  );

  it('routes a typed slash request in UI mode to host resource resolution', async () => {
    vi.mocked(executeRuntimeTurn).mockResolvedValue({ ...emptyProjection(), status: 'completed' });
    await send('/tender-document-parser 解析文件');
    expect(executeRuntimeTurn).toHaveBeenCalledWith(
      services.runtime!.port,
      expect.objectContaining({ apiInput: '/tender-document-parser 解析文件', modeId: 'ask' }),
      expect.any(AbortSignal),
      expect.any(Function),
    );
    expect(services.viewGeneration!.generate).not.toHaveBeenCalled();
  });

  it('resumes an interrupted skill after remount using the same file without another upload', async () => {
    const token = buildSlashInvocationToken({
      resourceId: 'tender',
      resourceRevision: 'v1',
      command: '/tender-document-parser',
      kind: 'skill',
      scope: 'project',
    });
    const ref = {
      sourceId: 'original',
      revision: 'v1',
      name: '标书.docx',
      mimeType: 'application/octet-stream',
      encoding: 'base64' as const,
      size: 100,
    };
    vi.mocked(services.loadChatSources).mockResolvedValue([{ ...ref, content: 'original-bytes' }]);
    vi.mocked(executeRuntimeTurn).mockResolvedValueOnce({
      ...emptyProjection(),
      status: 'failed',
      error: '应用重启中断了上一轮执行',
    });
    await act(async () => state.sendMessage(`${token} 解析文件`, undefined, { sourceRefs: [ref] }));
    const taskId = state.currentSession!.messages.at(-2)!.id;
    await act(async () => vi.advanceTimersByTime(600));
    await act(async () => root.unmount());
    root = createRoot(container);
    await mount();
    await act(async () => state.setAgentMode('ui'));
    vi.mocked(executeRuntimeTurn).mockResolvedValue({
      ...emptyProjection(),
      status: 'completed',
      content: '真实解析结果',
    });
    await act(async () =>
      state.sendMessage('请继续', undefined, { sourceRefs: [], invocations: [] }),
    );
    const input = vi.mocked(executeRuntimeTurn).mock.calls.at(-1)![1];
    expect(input).toMatchObject({
      modeId: 'ask',
      displayInput: '请继续',
      sourceRefs: [ref],
      invocations: [expect.objectContaining({ token, resourceId: 'tender' })],
    });
    expect(input.apiInput).toContain(token);
    expect(input.apiInput).toContain('解析文件');
    expect(state.currentSession!.messages.at(-2)!.requestSnapshot?.continuationOf).toBe(taskId);
    expect(services.viewGeneration!.generate).not.toHaveBeenCalled();
    expect(services.uploadFiles).not.toHaveBeenCalled();
    expect(state.currentSession!.messages.at(-1)?.content).toBe('真实解析结果');
  });

  it('recovers the original task behind a legacy no-attachment view when its parse button submits', async () => {
    vi.mocked(executeRuntimeTurn).mockResolvedValue({ ...emptyProjection(), status: 'completed' });
    const ref = {
      sourceId: 'old',
      revision: 'v1',
      name: '标书.pdf',
      mimeType: 'application/pdf',
      encoding: 'base64' as const,
      size: 10,
    };
    vi.mocked(services.loadChatSources).mockResolvedValue([{ ...ref, content: 'original' }]);
    await act(async () =>
      state.sendMessage('/tender-document-parser 解析文件', undefined, { sourceRefs: [ref] }),
    );
    await act(async () => {
      state.addMessage(original.id, { role: 'user', content: '请继续' });
      state.addMessage(original.id, {
        role: 'assistant',
        content: '未检测到附件',
        generatedView: view('root = Button("开始解析附件")'),
      });
    });
    const origin = state.currentSession!.messages.at(-1)!.id;
    await act(async () =>
      state.sendMessage('开始解析附件\n补充说明：解析所有', undefined, {
        continuationFromMessageId: origin,
        sourceRefs: [],
      }),
    );
    const input = vi.mocked(executeRuntimeTurn).mock.calls.at(-1)![1];
    expect(input.apiInput).toContain('/tender-document-parser');
    expect(input.apiInput).toContain('解析所有');
    expect(input.sourceRefs).toEqual([ref]);
    expect(services.viewGeneration!.generate).not.toHaveBeenCalled();
  });

  it('reloads conversation originals for plain view follow-ups and freezes them for retry', async () => {
    const ref = {
      sourceId: 'first',
      revision: 'v1',
      name: '原文件.txt',
      mimeType: 'text/plain',
      encoding: 'utf8' as const,
      size: 10,
    };
    vi.mocked(services.loadChatSources).mockImplementation(async (refs) =>
      refs.map((item) => ({ ...item, content: '本会话真实附件正文' })),
    );
    await act(async () => state.sendMessage('分析附件', undefined, { sourceRefs: [ref] }));
    vi.mocked(services.viewGeneration!.generate).mockRejectedValueOnce(new Error('临时错误'));
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
    await send('请继续');
    errorLog.mockRestore();
    const retryId = state.currentSession!.messages.at(-2)!.id;
    expect(services.viewGeneration!.generate).toHaveBeenLastCalledWith(
      expect.objectContaining({ sources: [{ ...ref, content: '本会话真实附件正文' }] }),
      expect.any(Function),
    );
    const replacement = { ...ref, sourceId: 'replacement', name: '新文件.txt' };
    await act(async () =>
      state.sendMessage('分析新文件', undefined, { sourceRefs: [replacement] }),
    );
    await act(async () => state.retryAssistantReply(retryId));
    expect(services.viewGeneration!.generate).toHaveBeenLastCalledWith(
      expect.objectContaining({ sources: [{ ...ref, content: '本会话真实附件正文' }] }),
      expect.any(Function),
    );
    expect(services.uploadFiles).not.toHaveBeenCalled();
  });

  it('uses a new selected file for continuation, and does not reuse a skill for a new UI task', async () => {
    vi.mocked(executeRuntimeTurn).mockResolvedValue({ ...emptyProjection(), status: 'completed' });
    const ref = {
      sourceId: 'first',
      revision: 'v1',
      name: '原文件.txt',
      mimeType: 'text/plain',
      encoding: 'utf8' as const,
      size: 10,
    };
    vi.mocked(services.loadChatSources).mockImplementation(async (refs) =>
      refs.map((item) => ({ ...item, content: item.name })),
    );
    await act(async () =>
      state.sendMessage('/tender-document-parser 解析', undefined, { sourceRefs: [ref] }),
    );
    const replacement = { ...ref, sourceId: 'replacement', name: '另一文件.txt' };
    await act(async () =>
      state.sendMessage('继续解析这个文件', undefined, { sourceRefs: [replacement] }),
    );
    expect(vi.mocked(executeRuntimeTurn).mock.calls.at(-1)![1].sourceRefs).toEqual([replacement]);
    await send('生成一个新的计数器界面');
    expect(executeRuntimeTurn).toHaveBeenCalledTimes(2);
    expect(services.viewGeneration!.generate).toHaveBeenCalledOnce();
    await act(async () => state.handleNewChat());
    await send('请继续');
    expect(services.viewGeneration!.generate).toHaveBeenLastCalledWith(
      expect.objectContaining({ sources: [] }),
      expect.any(Function),
    );
  });

  it('projects skill UI and persists admitted original and generated Word references across retry and reload', async () => {
    const sourceRef = {
      sourceId: 'source:report',
      revision: 'one',
      name: '报告.pdf',
      mimeType: 'application/pdf',
      encoding: 'base64' as const,
      size: 10,
      originalAvailable: true,
    };
    const templateRef = { ...sourceRef, sourceId: 'artifact:word', name: '模板.docx' };
    services.viewGeneration!.runtimePrompt = '通用组件契约';
    services.viewGeneration!.projectRuntimeView = vi
      .fn(
        (content, streaming): IChatGeneratedView => ({
          kind: 'openui',
          content,
          status: streaming ? 'generating' : 'complete',
        }),
      )
      .mockImplementationOnce((content) => ({
        kind: 'openui',
        content,
        status: 'error',
        errorMessage: '界面引用不完整',
      }));
    vi.mocked(services.loadChatSources).mockResolvedValue([{ ...sourceRef, content: 'bytes' }]);
    vi.mocked(executeRuntimeTurn).mockResolvedValue({
      ...emptyProjection(),
      status: 'completed',
      content: 'root = TextContent("动态报告")',
      events: [
        {
          type: 'artifact.created',
          payload: { sourceRef: templateRef, artifact: { id: 'word' } },
        } as RunEvent,
      ],
    });
    await act(async () =>
      state.sendMessage('/generic-report 生成报告', undefined, { sourceRefs: [sourceRef] }),
    );
    const user = state.currentSession!.messages.at(-2)!;
    expect(user.requestSnapshot).toMatchObject({
      agentMode: 'ask',
      viewRequested: true,
      systemPrompt: '通用组件契约',
    });
    expect(state.currentSession!.messages.at(-1)).toMatchObject({
      isError: true,
      generatedView: { status: 'error', sourceRefs: [sourceRef, templateRef] },
      requestSnapshot: { agentMode: 'ask', viewRequested: true },
    });
    await act(async () => state.setAgentMode('ask'));
    services.viewGeneration!.runtimePrompt = '后来的设置';
    await act(async () => state.retryAssistantReply(user.id));
    expect(executeRuntimeTurn).toHaveBeenCalledTimes(2);
    expect(services.viewGeneration!.generate).not.toHaveBeenCalled();
    for (const [, input] of vi.mocked(executeRuntimeTurn).mock.calls) {
      expect(input.modeId).toBe('ask');
      expect(input.systemPrompt).toContain('通用组件契约');
      expect(input.systemPrompt).not.toContain('后来的设置');
      expect(input.systemPrompt).toContain(sourceRef.sourceId);
    }
    await act(async () => vi.advanceTimersByTime(600));
    await act(async () => root.unmount());
    root = createRoot(container);
    await mount();
    expect(state.currentSession!.messages.at(-1)?.generatedView?.sourceRefs).toEqual([
      sourceRef,
      templateRef,
    ]);
  });

  it('preserves a partial skill interface when Harness fails after streaming it', async () => {
    services.viewGeneration!.projectRuntimeView = (content, streaming) =>
      content
        ? { kind: 'openui', content, status: streaming ? 'generating' : 'complete' }
        : undefined;
    vi.mocked(executeRuntimeTurn).mockImplementation(
      async (_port, _input, _signal, onProjection) => {
        onProjection({ ...emptyProjection(), content: 'root = TextContent("部分内容")' });
        return { ...emptyProjection(), status: 'failed', error: '连接中断' };
      },
    );
    await send('/generic-report 展示');
    expect(state.currentSession!.messages.at(-1)).toMatchObject({
      isLoading: false,
      isError: true,
      generatedView: {
        content: 'root = TextContent("部分内容")',
        status: 'error',
        errorMessage: '连接中断',
      },
    });
  });

  it('sends preprocessed context separately from the displayed question and retries its frozen input', async () => {
    const content = '网页正文：已读取的文章内容\n用户问题：总结网页';
    services.beforeSubmitPrompt = vi.fn(async () => ({ action: 'allow' as const, content }));
    await mount();
    await act(async () => state.setAgentMode('ask'));
    vi.mocked(executeRuntimeTurn).mockResolvedValueOnce({
      ...emptyProjection(),
      status: 'failed',
      error: '暂时不可用',
    });
    await send('总结网页');
    const userId = state.currentSession!.messages.at(-2)!.id;
    vi.mocked(executeRuntimeTurn).mockResolvedValueOnce({
      ...emptyProjection(),
      status: 'completed',
      content: '总结',
    });
    await act(async () => {
      await state.retryAssistantReply(userId);
    });
    expect(services.beforeSubmitPrompt).toHaveBeenCalledOnce();
    for (const [, input] of vi.mocked(executeRuntimeTurn).mock.calls) {
      expect(input).toMatchObject({
        apiInput: content,
        rawIntent: '总结网页',
        displayInput: '总结网页',
      });
    }
    expect(state.currentSession!.messages.at(-2)?.content).toBe('总结网页');
  });

  it('preserves inline resource tokens for host expansion while keeping raw intent readable', async () => {
    await act(async () => state.setAgentMode('ask'));
    vi.mocked(executeRuntimeTurn).mockResolvedValue({ ...emptyProjection(), status: 'completed' });
    const token = buildSlashInvocationToken({
      resourceId: 'skill-1',
      resourceRevision: 'revision-1',
      command: '/summary',
      label: '总结',
      kind: 'skill',
      scope: 'application',
    });
    await send(`${token} 阅读网页`);
    expect(vi.mocked(executeRuntimeTurn).mock.calls[0][1]).toMatchObject({
      apiInput: `${token} 阅读网页`,
      rawIntent: '/总结 阅读网页',
      invocations: [expect.objectContaining({ token, resourceId: 'skill-1' })],
    });
  });

  it('keeps stopped output, ignores late updates, and persists the stopped preview', async () => {
    let resolve!: (view: IChatGeneratedView) => void;
    let update!: (view: IChatGeneratedView) => void;
    vi.mocked(services.viewGeneration!.generate).mockImplementation((_input, onUpdate) => {
      update = onUpdate;
      onUpdate({ ...view('root = TextContent("部分输出")'), status: 'generating' });
      return new Promise((done) => {
        resolve = done;
      });
    });
    let pending!: Promise<boolean>;
    await act(async () => {
      pending = state.sendMessage('生成看板');
    });
    await act(async () => state.stopGeneration(original.id));
    await act(async () => {
      update(view('不应显示的延迟输出'));
      resolve(view('不应显示的延迟输出'));
      await pending;
    });
    expect(state.isAILoading).toBe(false);
    expect(state.currentSession!.messages.at(-1)?.generatedView).toMatchObject({
      content: 'root = TextContent("部分输出")',
      status: 'stopped',
    });
    expect(state.currentSession!.messages.slice(0, 2)).toEqual(original.messages);
    await act(async () => vi.advanceTimersByTime(600));
    const saved = JSON.parse(services.chatStorage.getItem(keys.CHAT_SESSIONS)!);
    expect(saved[0].messages.at(-1).generatedView.status).toBe('stopped');
  });

  it('retries a failed UI turn with its frozen mode and only the preceding view', async () => {
    await send('生成看板');
    const firstView = state.currentSession!.messages.at(-1)!.generatedView;
    vi.mocked(services.viewGeneration!.generate).mockRejectedValueOnce(new Error('生成失败'));
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
    await send('增加筛选');
    errorLog.mockRestore();
    const userId = state.currentSession!.messages[4].id;
    const replyId = state.currentSession!.messages[5].id;
    expect(state.currentSession!.messages[5].isError).toBe(true);
    await act(async () => state.setAgentMode('plan'));
    await act(async () => {
      await state.retryAssistantReply(userId);
    });
    expect(state.currentSession!.messages).toHaveLength(6);
    expect(state.currentSession!.messages[5].id).toBe(replyId);
    expect(state.currentSession!.messages[5].isError).toBe(false);
    expect(services.viewGeneration!.generate).toHaveBeenLastCalledWith(
      expect.objectContaining({ currentView: firstView, history: expect.any(Array) }),
      expect.any(Function),
    );
    expect(executeRuntimeTurn).not.toHaveBeenCalled();
  });

  it('clears messages and snapshots, persists immediately, and sends with an empty history', async () => {
    let other!: IChatSession;
    await act(async () => {
      other = state.createSessionInProject('other-project');
    });
    await act(async () => {
      state.addMessage(other.id, { role: 'user', content: '其他对话' });
    });
    await act(async () => state.switchToSession(original.id));
    await act(async () => {
      await state.clearSession(original.id);
    });
    expect(services.runtime!.port.clearSession).toHaveBeenCalledExactlyOnceWith(original.id);
    expect(state.currentSession).toMatchObject({
      id: original.id,
      title: original.title,
      messages: [],
      isLoading: false,
    });
    expect(state.currentSession!.noteSnapshots).toBeUndefined();
    expect(state.sessions.find((session) => session.id === other.id)!.messages[0].content).toBe(
      '其他对话',
    );
    const saved = JSON.parse(services.chatStorage.getItem(keys.CHAT_SESSIONS)!);
    expect(saved.find((session: IChatSession) => session.id === original.id).messages).toEqual([]);
    await act(async () => root.unmount());
    root = createRoot(container);
    await mount();
    expect(state.currentSession!.messages).toEqual([]);
    await act(async () => state.setAgentMode('ui'));
    await send('新的问题');
    expect(services.viewGeneration!.generate).toHaveBeenLastCalledWith(
      expect.objectContaining({ history: [], currentView: undefined }),
      expect.any(Function),
    );
  });

  it('retains all records when the runtime reset fails', async () => {
    vi.mocked(services.runtime!.port.clearSession!).mockRejectedValue(new Error('清除失败'));
    await act(async () => {
      await expect(state.clearSession(original.id)).rejects.toThrow('清除失败');
    });
    expect(state.currentSession!.messages).toEqual(original.messages);
    expect(state.currentSession!.noteSnapshots).toEqual(original.noteSnapshots);
  });

  it('refuses to clear a generating conversation', async () => {
    vi.mocked(services.viewGeneration!.generate).mockImplementation(
      (_input, _onUpdate) => new Promise(() => {}),
    );
    await act(async () => {
      void state.sendMessage('生成界面');
    });
    await act(async () => {
      await expect(state.clearSession(original.id)).rejects.toThrow('当前会话正在生成');
    });
    expect(services.runtime!.port.clearSession).not.toHaveBeenCalled();
    expect(state.currentSession!.messages.slice(0, 2)).toEqual(original.messages);
    await act(async () => state.stopGeneration(original.id));
  });

  it('discards a send prepared before its context was cleared', async () => {
    let finishGate!: (value: { action: 'allow' }) => void;
    services.beforeSubmitPrompt = vi.fn(
      () =>
        new Promise<{ action: 'allow' }>((resolve) => {
          finishGate = resolve;
        }),
    );
    await mount();
    await act(async () => state.setAgentMode('ask'));
    let pending!: Promise<boolean>;
    await act(async () => {
      pending = state.sendMessage('旧上下文下的问题');
    });
    await act(async () => {
      await state.clearSession(original.id);
    });
    await act(async () => {
      finishGate({ action: 'allow' });
      expect(await pending).toBe(false);
    });
    expect(state.currentSession!.messages).toEqual([]);
    expect(executeRuntimeTurn).not.toHaveBeenCalled();
  });

  it('ignores a pending replay that returns after the conversation was cleared', async () => {
    let finishReplay!: (events: RunEvent[]) => void;
    vi.mocked(services.runtime!.port.events).mockImplementation(
      () =>
        new Promise<RunEvent[] | null>((resolve) => {
          finishReplay = resolve;
        }),
    );
    await act(async () => state.updateMessage(original.id, 'old-assistant', { runId: 'old-run' }));
    await act(async () => vi.advanceTimersByTime(1500));
    expect(finishReplay).toBeDefined();
    await act(async () => {
      await state.clearSession(original.id);
    });
    await act(async () =>
      finishReplay([
        {
          eventSchemaVersion: '1',
          eventId: 'event',
          projectId: 'project',
          sessionId: original.id,
          turnId: 'turn',
          runId: 'old-run',
          seq: 1,
          timestamp: 1,
          type: 'run.started',
          payload: {},
        },
      ]),
    );
    expect(state.currentSession!.messages).toEqual([]);
    expect(state.isAILoading).toBe(false);
  });
});

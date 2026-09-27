import { chatCompletion } from '@renderer/services/ai';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@renderer/services/ai', () => ({ chatCompletion: vi.fn() }));

import {
  buildCustomToolGenerationMessages,
  buildCustomToolOpenUIRepairMessages,
  CUSTOM_TOOL_TECH_DESIGN_GUIDANCE,
  generateCustomToolView,
  resolveCustomToolGenerationKind,
  stripGeneratedView,
  validateGeneratedView,
} from './generation';

describe('custom tool view generation', () => {
  it('accepts a file input inside a form with a parsing action', () => {
    expect(
      validateGeneratedView(
        `root = Form("parse", actions, [upload])
actions = Buttons([start])
start = Button("开始解析附件")
upload = FormControl("文件", file)
file = FileInput("file", "选择文件", ".pdf,.docx")`,
        'openui',
      ),
    ).toBeNull();
  });
  it('defaults to OpenUI unless HTML is explicitly requested', () => {
    expect(resolveCustomToolGenerationKind('生成一个天气看板')).toBe('openui');
    expect(resolveCustomToolGenerationKind('请生成 HTML 页面')).toBe('html');
  });

  it('keeps OpenUI when HTML is explicitly rejected', () => {
    expect(resolveCustomToolGenerationKind('不要使用 HTML，请生成一个数据看板')).toBe('openui');
    expect(resolveCustomToolGenerationKind('Build a dashboard without HTML')).toBe('openui');
    expect(resolveCustomToolGenerationKind('Generate an HTML dashboard')).toBe('html');
  });

  it('uses HTML for the high-fidelity technology design skill unless OpenUI is explicit', () => {
    expect(resolveCustomToolGenerationKind('/custom-tool-tech-design 优化当前界面')).toBe('html');
    expect(resolveCustomToolGenerationKind('/custom-tool-tech-design 使用 OpenUI 生成')).toBe(
      'openui',
    );
  });

  it('strips matching code fences', () => {
    expect(stripGeneratedView('```openui\nroot = TextContent("ok")\n```', 'openui')).toBe(
      'root = TextContent("ok")',
    );
  });

  it('rejects OpenUI without a root declaration', () => {
    expect(validateGeneratedView('title = TextContent("x")', 'openui')).toContain('root');
  });

  it('reports unresolved OpenUI references and builds a focused repair request', () => {
    const content = 'root = Card([title, aiFooter])\ntitle = TextContent("状态")';
    const validationError = validateGeneratedView(content, 'openui');

    expect(validationError).toContain('aiFooter');
    expect(validationError).not.toMatch(/openui/i);
    const [, repairMessage] = buildCustomToolOpenUIRepairMessages(content, validationError!);
    expect(repairMessage.content).toContain('aiFooter');
    expect(repairMessage.content).toContain(content);
  });

  it.each(['openui', 'html'] as const)(
    'injects the shared adaptive visual design guidance into %s generation',
    (kind) => {
      const [systemMessage] = buildCustomToolGenerationMessages('生成生产看板', kind, '');
      expect(systemMessage.content).toContain(CUSTOM_TOOL_TECH_DESIGN_GUIDANCE);
    },
  );

  it.each(['openui', 'html'] as const)(
    'uses ordinary chat presentation without toolbox technology guidance for %s',
    (kind) => {
      const [system] = buildCustomToolGenerationMessages('展示解析结果', kind, '', [], 'chat');
      expect(system.content).toContain('默认使用简洁、正常');
      expect(system.content).toContain('不得使用示例数据补造');
      expect(system.content).not.toContain(CUSTOM_TOOL_TECH_DESIGN_GUIDANCE);
      expect(system.content).not.toContain('默认使用暗色科技基调');
    },
  );
});

describe('shared view generation pipeline', () => {
  beforeEach(() => vi.mocked(chatCompletion).mockReset());

  it('keeps earlier conversation turns and the current view in the generation request', async () => {
    vi.mocked(chatCompletion).mockResolvedValue({ content: 'root = TextContent("更新")' });
    const result = await generateCustomToolView(
      {} as never,
      {
        instruction: '增加筛选',
        kind: 'openui',
        currentContent: 'root = TextContent("旧版")',
        history: [
          { role: 'user', content: '做一个看板' },
          { role: 'assistant', content: 'root = TextContent("旧版")' },
        ],
      },
      vi.fn(),
    );
    expect(result.status).toBe('complete');
    const messages = vi.mocked(chatCompletion).mock.calls[0][1];
    expect(messages.slice(1, 3)).toEqual([
      { role: 'user', content: '做一个看板' },
      { role: 'assistant', content: 'root = TextContent("旧版")' },
    ]);
    expect(messages.at(-1)?.content).toContain('增加筛选');
    expect(messages.at(-1)?.content).toContain('当前界面源码');
  });

  it('repairs invalid OpenUI once and publishes the repaired preview', async () => {
    vi.mocked(chatCompletion)
      .mockResolvedValueOnce({ content: 'root = Card([missing])' })
      .mockResolvedValueOnce({ content: 'root = TextContent("已修复")' });
    const onUpdate = vi.fn();
    const result = await generateCustomToolView(
      {} as never,
      { instruction: '生成看板', kind: 'openui', currentContent: '' },
      onUpdate,
    );
    expect(chatCompletion).toHaveBeenCalledTimes(2);
    expect(vi.mocked(chatCompletion).mock.calls[1][2]?.temperature).toBe(0.1);
    expect(onUpdate.mock.calls.some(([view]) => view.status === 'repairing')).toBe(true);
    expect(result).toMatchObject({ status: 'complete', content: 'root = TextContent("已修复")' });
  });

  it('rejects invalid HTML without the OpenUI repair path', async () => {
    vi.mocked(chatCompletion).mockResolvedValue({ content: '不是 HTML' });
    await expect(
      generateCustomToolView(
        {} as never,
        { instruction: '生成 HTML 页面', kind: 'html', currentContent: '' },
        vi.fn(),
      ),
    ).rejects.toThrow('没有生成完整 HTML 页面');
    expect(chatCompletion).toHaveBeenCalledTimes(1);
  });

  it('retains ordinary chat presentation during OpenUI repair', async () => {
    vi.mocked(chatCompletion)
      .mockResolvedValueOnce({ content: 'root = Card([missing])' })
      .mockResolvedValueOnce({ content: 'root = TextContent("已修复")' });
    await generateCustomToolView(
      {} as never,
      { instruction: '展示结果', kind: 'openui', currentContent: '' },
      vi.fn(),
      { context: 'chat' },
    );
    for (const [, messages] of vi.mocked(chatCompletion).mock.calls) {
      expect(messages[0].content).toContain('默认使用简洁、正常');
      expect(messages[0].content).not.toContain(CUSTOM_TOOL_TECH_DESIGN_GUIDANCE);
    }
  });

  it('does not validate or repair a cancelled generation', async () => {
    const controller = new AbortController();
    vi.mocked(chatCompletion).mockImplementation(async (_config, _messages, options) => {
      options?.onStream?.('root = Card([missing])');
      controller.abort();
      return { content: '' };
    });
    await expect(
      generateCustomToolView(
        {} as never,
        { instruction: '生成看板', kind: 'openui', currentContent: '' },
        vi.fn(),
        { abortSignal: controller.signal },
      ),
    ).rejects.toThrow();
    expect(chatCompletion).toHaveBeenCalledTimes(1);
  });
});

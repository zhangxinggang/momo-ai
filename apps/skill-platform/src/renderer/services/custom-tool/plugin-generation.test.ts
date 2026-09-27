import { beforeEach, expect, it, vi } from 'vitest';
import { generateCustomToolPlugin, parsePluginGeneration } from './plugin-generation';
const mocks = vi.hoisted(() => ({ stream: vi.fn(), validate: vi.fn() }));
vi.mock('./generation', () => ({ streamCustomToolView: mocks.stream }));
vi.mock('./api', () => ({ validateCustomToolPlugin: mocks.validate }));
const raw = JSON.stringify({
  content: 'function execute(input) { return input; }',
  plugin: { identifier: 'sample-tool' },
});
beforeEach(() => {
  mocks.stream.mockReset().mockImplementation(async (_config, _messages, chunk) => {
    chunk(raw);
  });
  mocks.validate.mockReset().mockResolvedValue({ revision: 'valid', results: [] });
});
it('keeps the exact identifier and requires executable JSON output', () => {
  expect(parsePluginGeneration('```json\n' + raw + '\n```', 'sample-tool').kind).toBe('plugin');
  expect(() => parsePluginGeneration(raw, 'another-tool')).toThrow('标识');
});
it('repairs using real validation feedback and never publishes an invalid draft', async () => {
  mocks.validate.mockRejectedValueOnce(Error('测试「边界」未通过'));
  const draft = vi.fn();
  const result = await generateCustomToolPlugin(
    {} as any,
    { identifier: 'sample-tool', instruction: '统计字符', currentContent: '' },
    draft,
  );
  expect(result.kind).toBe('plugin');
  expect(mocks.stream).toHaveBeenCalledTimes(2);
  expect(mocks.stream.mock.calls[1][1].at(-1).content).toContain('边界');
  expect(draft).toHaveBeenCalledTimes(1);
  expect(draft).toHaveBeenCalledWith(result, true);
});
it('stops after two repairs and honors cancellation before publishing', async () => {
  mocks.validate.mockRejectedValue(Error('无法执行'));
  const draft = vi.fn();
  await expect(
    generateCustomToolPlugin(
      {} as any,
      { identifier: 'sample-tool', instruction: '生成', currentContent: '' },
      draft,
    ),
  ).rejects.toThrow('无法执行');
  expect(mocks.stream).toHaveBeenCalledTimes(3);
  expect(draft).not.toHaveBeenCalled();
  const abort = new AbortController();
  abort.abort();
  await expect(
    generateCustomToolPlugin(
      {} as any,
      { identifier: 'sample-tool', instruction: '生成', currentContent: '' },
      draft,
      { abortSignal: abort.signal },
    ),
  ).rejects.toThrow();
});

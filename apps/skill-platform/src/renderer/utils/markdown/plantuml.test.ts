// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const render = vi.hoisted(() => vi.fn());
vi.mock('../../../../../../packages/momo-markdown/node_modules/@plantuml/core/plantuml.js', () => ({
  renderToString: render,
}));

beforeEach(() => {
  vi.resetModules();
  render.mockReset();
  document.head.innerHTML = '';
});

async function loadRenderer() {
  const module =
    await import('../../../../../../packages/momo-markdown/src/components/MdEditor/utils/plantuml-renderer');
  const pending = module.renderPlantumlImage('A -> B: hello');
  void pending.catch(() => {});
  await vi.waitFor(() => expect(document.head.querySelector('script')).not.toBeNull());
  document.head.querySelector('script')!.dispatchEvent(new Event('load'));
  return { ...module, pending };
}

describe('local PlantUML rendering', () => {
  it('shares in-flight diagrams and serializes different sources without network rendering', async () => {
    const calls: Array<{ lines: string[]; success: (svg: string) => void }> = [];
    render.mockImplementation((lines, success) => calls.push({ lines, success }));
    const { renderPlantumlImage, pending } = await loadRenderer();
    const duplicate = renderPlantumlImage('A -> B: hello');
    const second = renderPlantumlImage('B -> C: next');
    expect(duplicate).toBe(pending);
    await vi.waitFor(() => expect(render).toHaveBeenCalledTimes(1));
    expect(calls[0].lines).toEqual(['@startuml', 'A -> B: hello', '@enduml']);
    calls[0].success('<svg xmlns="http://www.w3.org/2000/svg"><text>hello</text></svg>');
    const image = await pending;
    expect(image).toMatch(/^data:image\/svg\+xml;/);
    expect(decodeURIComponent(image)).toContain('<text>hello</text>');
    await vi.waitFor(() => expect(render).toHaveBeenCalledTimes(2));
    calls[1].success('<svg/>');
    await second;
    expect(document.head.querySelector('script')!.src).not.toMatch(/unpkg|plantuml\.com/);
  });

  it('does not leave the queue blocked after a rendering error', async () => {
    render.mockImplementationOnce((_lines, _success, failure) => failure('invalid diagram'));
    render.mockImplementationOnce((_lines, success) => success('<svg/>'));
    const { renderPlantumlImage, pending } = await loadRenderer();
    await expect(pending).rejects.toThrow('invalid diagram');
    await expect(renderPlantumlImage('B -> C')).resolves.toMatch(/^data:image\/svg\+xml;/);
  });

  it('rejects unbundled libraries rather than injecting a remote script', async () => {
    render.mockImplementation((_lines, success) => success('<svg/>'));
    const { pending } = await loadRenderer();
    await pending;
    const failure = vi.fn();
    globalThis.PLANTUML_STDLIB_LOADER!('https://example.com/library.js', vi.fn(), failure);
    expect(failure).toHaveBeenCalledWith(expect.stringContaining('未包含图形库'));
    expect(document.head.querySelectorAll('script')).toHaveLength(1);
  });
});

// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { ExportDocxSurfaceProvider, ExportDocxView } from './ExportDocxView';
import { exportInterfaceToDocx } from './export-docx';

vi.mock('./export-docx', () => ({ exportInterfaceToDocx: vi.fn().mockResolvedValue(undefined) }));

it('places the action outside the report frame and exports unselected tab content', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const host = document.createElement('div');
  const toolbar = document.createElement('div');
  document.body.append(toolbar, host);
  const root = createRoot(host);
  try {
    await act(async () =>
      root.render(
        createElement(ExportDocxSurfaceProvider, {
          toolbar,
          getSurface: () => host,
          source:
            'root = Tabs([one, two])\none = TabItem("one", "第一页", [PlainText("第一项")])\ntwo = TabItem("two", "第二页", [PlainText("第二项")])',
          children: createElement(ExportDocxView, { props: { fileName: '结果.docx' } } as never),
        }),
      ),
    );
    expect(host.querySelector('button')).toBeNull();
    expect(toolbar.querySelector('button')?.textContent).toContain('导出 DOCX');
    await act(async () => toolbar.querySelector('button')!.click());
    const [surface, name] = vi.mocked(exportInterfaceToDocx).mock.calls.at(-1)!;
    expect(surface.textContent).toContain('第一项');
    expect(surface.textContent).toContain('第二项');
    expect(name).toBe('结果.docx');
  } finally {
    await act(async () => root.unmount());
    toolbar.remove();
    host.remove();
    vi.unstubAllGlobals();
  }
});

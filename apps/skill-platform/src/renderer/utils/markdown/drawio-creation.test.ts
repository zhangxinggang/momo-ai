// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { globalConfig } from '../../../../../../packages/momo-markdown/src/components/MdEditor/config';
import {
  defaultContextValue,
  EditorContext,
} from '../../../../../../packages/momo-markdown/src/components/MdEditor/context';
import useDrawioCreation from '../../../../../../packages/momo-markdown/src/components/MdEditor/layouts/Content/hooks/useDrawioCreation';
import ToolbarMermaid from '../../../../../../packages/momo-markdown/src/components/MdEditor/layouts/Toolbar/tools/Mermaid';
import { DRAWIO_CREATE } from '../../../../../../packages/momo-markdown/src/components/MdEditor/static/event-name';
import { EMPTY_DRAWIO_XML } from '../../../../../../packages/momo-markdown/src/components/MdEditor/utils/drawio';
import bus from '../../../../../../packages/momo-markdown/src/components/MdEditor/utils/event-bus';

let modal: any;
vi.mock('~/components/DrawioEditor', () => ({
  default: (props: any) => {
    modal = props;
    return createElement('div', { 'aria-label': props.title }, 'draw.io');
  },
}));
vi.mock('~/components/Dropdown', () => ({ default: ({ overlay }: any) => overlay }));
let root: Root;
let host: HTMLDivElement;
let insert: ReturnType<typeof vi.fn>;
let capture: ReturnType<typeof vi.fn>;
let original: typeof globalConfig.editorExtensions.drawio;
function Content({ readOnly = false }: { readOnly?: boolean }) {
  return useDrawioCreation(readOnly, capture);
}
async function render(child = createElement(Content), disabled = false) {
  await act(async () =>
    root.render(
      createElement(
        EditorContext.Provider,
        {
          value: { ...defaultContextValue, editorId: 'creation-test', disabled, language: 'zh-CN' },
        },
        child,
      ),
    ),
  );
}
async function open() {
  await act(async () => bus.emit('creation-test', DRAWIO_CREATE));
}
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  original = globalConfig.editorExtensions.drawio;
  globalConfig.editorExtensions.drawio = { saveDiagram: vi.fn() };
  insert = vi.fn();
  capture = vi.fn(() => insert);
  modal = undefined;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  bus.clear('creation-test');
  globalConfig.editorExtensions.drawio = original;
  vi.unstubAllGlobals();
});
it('inserts only after successful persistence of a new drawing', async () => {
  let resolve!: (value: { imageUrl: string }) => void;
  vi.mocked(globalConfig.editorExtensions.drawio!.saveDiagram!).mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  await render();
  await open();
  expect(modal.xml).toBe(EMPTY_DRAWIO_XML);
  expect(insert).not.toHaveBeenCalled();
  const saving = modal.onSave('<mxGraphModel />', 'data:image/png;base64,png');
  expect(insert).not.toHaveBeenCalled();
  resolve({ imageUrl: 'http://localhost/assets/new.png' });
  await saving;
  expect(insert).toHaveBeenCalledExactlyOnceWith('http://localhost/assets/new.png');
});
it('does not insert a cancelled drawing', async () => {
  await render();
  await open();
  await act(async () => modal.onClose());
  expect(host.textContent).toBe('');
  expect(insert).not.toHaveBeenCalled();
  expect(globalConfig.editorExtensions.drawio!.saveDiagram).not.toHaveBeenCalled();
});
it('does not insert a pending save after its drawing was closed', async () => {
  let resolve!: (value: { imageUrl: string }) => void;
  vi.mocked(globalConfig.editorExtensions.drawio!.saveDiagram!).mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  await render();
  await open();
  const saving = modal.onSave('<mxGraphModel />', 'data:image/png;base64,png');
  await act(async () => modal.onClose());
  resolve({ imageUrl: 'http://localhost/assets/cancelled.png' });
  await saving;
  expect(insert).not.toHaveBeenCalled();
  expect(host.textContent).toBe('');
});
it('keeps the drawing open and does not insert when saving fails', async () => {
  vi.mocked(globalConfig.editorExtensions.drawio!.saveDiagram!).mockRejectedValue(
    new Error('save failed'),
  );
  await render();
  await open();
  await expect(modal.onSave('<mxGraphModel />', 'data:image/png;base64,png')).rejects.toThrow(
    'save failed',
  );
  expect(host.textContent).toBe('draw.io');
  expect(insert).not.toHaveBeenCalled();
});
it('blocks creation for read-only and disabled editors', async () => {
  await render(createElement(Content, { readOnly: true }));
  await open();
  await render(createElement(Content), true);
  await open();
  expect(capture).not.toHaveBeenCalled();
  expect(modal).toBeUndefined();
});
it('puts Custom before Mermaid and shows one New action with its description', async () => {
  await render(createElement(ToolbarMermaid));
  const tabs = host.querySelectorAll<HTMLButtonElement>('[role="tab"]');
  expect(Array.from(tabs, (tab) => tab.textContent)).toEqual(['自定义', 'Mermaid', 'PlantUML']);
  await act(async () => tabs[0].click());
  const panel = host.querySelector('.md-editor-chart-menu-custom')!;
  expect(panel.textContent).toBe('drawio任意图形绘制新增');
  expect(panel.querySelectorAll('button')).toHaveLength(1);
  expect(host.querySelector('input')).toBeNull();
  const create = vi.fn();
  bus.on('creation-test', { name: DRAWIO_CREATE, callback: create });
  await act(async () => panel.querySelector('button')!.click());
  expect(create).toHaveBeenCalledTimes(1);
});

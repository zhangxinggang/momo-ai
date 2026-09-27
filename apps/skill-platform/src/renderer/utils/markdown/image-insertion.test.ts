// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Editor } from '../../../../../../packages/momo-markdown/node_modules/@tiptap/core/dist/index.js';
import { EditorContent } from '../../../../../../packages/momo-markdown/node_modules/@tiptap/react/dist/index.js';
import { globalConfig } from '../../../../../../packages/momo-markdown/src/components/MdEditor/config';
import {
  defaultContextValue,
  EditorContext,
} from '../../../../../../packages/momo-markdown/src/components/MdEditor/context';
import {
  useExpansion,
  useUploadImg,
} from '../../../../../../packages/momo-markdown/src/components/MdEditor/hooks';
import { buildRichTextExtensions } from '../../../../../../packages/momo-markdown/src/components/MdEditor/layouts/Content/richtext/extensions';
import { applyRichTextDirective } from '../../../../../../packages/momo-markdown/src/components/MdEditor/layouts/Content/richtext/toolbar';
import Clip from '../../../../../../packages/momo-markdown/src/components/MdEditor/layouts/Modals/Clip';
import {
  REPLACE,
  UPLOAD_IMAGE,
} from '../../../../../../packages/momo-markdown/src/components/MdEditor/static/event-name';
import type { TUploadImgEvent } from '../../../../../../packages/momo-markdown/src/components/MdEditor/type';
import bus from '../../../../../../packages/momo-markdown/src/components/MdEditor/utils/event-bus';

vi.mock('~/components/Modal', () => ({
  default: ({ visible, children }: any) =>
    visible ? createElement('div', { className: 'clip-modal' }, children) : null,
}));
const localCropper = globalConfig.editorExtensions.cropper!.instance;
const instances: TestCropper[] = [];
class TestCropper {
  destroy = vi.fn();
  getCroppedCanvas = vi.fn(() => ({ toDataURL: () => 'data:image/png;base64,AQID' }));
  constructor(
    public image: HTMLImageElement,
    public options: any,
  ) {
    instances.push(this);
  }
}
let host: HTMLDivElement;
let root: Root;
let editor: Editor;
let onUpload: ReturnType<typeof vi.fn<TUploadImgEvent>>;
let onOk: ReturnType<typeof vi.fn>;

function Expansion() {
  useExpansion({ noPrettier: true, noUploadImg: false } as any);
  return null;
}
function UploadBridge() {
  useUploadImg({ onUploadImg: onUpload } as any, { editorId: 'image-insertion' } as any);
  return createElement(EditorContent, { editor });
}
async function render(visible = true, second = false) {
  await act(async () =>
    root.render(
      createElement(
        EditorContext.Provider,
        { value: { ...defaultContextValue, editorId: 'image-insertion' } },
        createElement(UploadBridge),
        createElement(Clip, { visible, onCancel: vi.fn(), onOk }),
        second && createElement(Clip, { visible: true, onCancel: vi.fn(), onOk: vi.fn() }),
      ),
    ),
  );
}
async function select(index = 0) {
  const input = host.querySelectorAll<HTMLInputElement>('input[type="file"]')[index];
  const file = new File(['original'], 'original.png', { type: 'image/png' });
  Object.defineProperty(input, 'files', { configurable: true, value: [file] });
  let finish!: () => void;
  const loaded = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const original = FileReader.prototype.readAsDataURL;
  vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementationOnce(function (file) {
    this.addEventListener('loadend', finish, { once: true });
    original.call(this, file);
  });
  await act(async () => {
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await loaded;
  });
}
async function click(element: Element) {
  await act(async () => element.dispatchEvent(new MouseEvent('click', { bubbles: true })));
}
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('requestAnimationFrame', vi.fn());
  instances.length = 0;
  onUpload = vi.fn();
  onOk = vi.fn();
  globalConfig.editorExtensions.cropper!.instance = TestCropper;
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  editor = new Editor({ extensions: buildRichTextExtensions('', false, 30), content: 'Before' });
  bus.on('image-insertion', {
    name: REPLACE,
    callback: (directive, params) => applyRichTextDirective(editor, directive, params),
  });
});
afterEach(async () => {
  await act(async () => {
    root.unmount();
    editor.destroy();
  });
  host.remove();
  bus.clear('image-insertion');
  globalConfig.editorExtensions.cropper!.instance = localCropper;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it('uses bundled Cropper and avoids adding remote Cropper scripts or styles', async () => {
  globalConfig.editorExtensions.cropper!.instance = localCropper;
  expect(typeof localCropper).toBe('function');
  await act(async () => root.render(createElement(Expansion)));
  expect(document.querySelector('script[src*="cropperjs"], link[href*="cropperjs"]')).toBeNull();
});
it('renders uploaded images through the upload event and preserves metadata across modes', async () => {
  onUpload.mockImplementation((_files, callback) =>
    callback([
      { url: 'http://localhost/assets/one.png', alt: 'One', title: 'First' },
      { url: 'http://localhost/assets/two.png', alt: 'Two', title: 'Second' },
    ]),
  );
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  await render(false);
  await act(async () => bus.emit('image-insertion', UPLOAD_IMAGE, [new File(['png'], 'one.png')]));
  const sources = () =>
    Array.from(host.querySelectorAll<HTMLImageElement>('figure > img'), (image) =>
      image.getAttribute('src'),
    );
  expect(sources()).toEqual(['http://localhost/assets/one.png', 'http://localhost/assets/two.png']);
  expect(host.querySelector('figure > img')?.getAttribute('title')).toBe('First');
  const markdown = (editor.storage as any).markdown.getMarkdown();
  await act(async () => editor.commands.setContent(markdown));
  expect(sources()).toEqual(['http://localhost/assets/one.png', 'http://localhost/assets/two.png']);
  expect(errors.mock.calls.flat().join(' ')).not.toContain('empty string');
});
it('uploads the cropped PNG only when ready and closes only after a successful callback', async () => {
  await render();
  await select();
  const confirm = host.querySelector<HTMLButtonElement>('.clip-modal .md-editor-btn')!;
  expect(confirm.disabled).toBe(true);
  expect(instances[0].options.preview).toBe(host.querySelector('.md-editor-clip-preview-target'));
  await act(async () => instances[0].options.ready());
  await click(confirm);
  const [files, callback] = onUpload.mock.calls[0];
  expect(files[0]).toMatchObject({ name: 'image.png', type: 'image/png', size: 3 });
  expect(onOk).not.toHaveBeenCalled();
  expect(host.querySelector('.md-editor-clip-cropper')).not.toBeNull();
  await act(async () =>
    callback([{ url: 'http://localhost/assets/cropped.png', alt: 'Cropped', title: '' }]),
  );
  expect(host.querySelector('figure > img')?.getAttribute('src')).toBe(
    'http://localhost/assets/cropped.png',
  );
  expect(onOk).toHaveBeenCalledOnce();
  expect(host.querySelector('.md-editor-clip-cropper')).toBeNull();
  expect(instances[0].destroy).toHaveBeenCalledOnce();
});
it('keeps cropper instances independent and releases only the closed dialog', async () => {
  await render(true, true);
  await select();
  await select(1);
  await act(async () => instances.forEach((instance) => instance.options.ready()));
  await render(false, true);
  expect(instances[0].destroy).toHaveBeenCalledOnce();
  expect(instances[1].destroy).not.toHaveBeenCalled();
  await click(host.querySelector('.clip-modal .md-editor-btn')!);
  expect(instances[1].getCroppedCanvas).toHaveBeenCalledOnce();
  expect(instances[0].getCroppedCanvas).not.toHaveBeenCalled();
});

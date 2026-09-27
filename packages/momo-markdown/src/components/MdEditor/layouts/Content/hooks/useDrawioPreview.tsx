import { useContext, useEffect, useRef, useState } from 'react';
import DrawioEditor from '~/components/DrawioEditor';
import { globalConfig, prefix } from '~/config';
import { EditorContext } from '~/context';
import { bindDrawioImageActions } from '~/utils/chart/diagram-viewer';
import { findMarkdownDiagram, getDrawioAssetId, withDrawioImageVersion } from '~/utils/drawio';
import type { IContentPreviewProps } from '../props';

const EDIT_CLASS = `${prefix}-drawio-preview-edit`;
const GRAPH_SELECTOR = `p.${prefix}-mermaid, .${prefix}-plantuml-rendered`;
const PEN_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m16 3 5 5-11 11-7 2 2-7Z"/><path d="m14 5 5 5"/></svg>';
type Target =
  | { line: number; diagram: NonNullable<ReturnType<typeof findMarkdownDiagram>> }
  | { assetId: string; src: string; xml: string };

/** Shared draw.io protocol and persistence for Markdown previews, including saved PNGs. */
export default function useDrawioPreview(
  props: IContentPreviewProps,
  html: string,
  renderKey: string | number,
) {
  const { editorId, customIcon } = useContext(EditorContext);
  const latest = useRef(props);
  latest.current = props;
  const [target, setTarget] = useState<Target | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const imageVersions = useRef(new Map<string, number>());

  useEffect(() => {
    const root = document.getElementById(`${editorId}-preview`);
    const drawio = globalConfig.editorExtensions.drawio;
    if (!root) return;
    let disposed = false;
    const imageActions = new Map<HTMLElement, () => void>();
    const editButtons: HTMLButtonElement[] = [];
    const addButton = (parent: HTMLElement) => {
      if (parent.querySelector(`.${EDIT_CLASS}`)) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = EDIT_CLASS;
      button.title = '图形编辑';
      button.setAttribute('aria-label', '图形编辑');
      button.innerHTML = PEN_ICON;
      parent.appendChild(button);
      editButtons.push(button);
    };
    const decorate = () => {
      imageActions.forEach((cleanup, figure) => {
        if (root.contains(figure)) return;
        cleanup();
        imageActions.delete(figure);
      });
      if (!props.readOnly && drawio?.saveDiagram) {
        root.querySelectorAll<HTMLElement>(GRAPH_SELECTOR).forEach((graph) => {
          if (!findMarkdownDiagram(latest.current.modelValue, Number(graph.dataset.line))) return;
          const bar = graph.querySelector<HTMLElement>(`.${prefix}-mermaid-action`);
          if (bar) addButton(bar);
        });
      }
      root.querySelectorAll<HTMLImageElement>('figure img').forEach((image) => {
        const src = image.getAttribute('src') || '';
        const assetId = getDrawioAssetId(src);
        if (!assetId) return;
        const version = imageVersions.current.get(assetId);
        if (version) {
          const versionedSrc = withDrawioImageVersion(src, version);
          if (src !== versionedSrc) image.src = versionedSrc;
        }
        const figure = image.closest('figure')!;
        figure.classList.add(`${prefix}-drawio-image`);
        if (imageActions.has(figure)) return;
        const bar = document.createElement('div');
        bar.className = `${prefix}-mermaid-action ${prefix}-drawio-image-action`;
        const actions = document.createElement('div');
        actions.className = `${prefix}-drawio-image-viewer-actions`;
        bar.appendChild(actions);
        figure.appendChild(bar);
        const cleanup = bindDrawioImageActions(figure, actions, { customIcon: customIcon || {} });
        imageActions.set(figure, () => {
          cleanup();
          bar.remove();
        });
        if (!props.readOnly && drawio?.loadDiagram && drawio.saveDiagram) addButton(bar);
      });
    };
    const observer = new MutationObserver(decorate);
    observer.observe(root, { childList: true, subtree: true });
    decorate();
    const onClick = async (event: MouseEvent) => {
      const button = (event.target as Element).closest?.(`.${EDIT_CLASS}`);
      if (!button || loadingRef.current || disposed || latest.current.readOnly) return;
      event.preventDefault();
      event.stopPropagation();
      setError('');
      const graph = button.closest<HTMLElement>(GRAPH_SELECTOR);
      if (graph) {
        const line = Number(graph.dataset.line);
        const diagram = findMarkdownDiagram(latest.current.modelValue, line);
        if (diagram) setTarget({ line, diagram });
        return;
      }
      const image = button.closest('figure')?.querySelector('img');
      const src = image?.getAttribute('src') || '';
      const assetId = getDrawioAssetId(src);
      if (!assetId || !drawio?.loadDiagram) return;
      loadingRef.current = true;
      setLoading(true);
      try {
        const xml = await drawio.loadDiagram(assetId);
        if (!xml) throw new Error('未找到该图片对应的 draw.io 图形数据');
        if (!disposed) setTarget({ assetId, src, xml });
      } catch (cause) {
        if (!disposed) setError(cause instanceof Error ? cause.message : String(cause));
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    };
    root.addEventListener('click', onClick, true);
    return () => {
      disposed = true;
      observer.disconnect();
      root.removeEventListener('click', onClick, true);
      imageActions.forEach((cleanup) => cleanup());
      editButtons.forEach((button) => button.remove());
    };
  }, [editorId, html, renderKey, props.readOnly, customIcon, props.setting?.preview]);

  const save = async (xml: string, pngDataUri: string) => {
    if (!target) return;
    if (latest.current.readOnly) throw new Error('当前文档为只读，无法保存图形');
    const drawio = globalConfig.editorExtensions.drawio;
    if (!drawio?.saveDiagram) throw new Error('图形保存服务不可用');
    if ('diagram' in target) {
      const current = findMarkdownDiagram(latest.current.modelValue, target.line);
      if (current?.raw !== target.diagram.raw)
        throw new Error('图形源码已变化，请关闭后重新打开图形编辑');
      const saved = await drawio.saveDiagram({ xml, pngDataUri });
      const content = latest.current.modelValue;
      const range = findMarkdownDiagram(content, target.line);
      if (range?.raw !== target.diagram.raw)
        throw new Error('图形源码已变化，请关闭后重新打开图形编辑');
      latest.current.onChange(
        `${content.slice(0, range.from)}![](${saved.imageUrl})${content.slice(range.to)}`,
      );
    } else {
      const saved = await drawio.saveDiagram({ assetId: target.assetId, xml, pngDataUri });
      const version = Date.now();
      imageVersions.current.set(target.assetId, version);
      const root = document.getElementById(`${editorId}-preview`);
      root?.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
        if (getDrawioAssetId(image.getAttribute('src')) === target.assetId) {
          image.src = withDrawioImageVersion(saved.imageUrl, version);
        }
      });
    }
  };

  return (
    <>
      {(error || loading) && (
        <div className={`${prefix}-drawio-preview-status`} role='status'>
          {loading ? '正在载入图形…' : error}
        </div>
      )}
      {target && (
        <DrawioEditor
          source={'diagram' in target ? target.diagram.source : undefined}
          xml={'xml' in target ? target.xml : undefined}
          onClose={() => setTarget(null)}
          onSave={save}
        />
      )}
    </>
  );
}

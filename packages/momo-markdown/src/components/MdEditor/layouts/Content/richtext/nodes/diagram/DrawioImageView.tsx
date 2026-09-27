import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';
import { PenTool } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import DrawioEditor from '~/components/DrawioEditor';
import { globalConfig, prefix } from '~/config';
import { bindDrawioImageActions } from '~/utils/chart/diagram-viewer';
import { getDrawioAssetId, withDrawioImageVersion } from '~/utils/drawio';

const DrawioImageView = (props: ReactNodeViewProps) => {
  const { node, selected, updateAttributes, editor, getPos } = props;
  const src = String(node.attrs.src || '');
  const alt = String(node.attrs.alt || '');
  const title = String(node.attrs.title || '');
  const assetId = useMemo(() => getDrawioAssetId(src), [src]);
  const [editorXml, setEditorXml] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageVersion, setImageVersion] = useState(0);
  const viewerActionsRef = useRef<HTMLDivElement>(null);
  const drawio = globalConfig.editorExtensions.drawio;

  useEffect(() => {
    const actions = viewerActionsRef.current;
    const figure = actions?.closest('figure');
    if (!actions || !figure) return;
    return bindDrawioImageActions(figure, actions, { customIcon: {} as any });
  }, [assetId]);

  const openEditor = useCallback(async () => {
    if (!assetId || !drawio?.loadDiagram || !drawio.saveDiagram) return;
    setLoading(true);
    setError('');
    try {
      const xml = await drawio.loadDiagram(assetId);
      if (!xml) throw new Error('未找到该图片对应的 draw.io 图形数据');
      setEditorXml(xml);
      setEditorOpen(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
  }, [assetId, drawio]);

  const saveDiagram = useCallback(
    async (xml: string, pngDataUri: string) => {
      if (!assetId || !drawio?.saveDiagram) throw new Error('图形保存服务不可用');
      const saved = await drawio.saveDiagram({ assetId, xml, pngDataUri });
      if (saved.imageUrl !== src) {
        updateAttributes({ src: saved.imageUrl });
      }
      // 同名文件已被覆盖；仅给当前 DOM 增加缓存戳，Markdown 地址保持不变。
      setImageVersion(Date.now());
    },
    [assetId, drawio, src, updateAttributes],
  );

  const figureClass = [
    assetId ? `${prefix}-drawio-image` : '',
    selected ? 'ProseMirror-selectednode' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <NodeViewWrapper
      as='figure'
      className={figureClass}
      data-align={node.attrs.textAlign || 'center'}
      style={{ textAlign: node.attrs.textAlign || 'center' }}
      contentEditable={false}
      onClick={(event: MouseEvent<HTMLElement>) => {
        if (
          !event.currentTarget.contains(event.target as Node) ||
          (event.target as Element).closest(`.${prefix}-mermaid-action`)
        ) {
          return;
        }
        const pos = getPos();
        if (typeof pos !== 'number') return;
        event.preventDefault();
        event.stopPropagation();
        editor.chain().setNodeSelection(pos).focus(undefined, { scrollIntoView: false }).run();
      }}>
      <img
        className='md-zoom'
        src={src ? withDrawioImageVersion(src, imageVersion) : undefined}
        alt={alt}
        title={title || undefined}
        draggable={false}
      />
      {alt && <figcaption>{alt}</figcaption>}
      {assetId && (
        <div className={`${prefix}-mermaid-action ${prefix}-drawio-image-action`}>
          <div ref={viewerActionsRef} className={`${prefix}-drawio-image-viewer-actions`} />
          {error && <span className={`${prefix}-drawio-image-error`}>{error}</span>}
          {drawio?.loadDiagram && drawio.saveDiagram && (
            <button
              type='button'
              className={`${prefix}-diagram-action-btn`}
              title={loading ? '正在载入图形…' : '图形编辑'}
              aria-label='图形编辑'
              disabled={loading}
              onClick={(event) => {
                event.stopPropagation();
                void openEditor();
              }}>
              <PenTool size={16} />
            </button>
          )}
        </div>
      )}
      {editorOpen && editorXml && (
        <DrawioEditor
          xml={editorXml}
          title='图形编辑'
          onClose={() => setEditorOpen(false)}
          onSave={saveDiagram}
        />
      )}
    </NodeViewWrapper>
  );
};

export default DrawioImageView;

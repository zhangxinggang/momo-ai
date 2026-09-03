import copy2Clipboard from '@vavt/copy2clipboard';
import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';
import { randomId } from '@vavt/util';
import { CircleChevronLeft, Code2, Copy, Download, Expand, Pin, PinOff, Check } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { globalConfig, prefix } from '~/config';
import {
  buildPlantumlSvgUrl,
  encodePlantuml,
  normalizePlantumlSource,
} from '~/utils/plantuml-encoder';
import {
  bindDiagramPanZoom,
  downloadDiagramAsPng,
  toggleDiagramFullscreen,
  type IDiagramPanZoomHandle,
} from '~/utils/chart/diagram-viewer';
import { normalizeMermaidSource } from '~/utils/chart/mermaid-source';
import { isDiagramLang, parseCodeLang } from './CodeBlock';

const EMPTY_CUSTOM_ICON = {} as any;

/**
 * 根据图表语言返回容器 class（与 markdown 预览保持一致，便于复用图表工具函数）
 */
const getDiagramClass = (lang: string): string => {
  if (lang === 'echarts') return `${prefix}-echarts`;
  if (lang === 'plantuml' || lang === 'puml') return `${prefix}-plantuml-rendered`;
  return `${prefix}-mermaid`;
};

/**
 * 代码块 / 图表 NodeView
 *
 * - 图表语言（mermaid/echarts/plantuml）：渲染对应图表，右上角提供与 markdown 一致的操作按钮
 *   （复制 / 缩放(仅 mermaid) / 全屏 / 下载），并额外提供「源码编辑」按钮，点击后切换到源码编辑态
 * - 普通代码块：复用 markdown 预览的代码块外观（mac 风格头部 + 暗色代码区），内容由 ProseMirror 接管可编辑，
 *   并支持与 markdown 一致的折叠行为（自动折叠、::open / ::close 强制标记、点击头部展开/收起）
 */
const DiagramView = (props: ReactNodeViewProps) => {
  const { node, selected, getPos, editor, extension } = props as any;
  const rawLanguage = (node.attrs?.language as string) || '';
  const { lang, mandatory } = parseCodeLang(rawLanguage);
  const isDiagram = isDiagramLang(lang);

  // 折叠配置（来自 CodeBlock 扩展 options，与 markdown 模式一致）
  const codeFoldable: boolean = extension?.options?.codeFoldable ?? true;
  const autoFoldThreshold: number = extension?.options?.autoFoldThreshold ?? 30;

  const [rendered, setRendered] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [editing, setEditing] = useState<boolean>(false);
  const [draft, setDraft] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [zoomOn, setZoomOn] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const echartsBoxRef = useRef<HTMLDivElement>(null);
  const echartsInstanceRef = useRef<any>(null);
  const zoomHandleRef = useRef<IDiagramPanZoomHandle | null>(null);
  const encodedRef = useRef<string>('');

  // 代码块折叠：是否可折叠、初始是否展开，逻辑与 markdown CodePlugin 完全一致
  const foldable = isDiagram ? false : !!mandatory || codeFoldable;
  const initiallyOpen = useMemo(() => {
    if (mandatory === 'open') return true;
    if (mandatory === 'close') return false;
    if (!codeFoldable) return true;
    const lineCount = (node.textContent || '').split('\n').length;
    return lineCount < autoFoldThreshold;
    // 仅在挂载时计算一次初始展开态，避免编辑过程中反复折叠
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [folded, setFolded] = useState<boolean>(!initiallyOpen);

  const updateCode = useCallback(
    (newCode: string) => {
      const pos = getPos();
      if (typeof pos !== 'number') return;
      const start = pos + 1;
      const end = pos + node.nodeSize - 1;
      const tr = editor.state.tr;
      tr.replaceWith(start, end, editor.state.schema.text(newCode));
      tr.setMeta('addToHistory', true);
      editor.view.dispatch(tr);
    },
    [editor, getPos, node.nodeSize],
  );

  // 进入源码编辑态时，用当前节点文本初始化草稿
  useEffect(() => {
    if (editing) {
      setDraft(node.textContent);
    }
  }, [editing, node.textContent]);

  // 渲染 mermaid
  const renderMermaid = useCallback(async (code: string) => {
    const mermaid = globalConfig.editorExtensions.mermaid?.instance || (window as any).mermaid;
    if (!mermaid) {
      try {
        const mod = await import('mermaid');
        const instance = (mod as any).default;
        globalConfig.editorExtensions.mermaid = globalConfig.editorExtensions.mermaid || {};
        globalConfig.editorExtensions.mermaid.instance = instance;
        instance.initialize({ startOnLoad: false, theme: 'default' });
        const normalized = normalizeMermaidSource(code.trim()) || 'flowchart TD\n  A --> B';
        const { svg } = await instance.render(`mmd-${randomId()}`, normalized);
        setRendered(svg);
        setError('');
      } catch (err: any) {
        setError(err?.message || String(err));
        setRendered('');
      }
      return;
    }
    try {
      const normalized = normalizeMermaidSource(code.trim()) || 'flowchart TD\n  A --> B';
      const { svg } = await mermaid.render(`mmd-${randomId()}`, normalized);
      setRendered(svg);
      setError('');
    } catch (err: any) {
      setError(err?.message || String(err));
      setRendered('');
    }
  }, []);

  // 渲染 echarts
  const renderEcharts = useCallback(async (code: string) => {
    let echarts = globalConfig.editorExtensions.echarts?.instance || (window as any).echarts;
    if (!echarts) {
      try {
        const mod: any = await import('echarts');
        echarts = mod.default || mod;
        globalConfig.editorExtensions.echarts = globalConfig.editorExtensions.echarts || {};
        globalConfig.editorExtensions.echarts.instance = echarts;
      } catch {
        setError('echarts 未加载');
        setRendered('');
        return;
      }
    }
    const box = echartsBoxRef.current;
    if (!box) return;
    try {
      const parseOption = globalConfig.editorExtensions.echarts?.parseOption;
      const opt = parseOption
        ? parseOption(code, { editorId: '', element: box })
        : // eslint-disable-next-line @typescript-eslint/no-implied-eval
          new Function(`return ${code}`)();
      if (echartsInstanceRef.current) {
        echartsInstanceRef.current.dispose();
      }
      echartsInstanceRef.current = echarts.init(box);
      echartsInstanceRef.current.setOption(opt);
      setRendered('__echarts_rendered__');
      setError('');
    } catch (err: any) {
      setError(err?.message || String(err));
      setRendered('');
    }
  }, []);

  // 渲染 plantuml
  const renderPlantuml = useCallback(async (code: string) => {
    try {
      const normalized = normalizePlantumlSource(code);
      const encoded = await encodePlantuml(normalized);
      encodedRef.current = encoded;
      const url = buildPlantumlSvgUrl(normalized, encoded);
      setRendered(`<img src="${url}" alt="PlantUML" class="${prefix}-plantuml-image" />`);
      setError('');
    } catch (err: any) {
      setError(err?.message || String(err));
      setRendered('');
    }
  }, []);

  useEffect(() => {
    if (!isDiagram || editing) return;
    const code = node.textContent;
    if (lang === 'mermaid' || lang === 'flowchart') {
      void renderMermaid(code);
    } else if (lang === 'echarts') {
      void renderEcharts(code);
    } else if (lang === 'plantuml' || lang === 'puml') {
      void renderPlantuml(code);
    }
  }, [isDiagram, editing, lang, node.textContent, renderMermaid, renderEcharts, renderPlantuml]);

  // 同步 data-content / data-encoded 到容器，供复制 / 下载使用
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.dataset.content = node.textContent || '';
    if (lang === 'plantuml' || lang === 'puml') {
      container.dataset.encoded = encodedRef.current;
    }
  }, [node.textContent, lang, rendered]);

  // 节点卸载时释放 echarts 实例与缩放句柄
  useEffect(() => {
    return () => {
      if (echartsInstanceRef.current) {
        echartsInstanceRef.current.dispose();
        echartsInstanceRef.current = null;
      }
      zoomHandleRef.current?.cleanup();
      zoomHandleRef.current = null;
    };
  }, []);

  // 退出编辑态或节点卸载时清理缩放
  useEffect(() => {
    if (editing && zoomHandleRef.current) {
      zoomHandleRef.current.cleanup();
      zoomHandleRef.current = null;
      setZoomOn(false);
    }
  }, [editing]);

  // 操作：复制源码
  const handleCopy = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    void copy2Clipboard(container.dataset.content || '').then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  }, []);

  // 操作：切换缩放/拖拽（仅 mermaid）
  const handleZoomToggle = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (zoomHandleRef.current) {
      zoomHandleRef.current.cleanup();
      zoomHandleRef.current = null;
      container.removeAttribute('data-grab');
      setZoomOn(false);
      return;
    }
    const svg = container.querySelector<SVGSVGElement>('svg');
    if (!svg) return;
    zoomHandleRef.current = bindDiagramPanZoom(container, svg as unknown as HTMLElement);
    container.setAttribute('data-grab', '');
    setZoomOn(true);
  }, []);

  // 操作：全屏
  const handleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    toggleDiagramFullscreen(container, { customIcon: EMPTY_CUSTOM_ICON });
  }, []);

  // 操作：下载
  const handleDownload = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    void downloadDiagramAsPng(container);
  }, []);

  // 操作：切换折叠。收起时若选区落在代码内部，则将选区移至该节点，避免光标被困在隐藏内容中
  const handleToggleFold = useCallback(() => {
    setFolded((prev) => {
      const next = !prev;
      if (next) {
        const pos = getPos();
        if (typeof pos === 'number') {
          const end = pos + node.nodeSize;
          const sel = editor.state.selection;
          if (sel.from >= pos + 1 && sel.to <= end - 1) {
            editor.chain().setNodeSelection(pos).run();
          }
        }
      }
      return next;
    });
  }, [editor, getPos, node.nodeSize]);

  // 图表语言
  if (isDiagram) {
    const diagramClass = getDiagramClass(lang);
    const isMermaid = lang === 'mermaid' || lang === 'flowchart';

    // 源码编辑态：仅显示编辑区
    if (editing) {
      return (
        <NodeViewWrapper
          className={`${prefix}-diagram ${prefix}-diagram-selected`}
          as='div'
          contentEditable={false}>
          <div className={`${prefix}-diagram-editor`}>
            <div className={`${prefix}-diagram-editor-bar`}>
              <span className={`${prefix}-diagram-editor-lang`}>{lang}</span>
              <button
                type='button'
                className={`${prefix}-diagram-action-btn`}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(false);
                }}
                title='完成'>
                完成
              </button>
            </div>
            <textarea
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                updateCode(e.target.value);
              }}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Escape') {
                  setEditing(false);
                }
              }}
              spellCheck={false}
              placeholder={`在此编辑 ${lang} 源码`}
            />
          </div>
        </NodeViewWrapper>
      );
    }

    // 预览态：渲染图表 + 右上角操作按钮
    return (
      <NodeViewWrapper
        className={`${prefix}-diagram ${selected ? `${prefix}-diagram-selected` : ''}`}
        as='div'
        contentEditable={false}>
        <div className={`${prefix}-diagram-preview ${diagramClass}`} ref={containerRef}>
          {lang === 'echarts' ? (
            <div className={`${prefix}-diagram-echarts`} ref={echartsBoxRef} />
          ) : error ? (
            <div className={`${prefix}-diagram-error`}>{error}</div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: rendered }} />
          )}
          {lang !== 'echarts' && !rendered && !error && (
            <div className={`${prefix}-diagram-loading`}>渲染中…</div>
          )}
          {/* 隐藏的 NodeViewContent：承接 TipTap 自动创建的内容容器，避免原始源码与图表同时显示 */}
          <NodeViewContent className={`${prefix}-diagram-source`} />
          <div className={`${prefix}-mermaid-action`}>
            <button
              type='button'
              className={`${prefix}-diagram-action-btn`}
              title='复制源码'
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
            {isMermaid && (
              <button
                type='button'
                className={`${prefix}-diagram-action-btn`}
                title={zoomOn ? '退出缩放' : '缩放'}
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomToggle();
                }}>
                {zoomOn ? <PinOff size={16} /> : <Pin size={16} />}
              </button>
            )}
            <button
              type='button'
              className={`${prefix}-diagram-action-btn`}
              title='全屏'
              onClick={(e) => {
                e.stopPropagation();
                handleFullscreen();
              }}>
              <Expand size={16} />
            </button>
            <button
              type='button'
              className={`${prefix}-diagram-action-btn`}
              title='下载'
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}>
              <Download size={16} />
            </button>
            <button
              type='button'
              className={`${prefix}-diagram-action-btn`}
              title='源码编辑'
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}>
              <Code2 size={16} />
            </button>
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  // 普通代码块：复用 markdown 预览的代码块外观（mac 风格头部 + 暗色代码区），内容由 ProseMirror 接管可编辑
  const codeClass = foldable
    ? `${prefix}-code ${prefix}-code-foldable${folded ? ` ${prefix}-code-folded` : ''}`
    : `${prefix}-code`;
  return (
    <NodeViewWrapper as='div' className={codeClass}>
      <div
        className={`${prefix}-code-head`}
        contentEditable={false}
        {...(foldable
          ? {
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                handleToggleFold();
              },
            }
          : {})}>
        <div className={`${prefix}-code-flag`}>
          <span />
          <span />
          <span />
        </div>
        <div className={`${prefix}-code-action`}>
          <span className={`${prefix}-code-lang`}>{lang}</span>
          <button
            type='button'
            className={`${prefix}-copy-button`}
            title='复制代码'
            onClick={(e) => {
              e.stopPropagation();
              void copy2Clipboard(node.textContent || '').then(() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              });
            }}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </button>
          {foldable && (
            <span
              className={`${prefix}-collapse-tips`}
              title={folded ? '展开' : '收起'}
              aria-hidden='true'>
              <CircleChevronLeft size={16} />
            </span>
          )}
        </div>
      </div>
      <pre>
        <NodeViewContent as={'code' as any} className={lang ? `language-${lang}` : ''} />
      </pre>
    </NodeViewWrapper>
  );
};

export default DiagramView;

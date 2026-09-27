import { EditorContent, useEditor } from '@tiptap/react';
import {
  ForwardedRef,
  forwardRef,
  memo,
  MouseEvent,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import CustomScrollbar from '~/components/CustomScrollbar';
import { prefix } from '~/config';
import { EditorContext } from '~/context';
import {
  CATALOG_CHANGED,
  CTRL_SHIFT_Z,
  CTRL_Z,
  PUSH_CATALOG,
  REPLACE,
  RERENDER,
} from '~/static/event-name';
import { IHeadList, TFocusOption, TMdHeadingId } from '~/type';
import { TToolDirective } from '~/utils/content-help';
import bus from '~/utils/event-bus';
import MdCatalog, { ITocItem } from '~~/components/MdCatalog';
import useDrawioCreation from '../hooks/useDrawioCreation';
import { IContentProps } from '../props';
import { IContentExposeParam } from '../type';
import { buildRichTextExtensions } from './extensions';
import LinkEditor, { type LinkRange } from './LinkEditor';
import { applyRichTextDirective } from './toolbar';

/**
 * 富文本（WYSIWYG）内容区
 *
 * 基于 TipTap 实现所见即所得编辑，对外仍以 Markdown 字符串与父组件交互：
 * - modelValue 变化时解析 Markdown 为 ProseMirror 文档
 * - 用户编辑时通过 tiptap-markdown 序列化为 Markdown 并触发 onChange
 *
 * 工具栏指令通过 REPLACE 事件流入，此处映射为对应的 TipTap 命令。
 */
const RichTextContent = forwardRef((props: IContentProps, ref: ForwardedRef<unknown>) => {
  const { editorId, theme, previewTheme, catalogVisible } = useContext(EditorContext);
  const [linkRange, setLinkRange] = useState<LinkRange | null>(null);

  // 取得当前编辑器内容的 Markdown 字符串（tiptap-markdown 提供 storage.markdown.getMarkdown）
  const getMarkdown = useCallback((ed: typeof editor) => {
    if (!ed) return '';
    return (ed.storage as any).markdown?.getMarkdown?.() ?? '';
  }, []);

  const extensions = useMemo(
    () => buildRichTextExtensions(props.placeholder, props.codeFoldable, props.autoFoldThreshold),
    // placeholder / 折叠配置变化时重建扩展
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.placeholder, props.codeFoldable, props.autoFoldThreshold],
  );

  const editor = useEditor(
    {
      extensions,
      content: props.modelValue,
      editable: !props.readOnly,
      editorProps: {
        attributes: {
          class: `${prefix}-preview ${previewTheme || 'default'}-theme md-editor-richtext`,
          'data-editor-id': editorId,
        },
      },
      onUpdate: ({ editor }) => {
        // 通过 tiptap-markdown 序列化为 Markdown 字符串
        props.onChange(getMarkdown(editor));
      },
    },
    // extensions 变化时重建编辑器
    [extensions],
  );
  const drawioCreation = useDrawioCreation(props.readOnly, () => {
    if (!editor || !editor.isEditable) return;
    const { from, to } = editor.state.selection;
    const original = editor.state.doc;
    return (imageUrl) => {
      if (editor.isDestroyed || !editor.isEditable) throw new Error('当前文档无法插入图形');
      if (editor.state.doc !== original) throw new Error('文档已变化，请关闭后重新新增图形');
      editor.chain().focus().setTextSelection({ from, to }).setImage({ src: imageUrl }).run();
    };
  });

  // 外部 modelValue 变化时同步到编辑器（避免与用户编辑形成回环）
  useEffect(() => {
    if (!editor) return;

    let cancelled = false;
    const nextContent = props.modelValue;

    // TipTap's React node views use flushSync when the editor is already mounted.
    // Run content replacement after React has finished the current effect cycle.
    queueMicrotask(() => {
      if (cancelled || editor.isDestroyed || getMarkdown(editor) === nextContent) return;
      // setContent 接收 Markdown 字符串，由 tiptap-markdown 解析；不触发 onUpdate
      editor.commands.setContent(nextContent, { emitUpdate: false });
    });

    return () => {
      cancelled = true;
    };
  }, [editor, props.modelValue, getMarkdown]);

  // 只读 / 禁用状态同步
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!props.readOnly);
  }, [editor, props.readOnly]);

  // 预览主题切换：编辑器创建时已写入主题 class，但 useEditor 不会因 previewTheme 变化重建，
  // 故在此同步替换 ProseMirror 根节点的 *-theme class，使预览样式在富文本下生效
  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom as HTMLElement;
    const nextTheme = `${previewTheme || 'default'}-theme`;
    if (dom.classList.contains(nextTheme)) return;
    const oldTheme = Array.from(dom.classList).find(
      (cls) => cls.endsWith('-theme') && cls !== nextTheme,
    );
    if (oldTheme) {
      dom.classList.remove(oldTheme);
    }
    dom.classList.add(nextTheme);
  }, [editor, previewTheme]);

  // 暴露与 markdown 模式一致的最小接口
  useImperativeHandle(
    ref,
    (): IContentExposeParam => ({
      getSelectedText() {
        if (!editor) return undefined;
        const { from, to, empty } = editor.state.selection;
        if (empty) return '';
        return editor.state.doc.textBetween(from, to, '\n');
      },
      focus(options?: TFocusOption) {
        if (!editor) return;
        // 简化：仅支持 start / end，其余位置不精确处理
        if (options === 'start') {
          editor.commands.focus('start');
        } else if (options === 'end') {
          editor.commands.focus('end');
        } else {
          editor.commands.focus();
        }
      },
      resetHistory() {
        // TipTap 没有直接重置历史的命令，通过重新 setContent 清空历史
        if (!editor) return;
        const md = getMarkdown(editor);
        editor.commands.setContent(md, { emitUpdate: false });
      },
      getEditorView() {
        // 富文本模式无 CodeMirror EditorView
        return undefined;
      },
    }),
    [editor, getMarkdown],
  );

  // 计算标题并推送目录
  const headsRef = useMemo(() => {
    if (!editor) return [] as IHeadList[];
    const heads: IHeadList[] = [];
    let index = 0;
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'heading') {
        const text = node.textContent;
        heads.push({
          text,
          level: node.attrs.level as 1 | 2 | 3 | 4 | 5 | 6,
          line: index,
        });
        index += 1;
      }
    });
    return heads;
  }, [editor, props.modelValue]);

  useEffect(() => {
    const callback = () => {
      bus.emit(editorId, CATALOG_CHANGED, headsRef);
    };
    bus.on(editorId, {
      name: PUSH_CATALOG,
      callback,
    });
    // 主动触发一次
    bus.emit(editorId, PUSH_CATALOG);
    return () => {
      bus.remove(editorId, PUSH_CATALOG, callback);
    };
  }, [editorId, headsRef]);

  // 撤销 / 前进事件
  useEffect(() => {
    if (!editor) return;
    const ctrlZ = () => editor.commands.undo();
    const ctrlShiftZ = () => editor.commands.redo();
    bus.on(editorId, { name: CTRL_Z, callback: ctrlZ });
    bus.on(editorId, { name: CTRL_SHIFT_Z, callback: ctrlShiftZ });
    return () => {
      bus.remove(editorId, CTRL_Z, ctrlZ);
      bus.remove(editorId, CTRL_SHIFT_Z, ctrlShiftZ);
    };
  }, [editor, editorId]);

  // 重新渲染事件
  useEffect(() => {
    const callback = () => {
      if (!editor) return;
      const md = getMarkdown(editor);
      editor.commands.setContent(md, { emitUpdate: true });
    };
    bus.on(editorId, { name: RERENDER, callback });
    return () => {
      bus.remove(editorId, RERENDER, callback);
    };
  }, [editor, editorId, getMarkdown]);

  // 工具栏指令 → TipTap 命令
  useEffect(() => {
    if (!editor) return;
    const callback = (direct: TToolDirective, params: any = {}) => {
      if (direct === 'link' && !params.url && editor.isEditable) {
        const { from, to } = editor.state.selection;
        setLinkRange({ from, to });
        return;
      }
      applyRichTextDirective(editor, direct, params);
    };

    bus.on(editorId, { name: REPLACE, callback });
    return () => {
      bus.remove(editorId, REPLACE, callback);
    };
  }, [editor, editorId]);

  // 目录点击：滚动到对应标题元素
  const onCatalogClick = useCallback(
    (e: MouseEvent, toc: ITocItem) => {
      const container = document.querySelector<HTMLElement>(`#${editorId} .md-editor-richtext`);
      if (!container) return;
      const headings = Array.from(
        container.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6'),
      );
      const target = headings[toc.line];
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [editorId],
  );

  const mdHeadingId = props.mdHeadingId as TMdHeadingId;

  const catalog = useMemo(() => {
    return (
      <MdCatalog
        theme={theme}
        className={`${prefix}-catalog-editor`}
        editorId={editorId}
        mdHeadingId={mdHeadingId}
        key='internal-catalog-richtext'
        scrollElementOffsetTop={2}
        syncWith='editor'
        onClick={onCatalogClick}
        catalogMaxDepth={props.catalogMaxDepth}
      />
    );
  }, [editorId, mdHeadingId, onCatalogClick, props.catalogMaxDepth, theme]);

  return (
    <div className={`${prefix}-content`}>
      {drawioCreation}
      {editor && linkRange && (
        <LinkEditor editor={editor} range={linkRange} onClose={() => setLinkRange(null)} />
      )}
      <div className={`${prefix}-content-wrapper ${prefix}-richtext-wrapper`}>
        <CustomScrollbar style={{ flex: 1 }}>
          <div className={`${prefix}-richtext-scroll`}>
            <EditorContent editor={editor} />
          </div>
        </CustomScrollbar>
      </div>
      {catalogVisible && (
        <CustomScrollbar className={`${prefix}-catalog-${props.catalogLayout}`}>
          {catalog}
        </CustomScrollbar>
      )}
    </div>
  );
});

export default memo(RichTextContent);

import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { Admonition, CodeBlock, KatexBlock, KatexInline } from './nodes';

/** 与 markdown-it-image-figures 使用相同 DOM，确保图片与图注主题规则一致。 */
const PreviewImage = Image.extend({
  parseHTML() {
    return [{ tag: 'img[src]' }, { tag: 'figure img[src]' }];
  },
  renderHTML({ HTMLAttributes }) {
    const imageAttributes = {
      ...this.options.HTMLAttributes,
      ...HTMLAttributes,
      class: [this.options.HTMLAttributes.class, HTMLAttributes.class, 'md-zoom']
        .filter(Boolean)
        .join(' '),
    };
    const caption = String(HTMLAttributes.alt || '').trim();
    return [
      'figure',
      {},
      ['img', imageAttributes],
      ...(caption ? [['figcaption', {}, caption]] : []),
    ];
  },
});

const PreviewTaskList = TaskList.extend({
  addAttributes() {
    return {
      tight: {
        default: true,
        parseHTML: (element: HTMLElement) => {
          const serializedValue = element.getAttribute('data-tight');
          if (serializedValue !== null) {
            return serializedValue === 'true';
          }

          // markdown-it hides paragraph wrappers for tight lists and emits them for
          // loose lists. Preserve that distinction when entering rich-text mode.
          return !element.querySelector(':scope > li > p');
        },
        renderHTML: (attributes: { tight?: boolean }) => ({
          'data-tight': attributes.tight === false ? 'false' : 'true',
        }),
      },
    };
  },
});

/**
 * 构建 TipTap 扩展列表
 *
 * StarterKit 提供：heading / bold / italic / strike / code / codeBlock(被自定义替换) /
 * bulletList / orderedList / blockquote / horizontalRule / history 等。
 *
 * 自定义节点（实现高级语法所见即所得）：
 * - CodeBlock：替换默认代码块，对 mermaid/echarts/plantuml 渲染图表
 * - KatexInline / KatexBlock：行内与块级公式
 * - Admonition：告示块
 *
 * 额外补充：underline / sub / sup / link / image / table / taskList / placeholder
 * 以及 tiptap-markdown 用于 Markdown 与 ProseMirror 文档的双向序列化。
 *
 * @param placeholder 占位提示文本
 * @param codeFoldable 是否开启代码折叠（与 markdown 模式一致）
 * @param autoFoldThreshold 自动折叠的行数阈值
 */
export const buildRichTextExtensions = (
  placeholder: string,
  codeFoldable: boolean,
  autoFoldThreshold: number,
) => {
  return [
    // 关闭 StarterKit 自带 codeBlock，使用自定义 CodeBlock（支持图表渲染）
    StarterKit.configure({
      codeBlock: false,
    }),
    Underline,
    Subscript,
    Superscript,
    Link.configure({
      openOnClick: false,
    }),
    PreviewImage,
    Table,
    TableRow,
    TableCell,
    TableHeader,
    // 复用 markdown-it 预览输出的类名，让预览主题中的任务列表规则
    // 同时作用于 TipTap 的等价节点。
    PreviewTaskList.configure({
      HTMLAttributes: {
        class: 'contains-task-list',
      },
    }),
    TaskItem.configure({
      nested: true,
      HTMLAttributes: {
        class: 'task-list-item',
      },
    }),
    Placeholder.configure({
      placeholder,
      emptyEditorClass: 'md-editor-richtext-placeholder',
    }),
    // 高级语法自定义节点
    CodeBlock.configure({
      codeFoldable,
      autoFoldThreshold,
    }),
    KatexInline,
    KatexBlock,
    Admonition,
    // 预览器使用 markdown-it breaks:true；富文本必须采用同一软换行语义，
    // 否则同一段 Markdown 在两种模式下会出现肉眼可见的断行差异。
    Markdown.configure({
      html: true,
      breaks: true,
      // 保留浏览器/ProseMirror 的富文本剪贴板：text/html 携带所见样式，
      // text/plain 只包含可见文字，不再把选择内容重新序列化成 Markdown。
      transformCopiedText: false,
    }),
  ];
};

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
      HTMLAttributes: {
        // 复用预览区链接样式
        class: 'md-editor-preview a',
      },
    }),
    Image.configure({
      HTMLAttributes: {
        class: 'md-editor-preview img',
      },
    }),
    Table,
    TableRow,
    TableCell,
    TableHeader,
    TaskList,
    TaskItem.configure({ nested: true }),
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
    // 启用 Markdown 解析与序列化，breaks: false 保留标准 Markdown 段落语义
    Markdown.configure({
      html: true,
      breaks: false,
      transformCopiedText: true,
    }),
  ];
};

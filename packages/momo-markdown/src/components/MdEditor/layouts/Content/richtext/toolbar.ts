import type { Editor } from '@tiptap/core';
import { DOMParser } from '@tiptap/pm/model';
import { isTextAlignment } from '~/utils/alignment';
import { getChartFenceLang, getChartTemplate } from '~/utils/chart/templates';
import type { TToolDirective } from '~/utils/content-help';

/** Insert parsed nodes, bypassing tiptap-markdown's inline string parser. */
function insertMarkdown(editor: Editor, markdown: string) {
  const container = document.createElement('div');
  container.innerHTML = (editor.storage as any).markdown.parser.parse(markdown);
  const slice = DOMParser.fromSchema(editor.schema).parseSlice(container, {
    preserveWhitespace: true,
    context: editor.state.selection.$from,
  });
  editor.view.dispatch(editor.state.tr.replaceSelection(slice).scrollIntoView());
  editor.commands.focus();
}

export function applyRichTextDirective(editor: Editor, direct: TToolDirective, params: any = {}) {
  if (!editor.isEditable) return;
  const chain = () => editor.chain().focus();
  if (/^h[1-6]$/.test(direct)) {
    chain()
      .toggleHeading({ level: Number(direct.slice(1)) as 1 | 2 | 3 | 4 | 5 | 6 })
      .run();
    return;
  }
  switch (direct) {
    case 'bold':
      chain().toggleBold().run();
      return;
    case 'italic':
      chain().toggleItalic().run();
      return;
    case 'strikeThrough':
      chain().toggleStrike().run();
      return;
    case 'underline':
      chain().toggleUnderline().run();
      return;
    case 'sub':
      chain().toggleSubscript().run();
      return;
    case 'sup':
      chain().toggleSuperscript().run();
      return;
    case 'codeRow':
      chain().toggleCode().run();
      return;
    case 'quote':
      chain().toggleBlockquote().run();
      return;
    case 'align': {
      if (!isTextAlignment(params.alignment)) return;
      const transaction = editor.state.tr;
      editor.state.doc.nodesBetween(
        editor.state.selection.from,
        editor.state.selection.to,
        (node, pos) => {
          if (['paragraph', 'heading', 'image'].includes(node.type.name)) {
            transaction.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              textAlign: params.alignment,
            });
          }
        },
      );
      if (transaction.docChanged) editor.view.dispatch(transaction);
      editor.commands.focus();
      return;
    }
    case 'unorderedList':
      chain().toggleBulletList().run();
      return;
    case 'orderedList':
      chain().toggleOrderedList().run();
      return;
    case 'task':
      chain().toggleTaskList().run();
      return;
    case 'code':
      chain().toggleCodeBlock().run();
      return;
    case 'link': {
      const { from, to } = editor.state.selection;
      if (from !== to && !params.desc && params.url) {
        chain().setLink({ href: params.url }).run();
        return;
      }
      const text = params.desc || editor.state.doc.textBetween(from, to, '\n') || '链接';
      chain()
        .insertContent({
          type: 'text',
          text,
          marks: params.url ? [{ type: 'link', attrs: { href: params.url } }] : [],
        })
        .run();
      return;
    }
    case 'image': {
      const uploads = Array.isArray(params.urls) ? params.urls : [params.url];
      const images = uploads.flatMap((upload) => {
        const src = typeof upload === 'string' ? upload : upload?.url;
        if (typeof src !== 'string' || !src.trim()) return [];
        return [
          {
            type: 'image',
            attrs: {
              src: src.trim(),
              alt: typeof upload === 'object' ? upload.alt || params.desc || '' : params.desc || '',
              title: typeof upload === 'object' ? upload.title || null : null,
            },
          },
        ];
      });
      if (images.length) chain().insertContent(images).run();
      return;
    }
    case 'table': {
      const { selectedShape = { x: 1, y: 1 } } = params;
      chain()
        .insertTable({ rows: selectedShape.x + 2, cols: selectedShape.y + 1, withHeaderRow: true })
        .run();
      return;
    }
    case 'universal': {
      const { from, to } = editor.state.selection;
      const result = params.generate?.(editor.state.doc.textBetween(from, to, '\n'));
      if (result?.targetValue !== undefined) insertMarkdown(editor, result.targetValue);
      return;
    }
    case 'katexInline':
    case 'katexBlock':
      chain()
        .insertContent({ type: direct, attrs: { latex: '公式' } })
        .run();
      return;
    default: {
      const language = getChartFenceLang(direct);
      const template = getChartTemplate(direct);
      if (language && template) {
        // Plain code must never pass through the Markdown inline parser: its newlines
        // and link-like syntax belong to the diagram language.
        chain()
          .insertContent({
            type: 'codeBlock',
            attrs: { language },
            content: [{ type: 'text', text: template }],
          })
          .run();
      }
    }
  }
}

import { ReactNodeViewRenderer } from '@tiptap/react';
import { Node } from '@tiptap/core';
import { prefix } from '~/config';
import { registerKatexParse } from './katexParse';
import KatexView from './KatexView';

/**
 * 行内公式节点（inline atom）
 *
 * Markdown 语法：`$latex$`（也兼容 `\(...\)`、`$$...$$` 行内形式）
 * 序列化：`$` + latex + `$`
 */
export const KatexInline = Node.create({
  name: 'katexInline',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (el) => el.textContent || '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: `span.${prefix}-katex-inline`,
        priority: 100,
      },
    ];
  },

  renderHTML({ node }) {
    return ['span', { class: `${prefix}-katex-inline` }, node.attrs.latex];
  },

  addNodeView() {
    return ReactNodeViewRenderer(KatexView as any);
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          state.write(`$${node.attrs.latex}$`);
        },
        parse: {
          setup(md: any) {
            registerKatexParse(md);
          },
        },
      },
    };
  },
});

export default KatexInline;

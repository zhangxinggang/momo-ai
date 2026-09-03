import { ReactNodeViewRenderer } from '@tiptap/react';
import { Node } from '@tiptap/core';
import { prefix } from '~/config';
import { registerKatexParse } from './katexParse';
import KatexView from './KatexView';

/**
 * 块级公式节点（block atom）
 *
 * Markdown 语法：
 * ```
 * $$
 * latex
 * $$
 * ```
 * 序列化：`$$\n` + latex + `\n$$`
 */
export const KatexBlock = Node.create({
  name: 'katexBlock',
  group: 'block',
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
        tag: `p.${prefix}-katex-block`,
        // 优先于普通段落节点匹配
        priority: 100,
      },
    ];
  },

  renderHTML({ node }) {
    return ['p', { class: `${prefix}-katex-block` }, node.attrs.latex];
  },

  addNodeView() {
    return ReactNodeViewRenderer(KatexView as any);
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          state.write('$$\n');
          state.text(node.attrs.latex, false);
          state.ensureNewLine();
          state.write('$$');
          state.closeBlock(node);
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

export default KatexBlock;

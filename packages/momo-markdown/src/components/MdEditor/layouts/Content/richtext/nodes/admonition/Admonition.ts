import { ReactNodeViewRenderer } from '@tiptap/react';
import { Node } from '@tiptap/core';
import { prefix } from '~/config';
import { registerAdmonitionParse } from './admonitionParse';
import AdmonitionView from './AdmonitionView';

/**
 * Admonition（告示块）节点
 *
 * Markdown 语法：
 * ```
 * !!! type 可选标题
 * 内容
 * !!!
 * ```
 *
 * 节点包含块级内容，type 与 title 为属性。
 */
export const Admonition = Node.create({
  name: 'admonition',
  group: 'block',
  content: 'block+',

  addAttributes() {
    return {
      type: {
        default: 'note',
        parseHTML: (el) => el.getAttribute('data-admonition-type') || 'note',
      },
      title: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-admonition-title') || '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: `div.${prefix}-admonition`,
        priority: 60,
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const attrs = {
      ...HTMLAttributes,
      class: `${prefix}-admonition ${prefix}-admonition-${node.attrs.type}`,
      'data-admonition-type': node.attrs.type,
      'data-admonition-title': node.attrs.title,
    };
    return ['div', attrs, 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AdmonitionView as any);
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          state.write(`!!! ${node.attrs.type}${node.attrs.title ? ' ' + node.attrs.title : ''}\n`);
          state.renderContent(node);
          state.ensureNewLine();
          state.write('!!!');
          state.closeBlock(node);
        },
        parse: {
          setup(md: any) {
            registerAdmonitionParse(md);
          },
        },
      },
    };
  },
});

export default Admonition;

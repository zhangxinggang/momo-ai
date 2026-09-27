import { Extension, getHTMLFromFragment } from '@tiptap/core';
import { Fragment, type Node } from '@tiptap/pm/model';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import {
  alignmentClosing,
  alignmentOpening,
  isTextAlignment,
  readTextAlignment,
} from '~/utils/alignment';

/** Nested Markdown lists/tables cannot carry paragraph wrappers; use their schema HTML. */
export const AlignedMarkdown = Markdown.extend({
  onBeforeCreate(event) {
    this.parent?.(event);
    const serializer = (this.editor.storage as any).markdown.serializer;
    const serializeNode = serializer.serializeNode.bind(serializer);
    serializer.serializeNode = (extension: { name: string }) => {
      const serialize = serializeNode(extension);
      if (
        !serialize ||
        !['bulletList', 'orderedList', 'taskList', 'table'].includes(extension.name)
      ) {
        return serialize;
      }
      return (state: any, node: Node, parent: Node, index: number) => {
        let aligned = false;
        node.descendants((child) => {
          if (
            isTextAlignment(child.attrs.textAlign) &&
            (child.type.name !== 'image' || child.attrs.textAlign !== 'center')
          )
            aligned = true;
        });
        if (aligned) {
          state.write(getHTMLFromFragment(Fragment.from(node), node.type.schema));
          state.closeBlock(node);
        } else {
          serialize(state, node, parent, index);
        }
      };
    };
  },
});

/** Preserve paragraph/heading alignment without replacing their inline Markdown syntax. */
export const AlignedStarterKit = StarterKit.extend({
  addExtensions() {
    return (this.parent?.() || []).map((extension) => {
      if (extension.name !== 'paragraph' && extension.name !== 'heading') return extension;
      return extension.extend({
        addStorage() {
          return {
            markdown: {
              serialize(state: any, node: any) {
                const alignment = node.attrs.textAlign;
                if (isTextAlignment(alignment)) state.write(alignmentOpening(alignment));
                if (node.type.name === 'heading') state.write(`${'#'.repeat(node.attrs.level)} `);
                if (!node.content.size && isTextAlignment(alignment)) {
                  state.write('<p></p>');
                } else {
                  state.renderInline(node);
                }
                if (isTextAlignment(alignment)) state.write(alignmentClosing);
                state.closeBlock(node);
              },
            },
          };
        },
      });
    });
  },
});

export const TextAlignment = Extension.create({
  name: 'momoTextAlignment',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          textAlign: {
            default: null,
            parseHTML: (element: HTMLElement) => readTextAlignment(element),
            renderHTML: (attributes) =>
              isTextAlignment(attributes.textAlign)
                ? { style: `text-align: ${attributes.textAlign};` }
                : {},
          },
        },
      },
      {
        types: ['image'],
        attributes: {
          textAlign: {
            default: 'center',
            parseHTML: (element: HTMLElement) => readTextAlignment(element, 'center'),
            renderHTML: (attributes) =>
              isTextAlignment(attributes.textAlign) && attributes.textAlign !== 'center'
                ? {
                    'data-align': attributes.textAlign,
                    style: `text-align: ${attributes.textAlign};`,
                  }
                : {},
          },
        },
      },
    ];
  },
});

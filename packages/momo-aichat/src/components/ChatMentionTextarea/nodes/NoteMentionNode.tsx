import type { JSX } from 'react';
import {
  $applyNodeReplacement,
  DecoratorNode,
  type DOMExportOutput,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical';

import { NoteMentionChip } from '../components/NoteMentionChip';

export type SerializedNoteMentionNode = Spread<
  { type: 'note-mention'; path: string; version: 1 },
  SerializedLexicalNode
>;

export class NoteMentionNode extends DecoratorNode<JSX.Element> {
  __path: string;

  static getType(): string {
    return 'note-mention';
  }

  static clone(node: NoteMentionNode): NoteMentionNode {
    return new NoteMentionNode(node.__path, node.__key);
  }

  constructor(path: string, key?: NodeKey) {
    super(key);
    this.__path = path;
  }

  getPath(): string {
    return this.__path;
  }

  createDOM(): HTMLElement {
    const span = document.createElement('span');
    span.className = 'note-mention-node';
    span.contentEditable = 'false';
    return span;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): boolean {
    return true;
  }

  isKeyboardSelectable(): boolean {
    return true;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span');
    element.setAttribute('data-note-mention', this.__path);
    element.textContent = `@[note:${this.__path}]`;
    return { element };
  }

  static importJSON(serialized: SerializedNoteMentionNode): NoteMentionNode {
    return $createNoteMentionNode(serialized.path);
  }

  exportJSON(): SerializedNoteMentionNode {
    return {
      type: 'note-mention',
      path: this.__path,
      version: 1,
    };
  }

  decorate(): JSX.Element {
    return <NoteMentionChip path={this.__path} nodeKey={this.getKey()} />;
  }
}

export function $createNoteMentionNode(path: string): NoteMentionNode {
  return $applyNodeReplacement(new NoteMentionNode(path));
}

export function $isNoteMentionNode(
  node: LexicalNode | null | undefined,
): node is NoteMentionNode {
  return node instanceof NoteMentionNode;
}

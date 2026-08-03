import {
  $createLineBreakNode,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isLineBreakNode,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  type ElementNode,
  type LexicalNode,
} from 'lexical';

import { $createNoteMentionNode, $isNoteMentionNode } from '../nodes/NoteMentionNode';
import {
  editorSegmentsToValue,
  findSegmentAtValueIndex,
  getSegmentCursorIndex,
  valueToEditorSegments,
  type IEditorSegment,
} from './editor-value';

function $getParagraph(): ElementNode {
  const root = $getRoot();
  const first = root.getFirstChild();
  if ($isParagraphNode(first)) {
    return first;
  }
  if ($isElementNode(first)) {
    return first;
  }
  const paragraph = $createParagraphNode();
  root.append(paragraph);
  return paragraph;
}

export function $readEditorSegments(): IEditorSegment[] {
  const paragraph = $getParagraph();
  const segments: IEditorSegment[] = [];
  const children = paragraph.getChildren();
  for (const child of children) {
    if ($isTextNode(child)) {
      const text = child.getTextContent();
      if (text.length > 0) {
        segments.push({ type: 'text', text });
      }
      continue;
    }
    if ($isLineBreakNode(child)) {
      segments.push({ type: 'linebreak' });
      continue;
    }
    if ($isNoteMentionNode(child)) {
      segments.push({ type: 'mention', path: child.getPath() });
    }
  }
  return segments;
}

export function $serializeEditorToValue(): string {
  return editorSegmentsToValue($readEditorSegments());
}

export function $writeEditorFromValue(value: string): void {
  const root = $getRoot();
  root.clear();
  const paragraph = $createParagraphNode();
  const segments = valueToEditorSegments(value);
  for (const segment of segments) {
    if (segment.type === 'text') {
      paragraph.append($createTextNode(segment.text));
    } else if (segment.type === 'mention') {
      paragraph.append($createNoteMentionNode(segment.path));
    } else {
      paragraph.append($createLineBreakNode());
    }
  }
  root.append(paragraph);
  // 空内容时保证有可编辑段落
  if (paragraph.getChildrenSize() === 0) {
    paragraph.append($createTextNode(''));
  }
}

function $getChildSegmentIndex(node: LexicalNode): number {
  const paragraph = $getParagraph();
  const children = paragraph.getChildren();
  return children.findIndex((child) => child.getKey() === node.getKey());
}

export function $getSelectionValueIndex(): number {
  const selection = $getSelection();
  const segments = $readEditorSegments();
  if (!$isRangeSelection(selection)) {
    return editorSegmentsToValue(segments).length;
  }

  const anchor = selection.anchor;
  const anchorNode = anchor.getNode();

  if ($isTextNode(anchorNode)) {
    const segmentIndex = $getChildSegmentIndex(anchorNode);
    if (segmentIndex < 0) {
      return 0;
    }
    return getSegmentCursorIndex(segments, segmentIndex, anchor.offset);
  }

  if ($isNoteMentionNode(anchorNode) || $isLineBreakNode(anchorNode)) {
    const segmentIndex = $getChildSegmentIndex(anchorNode);
    if (segmentIndex < 0) {
      return 0;
    }
    return getSegmentCursorIndex(segments, segmentIndex, anchor.offset > 0 ? 1 : 0);
  }

  // 选区落在 paragraph 上：offset 为子节点索引
  const paragraph = $getParagraph();
  if (anchorNode.getKey() === paragraph.getKey()) {
    const childIndex = Math.min(anchor.offset, paragraph.getChildrenSize());
    if (childIndex <= 0) {
      return 0;
    }
    // 落在第 childIndex 个子节点之前 = 前一段结束
    return getSegmentCursorIndex(segments, childIndex - 1, 1);
  }

  return editorSegmentsToValue(segments).length;
}

export function $setSelectionByValueIndex(value: string, valueIndex: number): void {
  const segments = valueToEditorSegments(value);
  const located = findSegmentAtValueIndex(segments, valueIndex);
  const paragraph = $getParagraph();
  const children = paragraph.getChildren();
  const target = children[located.segmentIndex];

  if (!target) {
    paragraph.selectEnd();
    return;
  }

  if ($isTextNode(target)) {
    const offset = Math.min(located.offset, target.getTextContentSize());
    target.select(offset, offset);
    return;
  }

  if ($isNoteMentionNode(target) || $isLineBreakNode(target)) {
    if (located.offset > 0) {
      target.selectNext(0, 0);
    } else {
      target.selectPrevious(0, 0);
    }
    return;
  }

  paragraph.selectEnd();
}

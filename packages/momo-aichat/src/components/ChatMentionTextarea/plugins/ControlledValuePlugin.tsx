import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createLineBreakNode,
  $createTextNode,
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  KEY_BACKSPACE_COMMAND,
  PASTE_COMMAND,
} from 'lexical';
import { useEffect, useRef, type MutableRefObject } from 'react';

import { $createNoteMentionNode, $isNoteMentionNode } from '../nodes/NoteMentionNode';
import {
  $getSelectionValueIndex,
  $serializeEditorToValue,
  $setSelectionByValueIndex,
  $writeEditorFromValue,
} from '../utils/editor-ops';
import { valueToEditorSegments } from '../utils/editor-value';

interface IProps {
  value: string;
  onChange: (value: string) => void;
  onSelectionChange?: (selectionStart: number) => void;
  pendingSelectionRef: MutableRefObject<number | null>;
}

export function ControlledValuePlugin(props: IProps) {
  const { value, onChange, onSelectionChange, pendingSelectionRef } = props;
  const [editor] = useLexicalComposerContext();
  const lastEmittedValueRef = useRef(value);
  const isInternalUpdateRef = useRef(false);

  // 首次挂载写入受控 value
  useEffect(() => {
    isInternalUpdateRef.current = true;
    editor.update(() => {
      $writeEditorFromValue(value);
    });
    lastEmittedValueRef.current = value;
    queueMicrotask(() => {
      isInternalUpdateRef.current = false;
    });
    // 仅挂载时
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  // 外部 value → 编辑器
  useEffect(() => {
    if (value === lastEmittedValueRef.current) {
      return;
    }
    if (editor.isComposing()) {
      return;
    }

    let current = '';
    editor.getEditorState().read(() => {
      current = $serializeEditorToValue();
    });
    if (current === value) {
      lastEmittedValueRef.current = value;
      return;
    }

    const pending = pendingSelectionRef.current;
    isInternalUpdateRef.current = true;
    editor.update(() => {
      $writeEditorFromValue(value);
      $setSelectionByValueIndex(value, pending ?? value.length);
    });
    pendingSelectionRef.current = null;
    lastEmittedValueRef.current = value;
    queueMicrotask(() => {
      isInternalUpdateRef.current = false;
    });
  }, [editor, pendingSelectionRef, value]);

  // 编辑器 → 外部 value / 选区
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      if (isInternalUpdateRef.current || editor.isComposing()) {
        return;
      }
      editorState.read(() => {
        const nextValue = $serializeEditorToValue();
        const selectionStart = $getSelectionValueIndex();
        if (nextValue !== lastEmittedValueRef.current) {
          lastEmittedValueRef.current = nextValue;
          onChange(nextValue);
        }
        onSelectionChange?.(selectionStart);
      });
    });
  }, [editor, onChange, onSelectionChange]);

  // IME 上屏后把光标滚入可视区（避免组合结束瞬间视口停在顶部）
  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement) {
      return;
    }
    const handleCompositionEnd = () => {
      requestAnimationFrame(() => {
        const el = editor.getRootElement();
        if (!el) {
          return;
        }
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
          return;
        }
        const range = selection.getRangeAt(0);
        const caretRect = range.getBoundingClientRect();
        const rootRect = el.getBoundingClientRect();
        if (caretRect.height === 0) {
          return;
        }
        if (caretRect.bottom > rootRect.bottom) {
          el.scrollTop += caretRect.bottom - rootRect.bottom + 4;
        } else if (caretRect.top < rootRect.top) {
          el.scrollTop -= rootRect.top - caretRect.top + 4;
        }
      });
    };
    rootElement.addEventListener('compositionend', handleCompositionEnd);
    return () => {
      rootElement.removeEventListener('compositionend', handleCompositionEnd);
    };
  }, [editor]);

  // 粘贴纯文本，解析合法 mention token
  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        const clipboardEvent = event as ClipboardEvent | null;
        const text = clipboardEvent?.clipboardData?.getData('text/plain');
        if (text == null) {
          return false;
        }
        clipboardEvent?.preventDefault();
        editor.update(() => {
          const segments = valueToEditorSegments(text);
          const nodes = segments.map((segment) => {
            if (segment.type === 'text') {
              return $createTextNode(segment.text);
            }
            if (segment.type === 'mention') {
              return $createNoteMentionNode(segment.path);
            }
            return $createLineBreakNode();
          });
          $insertNodes(nodes);
        });
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor]);

  // Backspace：光标紧贴 mention 时整块删除
  useEffect(() => {
    return editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return false;
        }
        const anchor = selection.anchor;
        const anchorNode = anchor.getNode();
        if ($isNoteMentionNode(anchorNode)) {
          anchorNode.remove();
          return true;
        }
        if (anchor.offset === 0) {
          const prev = anchorNode.getPreviousSibling();
          if ($isNoteMentionNode(prev)) {
            prev.remove();
            return true;
          }
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor]);

  return null;
}

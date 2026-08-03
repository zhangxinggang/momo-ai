import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useImperativeHandle, type MutableRefObject, type Ref, type RefObject } from 'react';

import type { IChatMentionTextareaRef } from '../types';
import {
  $getSelectionValueIndex,
  $serializeEditorToValue,
  $setSelectionByValueIndex,
} from '../utils/editor-ops';

interface IProps {
  apiRef: Ref<IChatMentionTextareaRef>;
  editableRef: RefObject<HTMLDivElement | null>;
  pendingSelectionRef: MutableRefObject<number | null>;
  onSelectionChange?: (selectionStart: number) => void;
}

export function ImperativeApiPlugin(props: IProps) {
  const { apiRef, editableRef, pendingSelectionRef, onSelectionChange } = props;
  const [editor] = useLexicalComposerContext();

  useImperativeHandle(
    apiRef,
    () => ({
      focus: () => {
        editor.focus();
        editableRef.current?.focus();
      },
      getSelectionStart: () => {
        let index = 0;
        editor.getEditorState().read(() => {
          index = $getSelectionValueIndex();
        });
        return index;
      },
      setSelectionStart: (next: number) => {
        pendingSelectionRef.current = next;
        editor.update(() => {
          const value = $serializeEditorToValue();
          if (next <= value.length) {
            $setSelectionByValueIndex(value, next);
          }
        });
        onSelectionChange?.(next);
        editor.focus();
      },
      getEditableElement: () => editableRef.current,
    }),
    [apiRef, editableRef, editor, onSelectionChange, pendingSelectionRef],
  );

  return null;
}

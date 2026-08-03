import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { useCallback } from 'react';

import { NoteReferenceChip } from '../../../NoteReferenceChip';
import { useChatMentionCallbacks } from '../../context/ChatMentionCallbacksContext';
import { $isNoteMentionNode } from '../../nodes/NoteMentionNode';
import { $readEditorSegments } from '../../utils/editor-ops';
import { getSegmentCursorIndex } from '../../utils/editor-value';

interface IProps {
  path: string;
  nodeKey: string;
}

export function NoteMentionChip(props: IProps) {
  const { path, nodeKey } = props;
  const [editor] = useLexicalComposerContext();
  const { onMentionClick } = useChatMentionCallbacks();

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      editor.getEditorState().read(() => {
        const node = $getNodeByKey(nodeKey);
        if (!$isNoteMentionNode(node)) {
          return;
        }
        const parent = node.getParent();
        if (!parent) {
          return;
        }
        const segmentIndex = parent.getChildren().findIndex((child) => child.getKey() === nodeKey);
        if (segmentIndex < 0) {
          return;
        }
        const segments = $readEditorSegments();
        // 落在 token 内部，便于 findMentionAtCursor 命中
        const cursorPos = getSegmentCursorIndex(segments, segmentIndex, 0) + 1;
        onMentionClick?.(cursorPos);
      });
    },
    [editor, nodeKey, onMentionClick],
  );

  return (
    <span
      onClick={handleClick}
      onMouseDown={(event) => event.preventDefault()}
      style={{ cursor: 'pointer' }}>
      <NoteReferenceChip
        path={path}
        showTooltip={false}
      />
    </span>
  );
}

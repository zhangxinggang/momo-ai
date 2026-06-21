import { useMemo } from 'react';

import { parseNoteReferenceContent } from '../../utils/note-mention';
import { NoteReferenceChip } from '../NoteReferenceChip';

interface IProps {
  content: string;
  plainClassName?: string;
}

/** 将含 @[note:path] 的文本渲染为普通文字 + 笔记引用 chip */
export function NoteReferenceText(props: IProps) {
  const { content, plainClassName } = props;
  const segments = useMemo(() => parseNoteReferenceContent(content), [content]);

  return (
    <>
      {segments.map((segment, index) => {
        if (segment.type === 'mention') {
          return <NoteReferenceChip key={`mention-${index}`} path={segment.path} />;
        }
        return (
          <span key={`text-${index}`} className={plainClassName}>
            {segment.value}
          </span>
        );
      })}
    </>
  );
}

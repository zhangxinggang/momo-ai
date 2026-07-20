import { useCallback, useMemo, type KeyboardEvent, type MouseEvent } from 'react';

import { useAiChatConfig } from '../../contexts/AiChatConfigContext';
import { isHttpUrl, splitPlainTextByHttpUrls } from '../../utils/external-url';
import { parseNoteReferenceContent } from '../../utils/note-mention';
import { NoteReferenceChip } from '../NoteReferenceChip';
import styles from './index.module.less';

interface IProps {
  content: string;
  plainClassName?: string;
}

/** 将含 @[note:path] 的文本渲染为普通文字 + 笔记引用 chip，并支持 http(s) 链接点击 */
export function NoteReferenceText(props: IProps) {
  const { content, plainClassName } = props;
  const { onOpenExternalUrl } = useAiChatConfig();
  const segments = useMemo(() => parseNoteReferenceContent(content), [content]);

  const handleOpenUrl = useCallback(
    (url: string) => {
      if (!onOpenExternalUrl || !isHttpUrl(url)) {
        return;
      }
      void onOpenExternalUrl(url);
    },
    [onOpenExternalUrl],
  );

  const handleUrlClick = useCallback(
    (event: MouseEvent<HTMLSpanElement>) => {
      const url = event.currentTarget.getAttribute('data-external-url');
      if (!url) {
        return;
      }
      event.preventDefault();
      handleOpenUrl(url);
    },
    [handleOpenUrl],
  );

  const handleUrlKeyDown = useCallback(
    (event: KeyboardEvent<HTMLSpanElement>) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }
      const url = event.currentTarget.getAttribute('data-external-url');
      if (!url) {
        return;
      }
      event.preventDefault();
      handleOpenUrl(url);
    },
    [handleOpenUrl],
  );

  return (
    <>
      {segments.map((segment, index) => {
        if (segment.type === 'mention') {
          return <NoteReferenceChip key={`mention-${index}`} path={segment.path} />;
        }

        if (!onOpenExternalUrl) {
          return (
            <span key={`text-${index}`} className={plainClassName}>
              {segment.value}
            </span>
          );
        }

        const parts = splitPlainTextByHttpUrls(segment.value);
        return parts.map((part, partIndex) => {
          if (part.kind === 'url') {
            return (
              <span
                className={styles['external-url']}
                data-external-url={part.value}
                key={`url-${index}-${partIndex}`}
                onClick={handleUrlClick}
                onKeyDown={handleUrlKeyDown}
                role='link'
                tabIndex={0}>
                {part.value}
              </span>
            );
          }
          return (
            <span key={`text-${index}-${partIndex}`} className={plainClassName}>
              {part.value}
            </span>
          );
        });
      })}
    </>
  );
}

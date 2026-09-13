import classNames from 'classnames';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type Ref,
} from 'react';

import {
  findNoteMentions,
  removeMentionTokenAt,
  SURFACE_MENTION_REGEX,
  SURFACE_MENTION_START,
  surfaceIndexToValueIndex,
  surfaceToValue,
  valueIndexToSurfaceIndex,
  valueToSurface,
} from '../../utils/note-mention';
import {
  findSlashInvocationTokens,
  removeSlashInvocationTokenAt,
  SURFACE_SLASH_COMMAND,
  SURFACE_SLASH_REGEX,
  SURFACE_SLASH_START,
} from '../../utils/slash-token';
import { NoteReferenceChip } from '../NoteReferenceChip';
import { SlashInvocationChip } from '../SlashInvocationChip';
import styles from './index.module.less';

export interface IChatMentionTextareaRef {
  focus: () => void;
  getSelectionStart: () => number;
  setSelectionStart: (next: number) => void;
  getTextareaElement: () => HTMLTextAreaElement | null;
}

interface IProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSelectionChange?: (selectionStart: number) => void;
  onMentionClick?: (cursorPos: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function renderMirrorContent(surface: string) {
  if (!surface) {
    return null;
  }

  const parts: React.ReactNode[] = [];
  const matches: Array<{
    start: number;
    end: number;
    type: 'mention' | 'slash';
    label: string;
    kind?: 'skill' | 'command';
    measureText: string;
  }> = [];
  const mentionSurfaceRegex = new RegExp(SURFACE_MENTION_REGEX.source, 'g');
  let match: RegExpExecArray | null;
  while ((match = mentionSurfaceRegex.exec(surface))) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      type: 'mention',
      label: match[1],
      measureText: match[0],
    });
  }
  const slashSurfaceRegex = new RegExp(SURFACE_SLASH_REGEX.source, 'g');
  while ((match = slashSurfaceRegex.exec(surface))) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      type: 'slash',
      kind: match[1] === SURFACE_SLASH_COMMAND ? 'command' : 'skill',
      label: match[2],
      measureText: match[0],
    });
  }
  matches.sort((left, right) => left.start - right.start);

  let lastIndex = 0;
  let index = 0;

  for (const inlineMatch of matches) {
    if (inlineMatch.start > lastIndex) {
      parts.push(
        <span key={`text-${index}`} className={styles['mention-plain']}>
          {surface.slice(lastIndex, inlineMatch.start)}
        </span>,
      );
      index += 1;
    }

    parts.push(
      inlineMatch.type === 'mention' ? (
        <NoteReferenceChip
          key={`chip-${index}`}
          path={inlineMatch.label}
          measureText={inlineMatch.measureText}
          showTooltip={false}
        />
      ) : (
        <SlashInvocationChip
          key={`chip-${index}`}
          invocation={{
            resourceId: '',
            resourceRevision: '',
            command: `/${inlineMatch.label}`,
            label: inlineMatch.label,
            kind: inlineMatch.kind || 'skill',
            scope: 'application',
          }}
          measureText={inlineMatch.measureText}
          showTooltip={false}
        />
      ),
    );
    index += 1;
    lastIndex = inlineMatch.end;
  }

  if (lastIndex < surface.length) {
    parts.push(
      <span key={`tail-${index}`} className={styles['mention-plain']}>
        {surface.slice(lastIndex)}
      </span>,
    );
  }

  // 尾部换行时补 br，与 textarea 额外空行高度对齐
  if (surface.endsWith('\n')) {
    parts.push(<br key={`br-${index}`} />);
  }

  return parts;
}

function ChatMentionTextareaInner(props: IProps, ref: Ref<IChatMentionTextareaRef>) {
  const {
    value,
    onChange,
    onKeyDown,
    onSelectionChange,
    onMentionClick,
    placeholder,
    disabled,
    className,
    style,
  } = props;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const mirrorContentRef = useRef<HTMLDivElement>(null);
  const pendingSelectionRef = useRef<number | null>(null);

  const surfaceValue = useMemo(() => valueToSurface(value), [value]);
  // 没有行内引用时不走镜像层，避免中文多行换行与光标错位。
  const hasMentionSurface =
    surfaceValue.includes(SURFACE_MENTION_START) || surfaceValue.includes(SURFACE_SLASH_START);

  const mirrorTypographyStyle = useMemo<CSSProperties>(() => {
    if (!style) {
      return {};
    }
    const { height: _height, transition: _transition, ...typographyStyle } = style;
    return typographyStyle;
  }, [style]);

  const syncMirrorLayout = useCallback(() => {
    const textarea = textareaRef.current;
    const mirror = mirrorRef.current;
    const mirrorContent = mirrorContentRef.current;
    if (!textarea || !mirror || !mirrorContent) {
      return;
    }
    mirrorContent.style.transform = `translate(${-textarea.scrollLeft}px, ${-textarea.scrollTop}px)`;
    const scrollbarWidth = textarea.offsetWidth - textarea.clientWidth;
    mirror.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : '0px';
    mirror.style.height = `${textarea.clientHeight}px`;
  }, []);

  const notifySelection = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    const valueIndex = surfaceIndexToValueIndex(value, textarea.selectionStart);
    onSelectionChange?.(valueIndex);
  }, [onSelectionChange, value]);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => textareaRef.current?.focus(),
      getSelectionStart: () => {
        const textarea = textareaRef.current;
        if (!textarea) {
          return 0;
        }
        return surfaceIndexToValueIndex(value, textarea.selectionStart);
      },
      setSelectionStart: (next: number) => {
        const textarea = textareaRef.current;
        if (!textarea) {
          return;
        }
        const surfaceIndex = valueIndexToSurfaceIndex(value, next);
        textarea.focus();
        textarea.setSelectionRange(surfaceIndex, surfaceIndex);
        onSelectionChange?.(next);
      },
      getTextareaElement: () => textareaRef.current,
    }),
    [onSelectionChange, value],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      const textarea = textareaRef.current;
      if (textarea) {
        const valueCursor = surfaceIndexToValueIndex(value, textarea.selectionStart);
        const isBackspace = event.key === 'Backspace';
        const slashHit = findSlashInvocationTokens(value).find((item) =>
          isBackspace
            ? valueCursor > item.start && valueCursor <= item.end
            : valueCursor >= item.start && valueCursor < item.end,
        );
        const mentionHit = findNoteMentions(value).find((item) =>
          isBackspace
            ? valueCursor > item.start && valueCursor <= item.end
            : valueCursor >= item.start && valueCursor < item.end,
        );
        const nextValue = slashHit
          ? removeSlashInvocationTokenAt(
              value,
              isBackspace ? valueCursor : Math.min(valueCursor + 1, slashHit.end),
            )
          : mentionHit
            ? removeMentionTokenAt(
                value,
                isBackspace ? valueCursor : Math.min(valueCursor + 1, mentionHit.end),
              )
            : null;
        if (nextValue !== null) {
          event.preventDefault();
          pendingSelectionRef.current = (slashHit ?? mentionHit)!.start;
          onChange(nextValue);
          onSelectionChange?.((slashHit ?? mentionHit)!.start);
          return;
        }
      }
    }
    onKeyDown?.(event);
  };

  useLayoutEffect(() => {
    const pendingSelection = pendingSelectionRef.current;
    const textarea = textareaRef.current;
    if (pendingSelection === null || !textarea) {
      return;
    }
    pendingSelectionRef.current = null;
    const surfaceIndex = valueIndexToSurfaceIndex(value, pendingSelection);
    textarea.setSelectionRange(surfaceIndex, surfaceIndex);
  }, [value]);

  const handleClick = () => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    const valueCursor = surfaceIndexToValueIndex(value, textarea.selectionStart);
    onSelectionChange?.(valueCursor);
    onMentionClick?.(valueCursor);
  };

  useLayoutEffect(() => {
    if (!hasMentionSurface) {
      return;
    }
    syncMirrorLayout();
  }, [surfaceValue, style, hasMentionSurface, syncMirrorLayout]);

  useEffect(() => {
    if (!hasMentionSurface) {
      return;
    }
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    const resizeObserver = new ResizeObserver(() => {
      syncMirrorLayout();
    });
    resizeObserver.observe(textarea);
    return () => {
      resizeObserver.disconnect();
    };
  }, [hasMentionSurface, syncMirrorLayout]);

  return (
    <div className={styles['mention-input']}>
      {hasMentionSurface ? (
        <div
          ref={mirrorRef}
          className={styles['mention-input-mirror']}
          style={mirrorTypographyStyle}
          aria-hidden='true'>
          <div ref={mirrorContentRef} className={styles['mention-input-mirror-content']}>
            {renderMirrorContent(surfaceValue)}
          </div>
        </div>
      ) : null}
      <textarea
        ref={textareaRef}
        value={surfaceValue}
        disabled={disabled}
        placeholder={placeholder}
        spellCheck={false}
        onChange={(event) => {
          const nextSurface = event.target.value;
          const nextValue = surfaceToValue(nextSurface, value);
          onChange(nextValue);
          onSelectionChange?.(surfaceIndexToValueIndex(nextValue, event.target.selectionStart));
        }}
        onKeyDown={handleKeyDown}
        onKeyUp={notifySelection}
        onClick={handleClick}
        onSelect={notifySelection}
        onScroll={hasMentionSurface ? syncMirrorLayout : undefined}
        className={classNames(
          styles['mention-input-textarea'],
          hasMentionSurface
            ? styles['mention-input-textarea-overlay']
            : styles['mention-input-textarea-plain'],
          className,
        )}
        style={style}
      />
    </div>
  );
}

export const ChatMentionTextarea = forwardRef(ChatMentionTextareaInner);

ChatMentionTextarea.displayName = 'ChatMentionTextarea';

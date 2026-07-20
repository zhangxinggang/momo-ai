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
  removeMentionTokenAt,
  SURFACE_MENTION_REGEX,
  SURFACE_MENTION_START,
  surfaceIndexToValueIndex,
  surfaceToValue,
  valueIndexToSurfaceIndex,
  valueToSurface,
} from '../../utils/note-mention';
import { NoteReferenceChip } from '../NoteReferenceChip';
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
  const mentionSurfaceRegex = new RegExp(SURFACE_MENTION_REGEX.source, 'g');
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  let index = 0;

  while ((match = mentionSurfaceRegex.exec(surface))) {
    const start = match.index;
    if (start > lastIndex) {
      parts.push(
        <span key={`text-${index}`} className={styles['mention-plain']}>
          {surface.slice(lastIndex, start)}
        </span>,
      );
      index += 1;
    }

    parts.push(
      <NoteReferenceChip
        key={`chip-${index}`}
        path={match[1]}
        measureText={match[0]}
        showTooltip={false}
      />,
    );
    index += 1;
    lastIndex = start + match[0].length;
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

  const surfaceValue = useMemo(() => valueToSurface(value), [value]);
  // 无笔记引用时不走镜像层，避免中文多行换行与光标错位
  const hasMentionSurface = surfaceValue.includes(SURFACE_MENTION_START);

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
    if (event.key === 'Backspace') {
      const textarea = textareaRef.current;
      if (textarea) {
        const valueCursor = surfaceIndexToValueIndex(value, textarea.selectionStart);
        const nextValue = removeMentionTokenAt(value, valueCursor);
        if (nextValue !== null) {
          event.preventDefault();
          onChange(nextValue);
          onSelectionChange?.(valueCursor);
          return;
        }
      }
    }
    onKeyDown?.(event);
  };

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

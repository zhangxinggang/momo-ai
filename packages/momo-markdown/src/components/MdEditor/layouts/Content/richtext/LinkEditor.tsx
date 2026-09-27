import type { Editor } from '@tiptap/core';
import { useContext, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { prefix } from '~/config';
import { EditorContext } from '~/context';
import { applyRichTextDirective } from './toolbar';

export interface LinkRange {
  from: number;
  to: number;
}

export default function LinkEditor({
  editor,
  range,
  onClose,
}: {
  editor: Editor;
  range: LinkRange;
  onClose: () => void;
}) {
  const { theme } = useContext(EditorContext);
  const [url, setUrl] = useState(String(editor.getAttributes('link').href || ''));
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const inputId = useId();
  const ref = useRef<HTMLFormElement>(null);
  useLayoutEffect(() => {
    const place = () => {
      if (editor.isDestroyed) return;
      const start = editor.view.coordsAtPos(range.from);
      const end = editor.view.coordsAtPos(range.to);
      const width = ref.current?.offsetWidth || 280;
      const height = ref.current?.offsetHeight || 66;
      setPosition({
        left: Math.max(
          12,
          Math.min((start.left + end.right) / 2 - width / 2, window.innerWidth - width - 12),
        ),
        top: Math.max(12, start.top - height - 8),
      });
    };
    place();
    window.addEventListener('resize', place);
    document.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      document.removeEventListener('scroll', place, true);
    };
  }, [editor, range]);
  useEffect(() => {
    ref.current?.querySelector('input')?.focus();
    const outside = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) onClose();
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', keydown);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', keydown);
    };
  }, [onClose]);
  return createPortal(
    <form
      ref={ref}
      className={`${prefix}-richtext-link-editor`}
      data-theme={theme}
      style={position}
      aria-label='插入链接'
      onSubmit={(event) => {
        event.preventDefault();
        if (!url.trim() || editor.isDestroyed || !editor.isEditable) return;
        editor.commands.setTextSelection(range);
        applyRichTextDirective(editor, 'link', { url: url.trim() });
        onClose();
      }}>
      <label htmlFor={inputId}>链接地址</label>
      <div>
        <input
          id={inputId}
          type='text'
          aria-label='链接地址'
          placeholder='https://'
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />
        <button type='submit' disabled={!url.trim()}>
          确认
        </button>
      </div>
    </form>,
    document.body,
  );
}

import { Input } from 'antd';
import type { InputRef } from 'antd/es/input';
import { PencilIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import styles from './index.module.less';

interface IProps {
  value: string;
  placeholder?: string;
  onSave: (next: string) => Promise<void> | void;
}

/** 表格内联可编辑单元格：hover 显示编辑按钮，Enter/blur 保存 */
export function InlineEditableCell({ value, placeholder = '—', onSave }: IProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (!isEditing) {
      setDraft(value);
    }
  }, [isEditing, value]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const commitSave = useCallback(async () => {
    const trimmed = draft.trim();
    if (trimmed === value.trim()) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await onSave(trimmed);
      setIsEditing(false);
    } catch {
      setDraft(value);
    } finally {
      setIsSaving(false);
    }
  }, [draft, onSave, value]);

  const handleStartEdit = useCallback(() => {
    setDraft(value);
    setIsEditing(true);
  }, [value]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        void commitSave();
      }
      if (event.key === 'Escape') {
        setDraft(value);
        setIsEditing(false);
      }
    },
    [commitSave, value],
  );

  if (isEditing) {
    return (
      <div className={styles['inline-editable']}>
        <Input
          className={styles['inline-editable-input']}
          disabled={isSaving}
          onBlur={() => void commitSave()}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          size='small'
          value={draft}
        />
      </div>
    );
  }

  const displayText = value.trim() || placeholder;
  const isPlaceholder = !value.trim();

  return (
    <div className={styles['inline-editable']}>
      <span
        className={
          isPlaceholder
            ? `${styles['inline-editable-text']} ${styles['inline-editable-placeholder']}`
            : styles['inline-editable-text']
        }>
        {displayText}
      </span>
      <button
        aria-label='编辑'
        className={styles['inline-editable-edit-btn']}
        onClick={handleStartEdit}
        type='button'>
        <PencilIcon className='h-3.5 w-3.5' />
      </button>
    </div>
  );
}

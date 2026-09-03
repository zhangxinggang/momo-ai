import { useToast } from '@renderer/components/ui/Toast';
import {
  normalizeSkillTag,
  normalizeSkillTagList,
  persistRemoveSkillTag,
  sortSkillTagsAz,
} from '@renderer/services/skill/modal-utils';
import { useSkillStore } from '@renderer/store';
import { Select, Tooltip } from 'antd';
import { XIcon } from 'lucide-react';
import { useCallback, useMemo, type KeyboardEvent, type MouseEvent } from 'react';

import styles from './index.module.less';
import type { IProps } from './types';

function handleDeleteMouseDown(event: MouseEvent<HTMLElement>) {
  event.preventDefault();
  event.stopPropagation();
}

export function SkillTagSelect({
  value,
  options,
  placeholder = '选择已有标签，或输入后按回车新建',
  disabled = false,
  size,
  className,
  onChange,
  onClick,
}: IProps) {
  const { showToast } = useToast();
  const skills = useSkillStore((state) => state.skills);
  const updateSkill = useSkillStore((state) => state.updateSkill);

  const selectOptions = useMemo(() => {
    const merged = new Set(
      [...options, ...value].map((tag) => normalizeSkillTag(tag)).filter(Boolean),
    );
    return sortSkillTagsAz([...merged]).map((tag) => ({
      label: tag,
      value: tag,
    }));
  }, [options, value]);

  const handleChange = useCallback(
    (nextValue: string[]) => {
      onChange(normalizeSkillTagList(nextValue));
    },
    [onChange],
  );

  const handleDeleteTag = useCallback(
    async (tag: string) => {
      const normalized = normalizeSkillTag(tag);
      if (!normalized) {
        return;
      }
      onChange(value.filter((item) => normalizeSkillTag(item) !== normalized));
      const updatedCount = await persistRemoveSkillTag(normalized, skills, updateSkill);
      if (updatedCount > 0) {
        showToast(`已删除标签「${normalized}」，并解除 ${updatedCount} 个技能的关联`);
      }
    },
    [onChange, showToast, skills, updateSkill, value],
  );

  const handleDeleteClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const tag = event.currentTarget.dataset.tag;
      if (tag) {
        void handleDeleteTag(tag);
      }
    },
    [handleDeleteTag],
  );

  const handleDeleteKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const tag = event.currentTarget.dataset.tag;
      if (tag) {
        void handleDeleteTag(tag);
      }
    },
    [handleDeleteTag],
  );

  return (
    <div className={className} onClick={onClick}>
      <Select
        className={styles['tag-select']}
        disabled={disabled}
        mode='tags'
        optionFilterProp='label'
        popupMatchSelectWidth
        optionRender={(option) => (
          <div className={styles['tag-select-option']}>
            <span className={styles['tag-select-option-label']}>{option.label}</span>
            <Tooltip title='删除'>
              <span
                aria-label={`删除标签 ${String(option.value ?? '')}`}
                className={styles['tag-select-option-delete']}
                data-tag={String(option.value ?? '')}
                onClick={handleDeleteClick}
                onKeyDown={handleDeleteKeyDown}
                onMouseDown={handleDeleteMouseDown}
                role='button'
                tabIndex={0}>
                <XIcon className='h-3.5 w-3.5' />
              </span>
            </Tooltip>
          </div>
        )}
        options={selectOptions}
        placeholder={placeholder}
        size={size}
        tokenSeparators={[',']}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}

import { useCallback, type ChangeEvent } from 'react';

import {
  buildMdPreviewThemeOptions,
  getMdPreviewThemeLabel,
  isMdPreviewThemeId,
  type TMdPreviewThemeId,
} from '../../preview-themes';
import './index.less';

interface IProps {
  value: TMdPreviewThemeId;
  onChange: (theme: TMdPreviewThemeId) => void;
  className?: string;
}

const PREVIEW_THEME_OPTIONS = buildMdPreviewThemeOptions();

/**
 * Markdown 预览主题切换：嵌入 MdEditor defToolbars 使用
 */
export function MdPreviewThemeSelect({ value, onChange, className }: IProps) {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const next = event.target.value;
      if (isMdPreviewThemeId(next)) {
        onChange(next);
      }
    },
    [onChange],
  );

  const currentLabel = getMdPreviewThemeLabel(value);

  return (
    <div className={['md-preview-theme-select', className].filter(Boolean).join(' ')}>
      <select
        aria-label={`预览样式：${currentLabel}`}
        className='md-preview-theme-select__control'
        title={`预览样式：${currentLabel}`}
        value={value}
        onChange={handleChange}>
        {PREVIEW_THEME_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

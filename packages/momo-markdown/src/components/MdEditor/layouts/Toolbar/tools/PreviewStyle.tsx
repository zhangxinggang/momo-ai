import { memo, useCallback, useContext, useMemo, type ChangeEvent } from 'react';
import { prefix } from '~/config';
import { EditorContext } from '~/context';
import { classnames } from '~/utils';
import {
  buildMdPreviewThemeOptions,
  getMdPreviewThemeLabel,
  isMdPreviewThemeId,
} from '../../../../../preview-themes';

import '../../../../MdPreviewThemeSelect/index.less';

const PREVIEW_THEME_OPTIONS = buildMdPreviewThemeOptions();

const ToolbarPreviewStyle = () => {
  const { previewTheme, updatePreviewTheme, disabled } = useContext(EditorContext);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      if (disabled) {
        return;
      }

      const next = event.target.value;
      if (isMdPreviewThemeId(next)) {
        updatePreviewTheme(next);
      }
    },
    [disabled, updatePreviewTheme],
  );

  const title = getMdPreviewThemeLabel(previewTheme);

  const control = useMemo(
    () => (
      <select
        aria-label={title}
        className='md-preview-theme-select__control'
        disabled={disabled}
        title={title}
        value={previewTheme}
        onChange={handleChange}>
        {PREVIEW_THEME_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ),
    [disabled, handleChange, previewTheme, title],
  );

  return (
    <div
      className={classnames([
        `${prefix}-toolbar-item`,
        `${prefix}-toolbar-preview-style`,
        'md-preview-theme-select',
        disabled && `${prefix}-disabled`,
      ])}
      title={title}>
      {control}
    </div>
  );
};

export default memo(ToolbarPreviewStyle);

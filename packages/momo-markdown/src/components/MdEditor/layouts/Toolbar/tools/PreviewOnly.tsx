import { memo, useContext } from 'react';
import Icon from '~/components/Icon';
import { prefix } from '~/config';
import { EditorContext } from '~/context';
import { classnames } from '~/utils';

const ToolbarPreviewOnly = () => {
  const {
    usedLanguageText: ult,
    showToolbarName,
    disabled,
    setting,
    updateSetting,
    editorMode,
    updateEditorMode,
  } = useContext(EditorContext);

  return (
    <button
      className={classnames([
        `${prefix}-toolbar-item`,
        setting.previewOnly && `${prefix}-toolbar-active`,
        disabled && `${prefix}-disabled`,
      ])}
      title={ult.toolbarTips?.previewOnly}
      aria-label={ult.toolbarTips?.previewOnly}
      disabled={disabled}
      onClick={() => {
        // 富文本模式下点击仅预览：先切回 Markdown 模式再开启仅预览
        if (editorMode === 'richtext') {
          updateEditorMode('markdown');
        }
        updateSetting('previewOnly', true);
      }}
      type='button'>
      <Icon name='preview-only' />
      {showToolbarName && (
        <div className={`${prefix}-toolbar-item-name`}>{ult.toolbarTips?.previewOnly}</div>
      )}
    </button>
  );
};

export default memo(ToolbarPreviewOnly);

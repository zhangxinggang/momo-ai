import { memo, useContext } from 'react';
import Icon from '~/components/Icon';
import { prefix } from '~/config';
import { EditorContext } from '~/context';
import { classnames } from '~/utils';

const ToolbarPreview = () => {
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
        setting.preview && `${prefix}-toolbar-active`,
        disabled && `${prefix}-disabled`,
      ])}
      title={ult.toolbarTips?.preview}
      aria-label={ult.toolbarTips?.preview}
      disabled={disabled}
      onClick={() => {
        // 富文本模式下点击预览：先切回 Markdown 模式再开启分屏预览
        if (editorMode === 'richtext') {
          updateEditorMode('markdown');
        }
        updateSetting('preview', true);
      }}
      type='button'>
      <Icon name='preview' />
      {showToolbarName && (
        <div className={`${prefix}-toolbar-item-name`}>{ult.toolbarTips?.preview}</div>
      )}
    </button>
  );
};

export default memo(ToolbarPreview);

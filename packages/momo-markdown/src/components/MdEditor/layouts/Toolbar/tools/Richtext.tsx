import { memo, useContext } from 'react';
import Icon from '~/components/Icon';
import { prefix } from '~/config';
import { EditorContext } from '~/context';
import { classnames } from '~/utils';

/**
 * 富文本 / Markdown 模式切换按钮
 *
 * 点击在 'richtext' 与 'markdown' 之间切换。
 * 富文本模式下该按钮处于激活态。
 */
const ToolbarRichtext = () => {
  const {
    usedLanguageText: ult,
    showToolbarName,
    disabled,
    editorMode,
    updateEditorMode,
  } = useContext(EditorContext);

  const isActive = editorMode === 'richtext';

  return (
    <button
      className={classnames([
        `${prefix}-toolbar-item`,
        isActive && `${prefix}-toolbar-active`,
        disabled && `${prefix}-disabled`,
      ])}
      title={ult.toolbarTips?.richtext}
      aria-label={ult.toolbarTips?.richtext}
      disabled={disabled}
      onClick={() => {
        updateEditorMode();
      }}
      type='button'>
      <Icon name='richtext' />
      {showToolbarName && (
        <div className={`${prefix}-toolbar-item-name`}>{ult.toolbarTips?.richtext}</div>
      )}
    </button>
  );
};

export default memo(ToolbarRichtext);

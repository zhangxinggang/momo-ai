import { memo, useContext } from 'react';
import Icon from '~/components/Icon';
import { prefix } from '~/config';
import { EditorContext } from '~/context';
import { classnames } from '~/utils';
import { useSreenfull } from '../hooks';

const ToolbarFullscreen = () => {
  const { usedLanguageText: ult, showToolbarName, setting } = useContext(EditorContext);

  const { fullscreenHandler } = useSreenfull();

  return (
    <button
      className={classnames([
        `${prefix}-toolbar-item`,
        setting.fullscreen && `${prefix}-toolbar-active`,
      ])}
      title={ult.toolbarTips?.fullscreen}
      aria-label={ult.toolbarTips?.fullscreen}
      onClick={() => {
        fullscreenHandler();
      }}
      type='button'>
      <Icon name={setting.fullscreen ? 'fullscreen-exit' : 'fullscreen'} />
      {showToolbarName && (
        <div className={`${prefix}-toolbar-item-name`}>{ult.toolbarTips?.fullscreen}</div>
      )}
    </button>
  );
};

export default memo(ToolbarFullscreen);

import { memo, useContext, useState } from 'react';
import DropDown from '~/components/Dropdown';
import Icon from '~/components/Icon';
import { prefix } from '~/config';
import { EditorContext } from '~/context';
import { REPLACE } from '~/static/event-name';
import { classnames } from '~/utils';
import type { TextAlignment } from '~/utils/alignment';
import bus from '~/utils/event-bus';

const alignments = ['left', 'center', 'right'] as const;

const ToolbarAlign = () => {
  const { editorId, usedLanguageText: ult, showToolbarName, disabled } = useContext(EditorContext);
  const [visible, setVisible] = useState(false);
  const title = ult.toolbarTips?.align;
  const applyAlignment = (alignment: TextAlignment) => {
    if (disabled) return;
    bus.emit(editorId, REPLACE, 'align', { alignment });
    setVisible(false);
  };

  return (
    <DropDown
      relative={`#${editorId}-toolbar-wrapper`}
      visible={visible}
      onChange={setVisible}
      disabled={disabled}
      overlay={
        <ul className={`${prefix}-menu ${prefix}-align-menu`} role='menu'>
          {alignments.map((alignment) => (
            <li
              key={alignment}
              className={`${prefix}-menu-item ${prefix}-align-menu-item`}
              role='menuitem'
              tabIndex={0}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => applyAlignment(alignment)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  applyAlignment(alignment);
                }
              }}>
              <Icon name={`align-${alignment}`} />
              <span>{ult.alignItem?.[alignment]}</span>
            </li>
          ))}
        </ul>
      }>
      <button
        className={classnames([`${prefix}-toolbar-item`, disabled && `${prefix}-disabled`])}
        disabled={disabled}
        title={title}
        aria-label={title}
        aria-haspopup='menu'
        aria-expanded={visible}
        type='button'
        onClick={() => setVisible(true)}
        onMouseDown={(event) => event.preventDefault()}>
        <Icon name='align-left' />
        {showToolbarName && <div className={`${prefix}-toolbar-item-name`}>{title}</div>}
      </button>
    </DropDown>
  );
};

export default memo(ToolbarAlign);

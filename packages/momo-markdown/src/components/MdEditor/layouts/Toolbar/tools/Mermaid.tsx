import { createElement, memo, useCallback, useContext, useMemo, useState } from 'react';
import DropDown from '~/components/Dropdown';
import Icon from '~/components/Icon';
import { prefix } from '~/config';
import { EditorContext } from '~/context';
import { REPLACE } from '~/static/event-name';
import { classnames } from '~/utils';
import { getChartMenuIcon } from '~/utils/chart/icons';
import { getMermaidMenuItems, getPlantumlMenuItems } from '~/utils/chart/templates';
import { TToolDirective } from '~/utils/content-help';
import bus from '~/utils/event-bus';

type EChartTab = 'mermaid' | 'plantuml';

const ToolbarMermaid = () => {
  const {
    editorId,
    usedLanguageText: ult,
    showToolbarName,
    disabled,
    language,
  } = useContext(EditorContext);
  const wrapperId = `${editorId}-toolbar-wrapper`;
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<EChartTab>('mermaid');
  const [keyword, setKeyword] = useState('');

  const emitHandler = useCallback(
    (direct: TToolDirective) => {
      if (disabled) return;

      bus.emit(editorId, REPLACE, direct);
    },
    [disabled, editorId],
  );

  const menuItems = useMemo(() => {
    return activeTab === 'mermaid' ? getMermaidMenuItems() : getPlantumlMenuItems();
  }, [activeTab]);

  const filteredMenuItems = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) {
      return menuItems;
    }

    return menuItems.filter((item) => {
      return (
        item.labelZh.toLowerCase().includes(normalizedKeyword) ||
        item.labelEn.toLowerCase().includes(normalizedKeyword)
      );
    });
  }, [keyword, menuItems]);

  const overlay = useMemo(() => {
    const isZh = language === 'zh-CN';

    return (
      <div className={`${prefix}-chart-menu`}>
        <div className={`${prefix}-chart-menu-tabs`} role='tablist'>
          <button
            className={classnames([
              `${prefix}-chart-menu-tab`,
              activeTab === 'mermaid' && `${prefix}-chart-menu-tab-active`,
            ])}
            type='button'
            role='tab'
            aria-selected={activeTab === 'mermaid'}
            onClick={(event) => {
              event.stopPropagation();
              setActiveTab('mermaid');
            }}>
            Mermaid
          </button>
          <button
            className={classnames([
              `${prefix}-chart-menu-tab`,
              activeTab === 'plantuml' && `${prefix}-chart-menu-tab-active`,
            ])}
            type='button'
            role='tab'
            aria-selected={activeTab === 'plantuml'}
            onClick={(event) => {
              event.stopPropagation();
              setActiveTab('plantuml');
            }}>
            PlantUML
          </button>
        </div>
        <div className={`${prefix}-chart-menu-search`}>
          <input
            className={`${prefix}-chart-menu-search-input`}
            type='search'
            placeholder={isZh ? '搜索图表' : 'Search charts'}
            value={keyword}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </div>
        <ul
          className={`${prefix}-menu ${prefix}-chart-menu-list`}
          onClick={() => {
            setVisible(false);
          }}
          role='menu'>
          {filteredMenuItems.map((item) => {
            const MenuIcon = getChartMenuIcon(item.direct);
            return (
              <li
                key={item.direct}
                className={`${prefix}-menu-item ${prefix}-menu-item-mermaid ${prefix}-chart-menu-item`}
                onClick={() => {
                  emitHandler(item.direct as TToolDirective);
                }}
                role='menuitem'
                tabIndex={0}>
                <span className={`${prefix}-chart-menu-item-icon`}>
                  {createElement(MenuIcon, { size: 14, strokeWidth: 2 })}
                </span>
                <span className={`${prefix}-chart-menu-item-label`}>
                  {isZh ? item.labelZh : item.labelEn}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }, [activeTab, emitHandler, filteredMenuItems, keyword, language]);

  const child = useMemo(() => {
    return (
      <button
        className={classnames([`${prefix}-toolbar-item`, disabled && `${prefix}-disabled`])}
        title={ult.toolbarTips?.mermaid}
        aria-label={ult.toolbarTips?.mermaid}
        disabled={disabled}
        type='button'>
        <Icon name='mermaid' />
        {showToolbarName && (
          <div className={`${prefix}-toolbar-item-name`}>{ult.toolbarTips?.mermaid}</div>
        )}
      </button>
    );
  }, [disabled, showToolbarName, ult.toolbarTips?.mermaid]);

  return (
    <DropDown
      relative={`#${wrapperId}`}
      visible={visible}
      onChange={(nextVisible) => {
        setVisible(nextVisible);
        if (!nextVisible) {
          setKeyword('');
        }
      }}
      disabled={disabled}
      overlay={overlay}
      key='bar-mermaid'>
      {child}
    </DropDown>
  );
};

export default memo(ToolbarMermaid);

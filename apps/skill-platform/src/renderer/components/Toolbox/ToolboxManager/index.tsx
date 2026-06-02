import { ModuleEmptyState } from '@renderer/components/ui/ModuleEmptyState';
import { useUIStore } from '@renderer/store';
import { Tabs } from 'antd';
import { clsx } from 'clsx';
import { WrenchIcon } from 'lucide-react';
import { useEffect, useMemo } from 'react';

import { ToolboxCardGrid } from '../ToolboxCardGrid';
import { ToolboxDetailHeader } from '../ToolboxDetailHeader';
import { ToolWebview } from '../ToolWebview';
import { useToolboxTools } from '../useToolboxTools';
import {
  collectHrefTabs,
  EToolboxToolMode,
  findBranchByKey,
  findToolByKey,
  mapCardItems,
  mapToolsWithKeys,
} from '../utils';
import styles from './index.module.less';

/** 工具箱主内容区：iframe / Tab / 卡片列表 */
export function ToolboxManager() {
  const tools = useToolboxTools();
  const toolNodes = useMemo(() => mapToolsWithKeys(tools), [tools]);

  const activeToolboxToolKey = useUIStore((state) => state.activeToolboxToolKey);
  const activeToolboxBranchKey = useUIStore((state) => state.activeToolboxBranchKey);
  const activeToolboxTabKey = useUIStore((state) => state.activeToolboxTabKey);
  const setActiveToolboxBranchKey = useUIStore((state) => state.setActiveToolboxBranchKey);
  const setActiveToolboxTabKey = useUIStore((state) => state.setActiveToolboxTabKey);
  const clearActiveToolboxBranch = useUIStore((state) => state.clearActiveToolboxBranch);

  const activeTool = useMemo(
    () => findToolByKey(toolNodes, activeToolboxToolKey),
    [activeToolboxToolKey, toolNodes],
  );

  const activeBranch = useMemo(() => {
    if (!activeTool) {
      return undefined;
    }
    return findBranchByKey(activeTool, activeToolboxBranchKey);
  }, [activeTool, activeToolboxBranchKey]);

  const cardItems = useMemo(() => {
    if (!activeTool || activeTool.mode !== EToolboxToolMode.Cards) {
      return [];
    }
    return mapCardItems(activeTool);
  }, [activeTool]);

  const activeCard = useMemo(
    () => cardItems.find((card) => card.key === activeToolboxBranchKey),
    [activeToolboxBranchKey, cardItems],
  );

  const hrefTabs = useMemo(() => {
    if (!activeTool) {
      return [];
    }

    if (activeTool.mode === EToolboxToolMode.Direct && activeTool.href) {
      return [
        {
          key: `${activeTool.key}-direct`,
          title: activeTool.title,
          href: activeTool.href,
        },
      ];
    }

    if (activeTool.mode === EToolboxToolMode.TreeLeaf && activeBranch) {
      return collectHrefTabs(activeBranch.key, activeBranch.children);
    }

    if (activeTool.mode === EToolboxToolMode.Cards && activeCard) {
      return activeCard.tabs;
    }

    return [];
  }, [activeBranch, activeCard, activeTool]);

  const firstHrefTabKey = hrefTabs[0]?.key ?? '';

  // 树形模式：自动选中第一个三级分支
  useEffect(() => {
    if (!activeTool || activeTool.mode !== EToolboxToolMode.TreeLeaf || activeToolboxBranchKey) {
      return;
    }
    const firstBranch = activeTool.branches[0];
    if (firstBranch) {
      setActiveToolboxBranchKey(firstBranch.key);
    }
  }, [activeTool, activeToolboxBranchKey, setActiveToolboxBranchKey]);

  // Tab 切换：仅在当前 tab 无效时同步到首个 tab
  useEffect(() => {
    if (!firstHrefTabKey || activeToolboxTabKey === firstHrefTabKey) {
      return;
    }
    const isValidTab = hrefTabs.some((tab) => tab.key === activeToolboxTabKey);
    if (!isValidTab) {
      setActiveToolboxTabKey(firstHrefTabKey);
    }
  }, [activeToolboxTabKey, firstHrefTabKey, hrefTabs, setActiveToolboxTabKey]);

  const activeTab = hrefTabs.find((tab) => tab.key === activeToolboxTabKey) ?? hrefTabs[0] ?? null;

  const showTabs = hrefTabs.length > 1;
  const showCardGrid =
    activeTool?.mode === EToolboxToolMode.Cards && !activeCard && cardItems.length > 0;
  const showCardDetailHeader = activeTool?.mode === EToolboxToolMode.Cards && Boolean(activeCard);

  const handleBackToCardGrid = () => {
    clearActiveToolboxBranch();
  };

  if (toolNodes.length === 0) {
    return (
      <ModuleEmptyState
        centered
        icon={WrenchIcon}
        title='暂无工具'
        description='在线配置中尚未提供可用工具，请稍后再试'
      />
    );
  }

  if (!activeTool) {
    return (
      <ModuleEmptyState
        centered
        icon={WrenchIcon}
        title='选择工具'
        description='从左侧菜单选择要使用的工具'
      />
    );
  }

  if (showCardGrid) {
    return (
      <div className={styles['toolbox-manager']}>
        <ToolboxCardGrid
          toolTitle={activeTool.title}
          cards={cardItems}
          activeCardKey={activeToolboxBranchKey}
          onSelectCard={setActiveToolboxBranchKey}
        />
      </div>
    );
  }

  if (!activeTab) {
    return (
      <ModuleEmptyState
        centered
        icon={WrenchIcon}
        title='暂无内容'
        description='当前工具下没有可打开的链接'
      />
    );
  }

  const detailTitle = showCardDetailHeader
    ? (activeCard?.title ?? activeTool.title)
    : activeTool.title;

  return (
    <div className={styles['toolbox-manager']}>
      {showCardDetailHeader ? (
        <ToolboxDetailHeader title={detailTitle} onBack={handleBackToCardGrid} />
      ) : null}
      <div
        className={clsx(
          styles['toolbox-manager-body'],
          showCardDetailHeader && styles['toolbox-manager-body--with-header'],
        )}>
        {showTabs ? (
          <Tabs
            className={styles['toolbox-manager-tabs']}
            activeKey={activeTab.key}
            onChange={setActiveToolboxTabKey}
            items={hrefTabs.map((tab) => ({
              key: tab.key,
              label: tab.title,
            }))}
          />
        ) : null}
        <div className={styles['toolbox-manager-content']}>
          <ToolWebview href={activeTab.href} title={activeTab.title} />
        </div>
      </div>
    </div>
  );
}

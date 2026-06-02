import { useUIStore } from '@renderer/store';
import { clsx } from 'clsx';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { useEffect, useMemo } from 'react';

import { ToolboxMenuIcon } from '../ToolboxMenuIcon';
import { useToolboxTools } from '../useToolboxTools';
import { EToolboxToolMode, mapToolsWithKeys } from '../utils';
import styles from './index.module.less';

/** 工具箱侧栏：层级菜单（对齐 Skill 商店二级结构） */
export function ToolboxPanel() {
  const tools = useToolboxTools();
  const toolNodes = useMemo(() => mapToolsWithKeys(tools), [tools]);

  const activeToolboxToolKey = useUIStore((state) => state.activeToolboxToolKey);
  const activeToolboxBranchKey = useUIStore((state) => state.activeToolboxBranchKey);
  const expandedToolboxToolKeys = useUIStore((state) => state.expandedToolboxToolKeys);
  const setActiveToolboxToolKey = useUIStore((state) => state.setActiveToolboxToolKey);
  const setActiveToolboxBranchKey = useUIStore((state) => state.setActiveToolboxBranchKey);
  const toggleToolboxToolExpanded = useUIStore((state) => state.toggleToolboxToolExpanded);
  const ensureToolboxToolExpanded = useUIStore((state) => state.ensureToolboxToolExpanded);

  useEffect(() => {
    if (toolNodes.length === 0 || activeToolboxToolKey) {
      return;
    }
    const firstTool = toolNodes[0];
    setActiveToolboxToolKey(firstTool.key);
    if (firstTool.mode === EToolboxToolMode.TreeLeaf) {
      ensureToolboxToolExpanded(firstTool.key);
    }
  }, [activeToolboxToolKey, ensureToolboxToolExpanded, setActiveToolboxToolKey, toolNodes]);

  useEffect(() => {
    if (!activeToolboxToolKey) {
      return;
    }
    const activeTool = toolNodes.find((tool) => tool.key === activeToolboxToolKey);
    if (activeTool?.mode === EToolboxToolMode.TreeLeaf) {
      ensureToolboxToolExpanded(activeToolboxToolKey);
    }
  }, [activeToolboxToolKey, ensureToolboxToolExpanded, toolNodes]);

  const handleSelectTool = (toolKey: string, mode: EToolboxToolMode) => {
    setActiveToolboxToolKey(toolKey);
    if (mode === EToolboxToolMode.TreeLeaf) {
      ensureToolboxToolExpanded(toolKey);
    }
  };

  const handleToggleExpand = (event: React.MouseEvent, toolKey: string) => {
    event.stopPropagation();
    toggleToolboxToolExpanded(toolKey);
  };

  const handleSelectBranch = (toolKey: string, branchKey: string) => {
    const { activeToolboxToolKey: currentToolKey, activeToolboxBranchKey: currentBranchKey } =
      useUIStore.getState();
    if (currentToolKey === toolKey && currentBranchKey === branchKey) {
      return;
    }
    ensureToolboxToolExpanded(toolKey);
    setActiveToolboxToolKey(toolKey);
    setActiveToolboxBranchKey(branchKey);
  };

  if (toolNodes.length === 0) {
    return (
      <div className={styles['toolbox-panel']}>
        <div className={styles['toolbox-panel-empty']}>{'暂无可用工具'}</div>
      </div>
    );
  }

  return (
    <div className={styles['toolbox-panel']}>
      <div className={styles['toolbox-panel-list']}>
        {toolNodes.map((tool) => {
          const isToolActive = activeToolboxToolKey === tool.key;
          const isExpanded = expandedToolboxToolKeys.includes(tool.key);
          const isTreeMode = tool.mode === EToolboxToolMode.TreeLeaf;

          if (isTreeMode) {
            return (
              <div key={tool.key} className={styles['toolbox-menu-group']}>
                <button
                  type='button'
                  className={clsx(
                    styles['toolbox-menu-root'],
                    isToolActive && styles['toolbox-menu-root--active'],
                  )}
                  onClick={() => handleSelectTool(tool.key, tool.mode)}>
                  <span
                    className={styles['toolbox-menu-root-toggle']}
                    onClick={(event) => handleToggleExpand(event, tool.key)}
                    aria-hidden='true'>
                    {isExpanded ? (
                      <ChevronDownIcon className='h-4 w-4' />
                    ) : (
                      <ChevronRightIcon className='h-4 w-4' />
                    )}
                  </span>
                  <ToolboxMenuIcon icon={tool.icon} className={styles['toolbox-menu-icon']} />
                  <span className={styles['toolbox-menu-root-label']}>{tool.title}</span>
                </button>

                {isExpanded ? (
                  <div className={styles['toolbox-menu-children']}>
                    {tool.branches.map((branch) => {
                      const isBranchActive = isToolActive && activeToolboxBranchKey === branch.key;

                      return (
                        <button
                          key={branch.key}
                          type='button'
                          className={clsx(
                            styles['toolbox-menu-branch'],
                            isBranchActive && styles['toolbox-menu-branch--active'],
                          )}
                          onClick={() => handleSelectBranch(tool.key, branch.key)}>
                          <ToolboxMenuIcon
                            icon={branch.icon}
                            className={styles['toolbox-menu-icon']}
                          />
                          <span className={styles['toolbox-menu-branch-label']}>
                            {branch.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          }

          return (
            <button
              key={tool.key}
              type='button'
              className={clsx(
                styles['toolbox-menu-root'],
                isToolActive && styles['toolbox-menu-root--active'],
              )}
              onClick={() => handleSelectTool(tool.key, tool.mode)}>
              <ToolboxMenuIcon icon={tool.icon} className={styles['toolbox-menu-icon']} />
              <span className={styles['toolbox-menu-root-label']}>{tool.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

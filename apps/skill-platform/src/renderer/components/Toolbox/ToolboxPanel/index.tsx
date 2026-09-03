import { CaretDownOutlined } from '@ant-design/icons';
import { MomoTreeToolbar } from '@momo/tree';
import { useTreeRootCreate } from '@renderer/hooks/useTreeRootCreate';
import { useCustomToolStore, useUIStore } from '@renderer/store';
import { clsx } from 'clsx';
import { useEffect, useMemo } from 'react';

import { CustomToolTreePanel } from '../CustomToolTreePanel';
import { ToolboxMenuIcon } from '../ToolboxMenuIcon';
import { useToolboxTools } from '../useToolboxTools';
import { EToolboxToolMode, mapToolsWithKeys } from '../utils';
import styles from './index.module.less';

/** 工具箱侧栏：上自定义工具 + 下系统工具 */
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

  const clearCustomSelection = useCustomToolStore((state) => state.clearSelection);
  const customSelectedId = useCustomToolStore((state) => state.selectedId);
  const loadTree = useCustomToolStore((state) => state.loadTree);
  const treeData = useCustomToolStore((state) => state.treeData);
  const treeSearchQuery = useCustomToolStore((state) => state.treeSearchQuery);
  const setTreeSearchQuery = useCustomToolStore((state) => state.setTreeSearchQuery);
  const createRootFolder = useCustomToolStore((state) => state.createRootFolder);
  const createTool = useCustomToolStore((state) => state.createTool);

  useEffect(() => {
    void loadTree();
  }, [loadTree]);

  const rootCreate = useTreeRootCreate({
    treeData,
    labels: {
      createFolderTitle: '新增目录',
      createNoteTitle: '新增工具',
      createNamePlaceholder: '请输入名称',
      duplicateNameError: '同级下已存在相同名称',
      emptyNameError: '名称不能为空',
      confirm: '确定',
      cancel: '取消',
    },
    onCreateFolder: async (name) => {
      await createRootFolder(name);
    },
    onCreateItem: async (name) => {
      await createTool(null, name);
    },
  });

  useEffect(() => {
    if (toolNodes.length === 0 || activeToolboxToolKey) {
      return;
    }
    // 有自定义选中时不自动选系统工具
    if (customSelectedId) {
      return;
    }
    const firstTool = toolNodes[0];
    setActiveToolboxToolKey(firstTool.key);
    if (firstTool.mode === EToolboxToolMode.TreeLeaf) {
      ensureToolboxToolExpanded(firstTool.key);
    }
  }, [
    activeToolboxToolKey,
    customSelectedId,
    ensureToolboxToolExpanded,
    setActiveToolboxToolKey,
    toolNodes,
  ]);

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
    clearCustomSelection();
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
    clearCustomSelection();
    const { activeToolboxToolKey: currentToolKey, activeToolboxBranchKey: currentBranchKey } =
      useUIStore.getState();
    if (currentToolKey === toolKey && currentBranchKey === branchKey) {
      return;
    }
    ensureToolboxToolExpanded(toolKey);
    setActiveToolboxToolKey(toolKey);
    setActiveToolboxBranchKey(branchKey);
  };

  return (
    <div className={styles['toolbox-panel']}>
      <div className={styles['toolbox-panel-custom']}>
        <MomoTreeToolbar
          visible
          sectionLabel={'自定义工具'}
          searchPlaceholder={'搜索工具或目录...'}
          searchQuery={treeSearchQuery}
          onSearchQueryChange={setTreeSearchQuery}
          clearSearchLabel={'清除搜索'}
          createDirectoryTitle={'新增目录'}
          onCreateDirectory={rootCreate.openCreateFolder}
          createItemTitle={'新增工具'}
          onCreateItem={rootCreate.openCreateItem}
        />
        {rootCreate.createModal}
        <div className={styles['toolbox-panel-custom-tree']}>
          <CustomToolTreePanel />
        </div>
      </div>

      <div className={styles['toolbox-panel-divider']} aria-hidden='true' />

      <div className={styles['toolbox-panel-system']}>
        <div className={styles['toolbox-panel-system-label']}>{'系统工具'}</div>
        {toolNodes.length === 0 ? (
          <div className={styles['toolbox-panel-empty']}>{'暂无可用工具'}</div>
        ) : (
          <div className={styles['toolbox-panel-list']}>
            {toolNodes.map((tool) => {
              const isToolActive = !customSelectedId && activeToolboxToolKey === tool.key;
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
                        className={clsx(
                          styles['toolbox-menu-root-toggle'],
                          !isExpanded && styles['toolbox-menu-root-toggle--collapsed'],
                        )}
                        onClick={(event) => handleToggleExpand(event, tool.key)}
                        aria-hidden='true'>
                        <CaretDownOutlined className={styles['toolbox-menu-root-toggle-icon']} />
                      </span>
                      <ToolboxMenuIcon icon={tool.icon} className={styles['toolbox-menu-icon']} />
                      <span className={styles['toolbox-menu-root-label']}>{tool.title}</span>
                    </button>

                    {isExpanded ? (
                      <div className={styles['toolbox-menu-children']}>
                        {tool.branches.map((branch) => {
                          const isBranchActive =
                            isToolActive && activeToolboxBranchKey === branch.key;

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
        )}
      </div>
    </div>
  );
}

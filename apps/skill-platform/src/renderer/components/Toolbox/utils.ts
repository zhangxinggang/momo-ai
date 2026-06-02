import type { DOnlineConfTool, DOnlineConfToolLink } from '@/types/modules/online-conf';
import type { TreeDataNode } from 'antd';

import { buildToolboxItemKey, buildToolboxToolKey } from '@renderer/store/online-conf';

/** 工具箱展示模式 */
export enum EToolboxToolMode {
  /** 二级菜单直接带链接 */
  Direct = 'direct',
  /** 侧栏树形三级菜单 */
  TreeLeaf = 'tree-leaf',
  /** 右侧卡片列表 */
  Cards = 'cards',
}

export interface IToolboxHrefTab {
  key: string;
  title: string;
  href: string;
}

/** 读取链接，兼容 herf 拼写 */
export function getToolHref(tool: Pick<DOnlineConfTool, 'href' | 'herf'>): string | undefined {
  const href = tool.href?.trim() || tool.herf?.trim();
  return href || undefined;
}

/** 判断是否为侧栏树形三级菜单模式 */
export function isChildrenInLeafMode(tool: DOnlineConfTool): boolean {
  const flag = tool.childrenInLeaf as boolean | string | number | undefined;
  return flag === true || flag === 'true' || flag === 1;
}

/** 判断工具箱二级菜单展示模式 */
export function getToolboxToolMode(tool: DOnlineConfTool): EToolboxToolMode {
  if (getToolHref(tool)) {
    return EToolboxToolMode.Direct;
  }
  if (isChildrenInLeafMode(tool)) {
    return EToolboxToolMode.TreeLeaf;
  }
  return EToolboxToolMode.Cards;
}

/** 收集子项中带 href 的 Tab 列表 */
export function collectHrefTabs(
  parentKey: string,
  items: DOnlineConfTool[] | undefined,
): IToolboxHrefTab[] {
  if (!Array.isArray(items)) {
    return [];
  }

  const tabs: IToolboxHrefTab[] = [];
  items.forEach((item, index) => {
    const href = getToolHref(item);
    if (!href) {
      return;
    }
    tabs.push({
      key: buildToolboxItemKey(parentKey, item.title, index),
      title: item.title.trim(),
      href,
    });
  });
  return tabs;
}

/** 为工具列表附加稳定 key */
export function mapToolsWithKeys(tools: DOnlineConfTool[]) {
  return tools.map((tool, index) => {
    const toolKey = buildToolboxToolKey(tool.title, index);
    const branches = Array.isArray(tool.children)
      ? tool.children.map((branch, branchIndex) => ({
          ...branch,
          key: buildToolboxItemKey(toolKey, branch.title, branchIndex),
        }))
      : [];
    return {
      ...tool,
      key: toolKey,
      mode: getToolboxToolMode(tool),
      href: getToolHref(tool),
      branches,
    };
  });
}

export type IToolboxToolNode = ReturnType<typeof mapToolsWithKeys>[number];

export type IToolboxBranchNode = IToolboxToolNode['branches'][number];

/** 根据 key 查找二级工具 */
export function findToolByKey(
  tools: IToolboxToolNode[],
  toolKey: string,
): IToolboxToolNode | undefined {
  return tools.find((tool) => tool.key === toolKey);
}

/** 根据 key 查找三级分支 */
export function findBranchByKey(
  tool: IToolboxToolNode,
  branchKey: string,
): IToolboxBranchNode | undefined {
  return tool.branches.find((branch) => branch.key === branchKey);
}

/** 卡片模式下的卡片项 */
export interface IToolboxCardItem {
  key: string;
  title: string;
  tabs: IToolboxHrefTab[];
}

/** 将 cards 模式的 children 转为卡片列表 */
export function mapCardItems(tool: IToolboxToolNode): IToolboxCardItem[] {
  return tool.branches.map((branch) => ({
    key: branch.key,
    title: branch.title.trim(),
    tabs: collectHrefTabs(branch.key, branch.children),
  }));
}

/** 校验链接项 */
export function isValidToolLink(item: DOnlineConfToolLink): boolean {
  return Boolean(item?.title?.trim() && getToolHref(item));
}

/** 工具箱 Tree 节点元数据 */
export interface IToolboxTreeNodeMeta {
  toolKey: string;
  branchKey?: string;
  mode: EToolboxToolMode;
}

export interface IToolboxTreeBuildResult {
  treeData: TreeDataNode[];
  nodeMetaMap: Map<string, IToolboxTreeNodeMeta>;
}

/** 工具箱 Tree 根节点 class（对齐 Skill NavItem） */
export const TOOLBOX_TREE_ROOT_CLASS = 'toolbox-tree-node-root';

/** 工具箱 Tree 三级节点 class（对齐 Skill 商店子菜单） */
export const TOOLBOX_TREE_BRANCH_CLASS = 'toolbox-tree-node-branch';

/** 构建 Ant Design Tree 数据 */
export function buildToolboxTreeData(toolNodes: IToolboxToolNode[]): IToolboxTreeBuildResult {
  const nodeMetaMap = new Map<string, IToolboxTreeNodeMeta>();

  const treeData = toolNodes.map((tool) => {
    nodeMetaMap.set(tool.key, {
      toolKey: tool.key,
      mode: tool.mode,
    });

    if (tool.mode === EToolboxToolMode.TreeLeaf) {
      return {
        key: tool.key,
        title: tool.title,
        className: TOOLBOX_TREE_ROOT_CLASS,
        children: tool.branches.map((branch) => {
          nodeMetaMap.set(branch.key, {
            toolKey: tool.key,
            branchKey: branch.key,
            mode: tool.mode,
          });
          return {
            key: branch.key,
            title: branch.title,
            isLeaf: true,
            className: TOOLBOX_TREE_BRANCH_CLASS,
          };
        }),
      };
    }

    return {
      key: tool.key,
      title: tool.title,
      isLeaf: true,
      className: TOOLBOX_TREE_ROOT_CLASS,
    };
  });

  return { treeData, nodeMetaMap };
}

/** 获取树形父节点 key 列表 */
export function getToolboxTreeParentKeys(toolNodes: IToolboxToolNode[]): string[] {
  return toolNodes
    .filter((tool) => tool.mode === EToolboxToolMode.TreeLeaf)
    .map((tool) => tool.key);
}

import type { ISlashCommandItem } from '../types/slash-command';

export const SLASH_SKILL_CATEGORY_LABELS: Record<string, string> = {
  general: '通用',
  office: '办公',
  dev: '开发',
  ai: 'AI',
  data: '数据',
  management: '管理',
  deploy: '部署',
  design: '设计',
  security: '安全',
  meta: '元技能',
};

export type SlashCommandTreeNode =
  | {
      type: 'group' | 'directory';
      key: string;
      label: string;
      children: SlashCommandTreeNode[];
    }
  | { type: 'item'; key: string; item: ISlashCommandItem; index: number };

/** 搜索只裁剪叶子，来源及原始目录层级不随查询变化。 */
export function buildSlashCommandTree(items: ISlashCommandItem[]): {
  tree: SlashCommandTreeNode[];
  items: ISlashCommandItem[];
} {
  const tree: SlashCommandTreeNode[] = [];
  const branches = new Map<string, Extract<SlashCommandTreeNode, { children: unknown }>>();
  for (const [index, item] of items.entries()) {
    const groupKey =
      item.scope === 'application'
        ? 'application-skills'
        : `${item.agentAppId ?? ''}:${item.scope}:${item.kind}`;
    let group = branches.get(groupKey);
    if (!group) {
      group = {
        type: 'group',
        key: groupKey,
        label:
          item.scope === 'application'
            ? 'momo-ai 技能'
            : `${item.agentAppName || 'Agent'} ${item.scope === 'project' ? '项目' : '全局'}${item.kind === 'skill' ? '技能' : '命令'}`,
        children: [],
      };
      branches.set(groupKey, group);
      tree.push(group);
    }
    const directories =
      item.directoryPath ??
      (item.scope === 'application'
        ? [SLASH_SKILL_CATEGORY_LABELS[item.category || 'general'] || item.category || '通用']
        : []);
    let parent = group;
    const path: string[] = [];
    for (const label of directories.filter(Boolean)) {
      path.push(label);
      const key = groupKey + ':' + JSON.stringify(path);
      let directory = branches.get(key);
      if (!directory) {
        directory = { type: 'directory', key, label, children: [] };
        branches.set(key, directory);
        parent.children.push(directory);
      }
      parent = directory;
    }
    parent.children.push({ type: 'item', key: item.resourceId, item, index });
  }
  const ordered: ISlashCommandItem[] = [];
  const collect = (nodes: SlashCommandTreeNode[]) => {
    for (const node of nodes) {
      if (node.type === 'item') ordered.push(node.item);
      else collect(node.children);
    }
  };
  collect(tree);
  return { tree, items: ordered };
}

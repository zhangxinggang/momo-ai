import { getModelCategory } from '@renderer/components/Settings/AiWorkbench/helpers';
import type { IModelInfo } from '@renderer/services/ai';
import {
  getImageScenarioModels,
  getModelsByType,
  isImageCapableModel,
} from '@renderer/services/ai/defaults';
import type { IAIModelConfig } from '@renderer/types/settings';

export const TYPE_GROUP_ORDER = ['对话', '生图'] as const;
export type EModelTypeGroup = (typeof TYPE_GROUP_ORDER)[number];

export const VENDOR_ORDER = [
  'GPT',
  'Claude',
  'Gemini',
  'DeepSeek',
  'Qwen',
  'Doubao',
  'GLM',
  'Kimi',
  'Llama',
  'Mistral',
  'Yi',
  'ERNIE',
  'Spark',
  'Hunyuan',
  'CLI Agent',
  'Embedding',
  'Audio',
  'Image',
  'Other',
] as const;

export interface IModelTreeItem {
  id: string;
  label: string;
  vendor: string;
  typeGroup: EModelTypeGroup;
}

export interface IModelTreeModelNode {
  type: 'model';
  id: string;
  label: string;
}

export interface IModelTreeTypeNode {
  type: 'type';
  id: string;
  label: EModelTypeGroup;
  count: number;
  children: IModelTreeModelNode[];
}

export interface IModelTreeVendorNode {
  type: 'vendor';
  id: string;
  label: string;
  count: number;
  children: IModelTreeTypeNode[];
}

function sortVendors(vendors: string[]): string[] {
  return [...vendors].sort((a, b) => {
    const ai = VENDOR_ORDER.indexOf(a as (typeof VENDOR_ORDER)[number]);
    const bi = VENDOR_ORDER.indexOf(b as (typeof VENDOR_ORDER)[number]);
    if (ai === -1 && bi === -1) {
      return a.localeCompare(b);
    }
    if (ai === -1) {
      return 1;
    }
    if (bi === -1) {
      return -1;
    }
    return ai - bi;
  });
}

function resolveRemoteModelTypeGroup(model: IModelInfo): EModelTypeGroup {
  const asConfig = {
    id: model.id,
    model: model.id,
    name: model.id,
    provider: model.owned_by ?? '',
    apiKey: '',
    apiUrl: '',
  } as IAIModelConfig;
  return isImageCapableModel(asConfig) ? '生图' : '对话';
}

/** 从已配置模型构建树形条目 */
export function buildModelTreeItemsFromConfigs(
  models: IAIModelConfig[],
  modelType: 'chat' | 'image' | 'both' = 'both',
): IModelTreeItem[] {
  const items: IModelTreeItem[] = [];
  const chatModels = modelType === 'image' ? [] : getModelsByType(models, 'chat');
  const imageModels = modelType === 'chat' ? [] : getImageScenarioModels(models);

  for (const model of chatModels) {
    items.push({
      id: model.id,
      label: model.name?.trim() || model.model,
      vendor: getModelCategory(model),
      typeGroup: '对话',
    });
  }

  for (const model of imageModels) {
    items.push({
      id: model.id,
      label: model.name?.trim() || model.model,
      vendor: getModelCategory(model),
      typeGroup: '生图',
    });
  }

  return items;
}

/** 从远程模型列表构建树形条目（添加模型弹窗） */
export function buildModelTreeItemsFromRemote(models: IModelInfo[]): IModelTreeItem[] {
  return models.map((model) => ({
    id: model.id,
    label: model.id,
    vendor: getModelCategory({
      id: model.id,
      owned_by: model.owned_by,
    }),
    typeGroup: resolveRemoteModelTypeGroup(model),
  }));
}

/** 构建厂商 -> 场景 -> 模型 三级树 */
export function buildModelTree(items: IModelTreeItem[]): IModelTreeVendorNode[] {
  const vendorMap = new Map<string, Map<EModelTypeGroup, IModelTreeModelNode[]>>();

  for (const item of items) {
    if (!vendorMap.has(item.vendor)) {
      vendorMap.set(item.vendor, new Map());
    }
    const typeMap = vendorMap.get(item.vendor)!;
    if (!typeMap.has(item.typeGroup)) {
      typeMap.set(item.typeGroup, []);
    }
    typeMap.get(item.typeGroup)!.push({
      type: 'model',
      id: item.id,
      label: item.label,
    });
  }

  return sortVendors([...vendorMap.keys()]).map((vendor) => {
    const typeMap = vendorMap.get(vendor)!;
    const typeNodes = TYPE_GROUP_ORDER.filter((typeGroup) => typeMap.has(typeGroup)).map(
      (typeGroup) => {
        const models = typeMap.get(typeGroup)!;
        return {
          type: 'type' as const,
          id: `${vendor}::${typeGroup}`,
          label: typeGroup,
          count: models.length,
          children: models,
        };
      },
    );

    return {
      type: 'vendor' as const,
      id: vendor,
      label: vendor,
      count: typeNodes.reduce((sum, node) => sum + node.count, 0),
      children: typeNodes,
    };
  });
}

/** 按关键词过滤树条目 */
export function filterModelTreeItems(
  items: IModelTreeItem[],
  searchQuery: string,
): IModelTreeItem[] {
  const query = searchQuery.trim().toLowerCase();
  if (!query) {
    return items;
  }
  return items.filter(
    (item) =>
      item.id.toLowerCase().includes(query) ||
      item.label.toLowerCase().includes(query) ||
      item.vendor.toLowerCase().includes(query),
  );
}

/** 扁平化树中所有模型 id */
export function flattenModelTreeIds(tree: IModelTreeVendorNode[]): string[] {
  return tree.flatMap((vendor) =>
    vendor.children.flatMap((typeNode) => typeNode.children.map((model) => model.id)),
  );
}

/** 根据 id 查找展示名称 */
export function findModelTreeLabel(items: IModelTreeItem[], modelId: string): string {
  return items.find((item) => item.id === modelId)?.label ?? modelId;
}

/** 两级分组：分组名 -> 模型列表（如 CLI Agent） */
export interface IModelTreeSimpleGroup {
  id: string;
  label: string;
  children: Array<{ id: string; label: string }>;
}

/** 按关键词过滤两级分组 */
export function filterSimpleGroups(
  groups: IModelTreeSimpleGroup[],
  searchQuery: string,
): IModelTreeSimpleGroup[] {
  const query = searchQuery.trim().toLowerCase();
  if (!query) {
    return groups;
  }

  return groups
    .map((group) => {
      const groupMatched = group.label.toLowerCase().includes(query);
      const matchedChildren = group.children.filter(
        (child) =>
          child.id.toLowerCase().includes(query) || child.label.toLowerCase().includes(query),
      );
      if (groupMatched) {
        return group;
      }
      if (matchedChildren.length === 0) {
        return null;
      }
      return { ...group, children: matchedChildren };
    })
    .filter((group): group is IModelTreeSimpleGroup => group !== null);
}

/** 扁平化两级分组中的模型 id */
export function flattenSimpleGroupIds(groups: IModelTreeSimpleGroup[]): string[] {
  return groups.flatMap((group) => group.children.map((child) => child.id));
}

/** 从两级分组中查找展示名称 */
export function findSimpleGroupLabel(
  groups: IModelTreeSimpleGroup[],
  modelId: string,
): string | undefined {
  for (const group of groups) {
    const matched = group.children.find((child) => child.id === modelId);
    if (matched) {
      return matched.label;
    }
  }
  return undefined;
}

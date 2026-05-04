import type { SelectProps } from 'antd';
import { Select } from 'antd';
import { useMemo, useState } from 'react';

import { ModelTree } from '@renderer/components/ui/ModelTree';
import type { IAIModelConfig } from '@renderer/types/settings';
import {
  buildModelTree,
  buildModelTreeItemsFromConfigs,
  filterModelTreeItems,
  filterSimpleGroups,
  findModelTreeLabel,
  findSimpleGroupLabel,
  flattenModelTreeIds,
  flattenSimpleGroupIds,
  type IModelTreeItem,
  type IModelTreeSimpleGroup,
} from '@renderer/utils/model-tree';

interface IProps {
  value?: string;
  onChange?: (value: string) => void;
  /** 从模型配置构建选项 */
  models?: IAIModelConfig[];
  /** chat / image / both */
  modelType?: 'chat' | 'image' | 'both';
  /** 额外树形条目 */
  extraTreeItems?: IModelTreeItem[];
  /** 两级分组（如 CLI Agent -> Claude/Codex） */
  simpleGroups?: IModelTreeSimpleGroup[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: SelectProps['size'];
  style?: React.CSSProperties;
  /** 无边框紧凑样式（AI 对话输入栏） */
  variant?: 'default' | 'borderless';
  dropdownMinWidth?: number;
}

/** 公共模型选择下拉：厂商 -> 场景 -> 模型 树形结构 */
export function ModelSelect({
  value,
  onChange,
  models,
  modelType = 'chat',
  extraTreeItems = [],
  simpleGroups = [],
  placeholder = '选择模型',
  disabled,
  className,
  size = 'small',
  style,
  variant = 'default',
  dropdownMinWidth = 280,
}: IProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const allItems = useMemo(() => {
    const baseItems = models?.length ? buildModelTreeItemsFromConfigs(models, modelType) : [];
    return [...baseItems, ...extraTreeItems];
  }, [extraTreeItems, modelType, models]);

  const filteredItems = useMemo(
    () => filterModelTreeItems(allItems, searchQuery),
    [allItems, searchQuery],
  );

  const tree = useMemo(() => buildModelTree(filteredItems), [filteredItems]);

  const filteredSimpleGroups = useMemo(
    () => filterSimpleGroups(simpleGroups, searchQuery),
    [searchQuery, simpleGroups],
  );

  const flatIds = useMemo(() => {
    const treeIds = flattenModelTreeIds(buildModelTree(allItems));
    const simpleIds = flattenSimpleGroupIds(simpleGroups);
    return [...simpleIds.filter((id) => !treeIds.includes(id)), ...treeIds];
  }, [allItems, simpleGroups]);

  const selectedValue = value && flatIds.includes(value) ? value : flatIds[0];

  const selectOptions = useMemo(
    () =>
      flatIds.map((id) => ({
        value: id,
        label: findSimpleGroupLabel(simpleGroups, id) ?? findModelTreeLabel(allItems, id),
      })),
    [allItems, flatIds, simpleGroups],
  );

  const handleChange = (nextValue: string) => {
    onChange?.(nextValue);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Select
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setSearchQuery('');
        }
      }}
      className={
        variant === 'borderless' ? `model-select-borderless ${className ?? ''}` : className
      }
      size={size}
      style={style}
      placeholder={placeholder}
      disabled={disabled || flatIds.length === 0}
      value={flatIds.length > 0 ? selectedValue : undefined}
      options={selectOptions}
      popupMatchSelectWidth={false}
      dropdownStyle={{ minWidth: dropdownMinWidth, padding: 0 }}
      dropdownRender={() => (
        <div
          className='bg-popover border-border/60 rounded-lg border p-1.5 shadow-md'
          onMouseDown={(event) => event.preventDefault()}>
          <ModelTree
            tree={tree}
            simpleGroups={filteredSimpleGroups}
            selectionMode='single'
            value={selectedValue}
            onChange={(next) => handleChange(String(next))}
            showSearch
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            maxHeight={280}
          />
        </div>
      )}
    />
  );
}

export type { IModelTreeItem, IModelTreeSimpleGroup };

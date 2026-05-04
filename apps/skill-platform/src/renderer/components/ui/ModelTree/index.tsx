import { getCategoryIcon } from '@renderer/components/ui/ModelIcons';
import type { IModelTreeSimpleGroup, IModelTreeVendorNode } from '@renderer/utils/model-tree';
import { Button, Input } from 'antd';
import { ChevronDownIcon, ChevronRightIcon, SearchIcon } from 'lucide-react';
import { useCallback, useMemo, useState, type ReactNode } from 'react';

import styles from './index.module.less';

export interface IProps {
  tree: IModelTreeVendorNode[];
  /** 单选 / 多选 */
  selectionMode?: 'single' | 'multiple';
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  /** 多选时是否显示厂商级「全选」 */
  showSelectAll?: boolean;
  /** 是否显示搜索框 */
  showSearch?: boolean;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  searchPlaceholder?: string;
  maxHeight?: number | string;
  emptyText?: string;
  className?: string;
  /** 顶部附加内容（如统计信息） */
  headerExtra?: ReactNode;
  /** 两级分组（如 CLI Agent -> Claude/Codex） */
  simpleGroups?: IModelTreeSimpleGroup[];
}

function toSelectedSet(value: string | string[] | undefined): Set<string> {
  if (!value) {
    return new Set();
  }
  return new Set(Array.isArray(value) ? value : [value]);
}

export function ModelTree({
  tree,
  selectionMode = 'single',
  value,
  onChange,
  showSelectAll = selectionMode === 'multiple',
  showSearch = false,
  searchQuery = '',
  onSearchQueryChange,
  searchPlaceholder = '搜索模型 ID 或名称...',
  maxHeight = 240,
  emptyText = '没有匹配的模型',
  className,
  headerExtra,
  simpleGroups = [],
}: IProps) {
  const selectedSet = useMemo(() => toSelectedSet(value), [value]);
  const [collapsedKeys, setCollapsedKeys] = useState<Set<string>>(() => new Set());

  const toggleCollapse = useCallback((key: string) => {
    setCollapsedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const emitSingle = useCallback(
    (modelId: string) => {
      onChange?.(modelId);
    },
    [onChange],
  );

  const toggleModel = useCallback(
    (modelId: string) => {
      if (selectionMode === 'single') {
        emitSingle(modelId);
        return;
      }
      const next = new Set(selectedSet);
      if (next.has(modelId)) {
        next.delete(modelId);
      } else {
        next.add(modelId);
      }
      onChange?.(Array.from(next));
    },
    [emitSingle, onChange, selectedSet, selectionMode],
  );

  const toggleVendorAll = useCallback(
    (vendorNode: IModelTreeVendorNode) => {
      const modelIds = vendorNode.children.flatMap((typeNode) =>
        typeNode.children.map((model) => model.id),
      );
      const allSelected = modelIds.every((id) => selectedSet.has(id));
      const next = new Set(selectedSet);
      if (allSelected) {
        modelIds.forEach((id) => next.delete(id));
      } else {
        modelIds.forEach((id) => next.add(id));
      }
      onChange?.(Array.from(next));
    },
    [onChange, selectedSet],
  );

  const renderModelRow = (modelId: string, label: string) => {
    const isSelected = selectedSet.has(modelId);
    if (selectionMode === 'multiple') {
      return (
        <button
          key={modelId}
          type='button'
          className={`${styles['model-tree-row']} ${styles['model-tree-row--model']} ${
            isSelected ? styles['model-tree-row--selected'] : ''
          }`}
          onClick={() => toggleModel(modelId)}>
          <span
            className={`${styles['model-tree-checkbox']} ${
              isSelected ? styles['model-tree-checkbox--checked'] : ''
            }`}>
            {isSelected ? '✓' : ''}
          </span>
          <span className={styles['model-tree-row-label']}>{label}</span>
        </button>
      );
    }

    return (
      <button
        key={modelId}
        type='button'
        className={`${styles['model-tree-row']} ${styles['model-tree-row--model']} ${
          isSelected ? styles['model-tree-row--selected'] : ''
        }`}
        onClick={() => toggleModel(modelId)}>
        <span className={styles['model-tree-row-label']}>{label}</span>
      </button>
    );
  };

  return (
    <div className={`${styles['model-tree']} ${className ?? ''}`}>
      {headerExtra ? <div className={styles['model-tree-header-extra']}>{headerExtra}</div> : null}
      {showSearch && onSearchQueryChange ? (
        <div className={styles['model-tree-search']}>
          <SearchIcon className={styles['model-tree-search-icon']} aria-hidden />
          <Input
            allowClear
            variant='borderless'
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder={searchPlaceholder}
            className={styles['model-tree-search-input']}
          />
        </div>
      ) : null}

      <div className={styles['model-tree-body']} style={{ maxHeight }}>
        {tree.length === 0 && simpleGroups.length === 0 ? (
          <div className={styles['model-tree-empty']}>{emptyText}</div>
        ) : (
          <>
            {simpleGroups.map((group) => {
              const groupCollapsed = collapsedKeys.has(group.id);
              return (
                <div key={group.id} className={styles['model-tree-simple-group']}>
                  <Button
                    type='text'
                    className={styles['model-tree-toggle']}
                    onClick={() => toggleCollapse(group.id)}>
                    {groupCollapsed ? (
                      <ChevronRightIcon className={styles['model-tree-chevron']} aria-hidden />
                    ) : (
                      <ChevronDownIcon className={styles['model-tree-chevron']} aria-hidden />
                    )}
                    <span className={styles['model-tree-vendor-label']}>{group.label}</span>
                    <span className={styles['model-tree-count']}>{group.children.length}</span>
                  </Button>
                  {!groupCollapsed ? (
                    <div className={styles['model-tree-simple-children']}>
                      {group.children.map((child) => renderModelRow(child.id, child.label))}
                    </div>
                  ) : null}
                </div>
              );
            })}
            {tree.map((vendorNode) => {
              const vendorCollapsed = collapsedKeys.has(vendorNode.id);
              const vendorModelIds = vendorNode.children.flatMap((typeNode) =>
                typeNode.children.map((model) => model.id),
              );
              const allVendorSelected =
                vendorModelIds.length > 0 && vendorModelIds.every((id) => selectedSet.has(id));
              const someVendorSelected = vendorModelIds.some((id) => selectedSet.has(id));

              return (
                <div key={vendorNode.id} className={styles['model-tree-vendor']}>
                  <div className={styles['model-tree-vendor-row']}>
                    <Button
                      type='text'
                      className={styles['model-tree-toggle']}
                      onClick={() => toggleCollapse(vendorNode.id)}>
                      {vendorCollapsed ? (
                        <ChevronRightIcon className={styles['model-tree-chevron']} aria-hidden />
                      ) : (
                        <ChevronDownIcon className={styles['model-tree-chevron']} aria-hidden />
                      )}
                      <span className={styles['model-tree-vendor-icon']}>
                        {getCategoryIcon(vendorNode.label, 16)}
                      </span>
                      <span className={styles['model-tree-vendor-label']}>{vendorNode.label}</span>
                      <span className={styles['model-tree-count']}>{vendorNode.count}</span>
                    </Button>
                    {showSelectAll ? (
                      <Button
                        type='text'
                        size='small'
                        className={`${styles['model-tree-select-all']} ${
                          allVendorSelected
                            ? styles['model-tree-select-all--active']
                            : someVendorSelected
                              ? styles['model-tree-select-all--partial']
                              : ''
                        }`}
                        onClick={() => toggleVendorAll(vendorNode)}>
                        {allVendorSelected ? '取消全选' : '全选'}
                      </Button>
                    ) : null}
                  </div>

                  {!vendorCollapsed
                    ? vendorNode.children.map((typeNode) => {
                        const typeCollapsed = collapsedKeys.has(typeNode.id);
                        return (
                          <div key={typeNode.id} className={styles['model-tree-type']}>
                            <Button
                              type='text'
                              className={styles['model-tree-toggle']}
                              onClick={() => toggleCollapse(typeNode.id)}>
                              {typeCollapsed ? (
                                <ChevronRightIcon
                                  className={styles['model-tree-chevron']}
                                  aria-hidden
                                />
                              ) : (
                                <ChevronDownIcon
                                  className={styles['model-tree-chevron']}
                                  aria-hidden
                                />
                              )}
                              <span className={styles['model-tree-type-label']}>
                                {typeNode.label}
                              </span>
                              <span className={styles['model-tree-count']}>{typeNode.count}</span>
                            </Button>
                            {!typeCollapsed ? (
                              <div className={styles['model-tree-models']}>
                                {typeNode.children.map((model) =>
                                  renderModelRow(model.id, model.label),
                                )}
                              </div>
                            ) : null}
                          </div>
                        );
                      })
                    : null}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

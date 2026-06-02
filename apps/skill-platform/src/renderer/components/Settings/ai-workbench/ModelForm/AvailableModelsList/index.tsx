import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';

import { ModelTree } from '@renderer/components/ui/ModelTree';
import type { IModelInfo } from '@renderer/services/ai';
import type { IModelFormState } from '@renderer/types/ai-workbench';
import {
  buildModelTree,
  buildModelTreeItemsFromRemote,
  filterModelTreeItems,
} from '@renderer/utils/model-tree';

export function AvailableModelsList({
  availableModels,
  setModelForm,
  selectedIds,
  onSelectionChange,
}: {
  availableModels: IModelInfo[];
  modelForm: IModelFormState;
  setModelForm: Dispatch<SetStateAction<IModelFormState>>;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const allItems = useMemo(() => buildModelTreeItemsFromRemote(availableModels), [availableModels]);
  const filteredItems = useMemo(
    () => filterModelTreeItems(allItems, searchQuery),
    [allItems, searchQuery],
  );
  const tree = useMemo(() => buildModelTree(filteredItems), [filteredItems]);

  if (availableModels.length === 0) {
    return null;
  }

  const handleSelectionChange = (nextValue: string | string[]) => {
    const nextIds = Array.isArray(nextValue) ? nextValue : [nextValue];
    onSelectionChange(nextIds);
    const latestSelected = nextIds[nextIds.length - 1];
    if (latestSelected) {
      setModelForm((prev) => ({ ...prev, model: latestSelected }));
    }
  };

  return (
    <div className='border-border bg-muted/20 rounded-xl border'>
      <div className='border-border/60 border-b px-3 py-2.5'>
        <div className='mb-2 flex items-center justify-between'>
          <span className='text-muted-foreground text-xs font-medium'>{'选择模型'}</span>
          <span className='text-muted-foreground text-[11px]'>
            {`共 ${availableModels.length} 个模型`}
            {searchQuery.trim() &&
              filteredItems.length !== allItems.length &&
              ` · ${filteredItems.length}`}
            {selectedIds.length > 0 && (
              <span className='bg-primary/10 text-primary ml-1.5 rounded px-1.5 py-0.5'>
                {`${selectedIds.length} 已选`}
              </span>
            )}
          </span>
        </div>
      </div>

      <div className='p-1.5'>
        <ModelTree
          tree={tree}
          selectionMode='multiple'
          value={selectedIds}
          onChange={handleSelectionChange}
          showSearch
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          maxHeight={240}
        />
      </div>
    </div>
  );
}

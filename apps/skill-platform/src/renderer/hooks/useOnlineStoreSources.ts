import { useEffect, useMemo } from 'react';

import {
  mergeOnlineSkillStoreSources,
  type IRemoteSkillStoreSource,
} from '@renderer/services/skill/online-store-sources';
import { useOnlineConfStore, useSkillStore } from '@renderer/store';

export function useOnlineStoreSources(): IRemoteSkillStoreSource[] {
  const config = useOnlineConfStore((state) => state.config);
  return useMemo(() => mergeOnlineSkillStoreSources(config), [config]);
}

export function useSyncDefaultOnlineStoreSource(): void {
  const onlineStoreSources = useOnlineStoreSources();
  const selectedStoreSourceId = useSkillStore((state) => state.selectedStoreSourceId);
  const customStoreSources = useSkillStore((state) => state.customStoreSources);
  const selectStoreSource = useSkillStore((state) => state.selectStoreSource);

  useEffect(() => {
    const availableIds = new Set([
      ...onlineStoreSources.map((source) => source.id),
      ...customStoreSources.map((source) => source.id),
      'new-custom',
    ]);

    if (selectedStoreSourceId && availableIds.has(selectedStoreSourceId)) {
      return;
    }

    selectStoreSource(onlineStoreSources[0]?.id ?? 'new-custom');
  }, [customStoreSources, onlineStoreSources, selectStoreSource, selectedStoreSourceId]);
}

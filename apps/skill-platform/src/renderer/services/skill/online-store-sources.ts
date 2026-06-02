import type { DOnlineConf, DOnlineConfSkillSource } from '@/types/modules/online-conf';

export type TRemoteSkillStoreType = DOnlineConfSkillSource['type'];

export interface IRemoteSkillStoreSource {
  id: string;
  name: string;
  description?: string;
  type: TRemoteSkillStoreType;
  url: string;
  gitRef?: string;
  enabled: boolean;
}

function normalizeOnlineSkillSource(item: DOnlineConfSkillSource): IRemoteSkillStoreSource | null {
  const id = item.id?.trim();
  const url = item.url?.trim();
  const type = item.type;
  if (!id || !url || !type) {
    return null;
  }

  return {
    id,
    name: item.name?.trim() || id,
    description: item.description?.trim() || undefined,
    type,
    url,
    gitRef: item.gitRef?.trim() || undefined,
    enabled: true,
  };
}

/** 合并 onlineConf 的 fileSource 与 apiSource，合并后仅按 type / url 使用，不再区分来源 */
export function mergeOnlineSkillStoreSources(
  config: DOnlineConf | null,
): IRemoteSkillStoreSource[] {
  const mergedSources = [
    ...(Array.isArray(config?.skills?.fileSource) ? config.skills.fileSource : []),
    ...(Array.isArray(config?.skills?.apiSource) ? config.skills.apiSource : []),
  ];

  const byId = new Map<string, IRemoteSkillStoreSource>();
  mergedSources.forEach((item) => {
    const normalized = normalizeOnlineSkillSource(item);
    if (normalized) {
      byId.set(normalized.id, normalized);
    }
  });

  return Array.from(byId.values());
}

export function isPagedRemoteStoreType(type: TRemoteSkillStoreType): boolean {
  return type === 'skillhub' || type === 'clawhub' || type === 'skills-sh';
}

export function isSearchRemoteStoreType(type: TRemoteSkillStoreType): boolean {
  return type === 'skillhub' || type === 'skills-sh';
}

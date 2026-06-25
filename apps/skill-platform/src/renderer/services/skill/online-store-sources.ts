import type { DOnlineConf, DOnlineConfSkillSource } from '@/types/modules/online-conf';

export type TRemoteSkillStoreType = DOnlineConfSkillSource['type'];

/** 内置商店来源：远程 onlineConf 未配置时生效，同 id 以远程为准 */
const BUILTIN_ONLINE_SKILL_API_SOURCES: DOnlineConfSkillSource[] = [
  {
    id: 'cocoloop',
    name: 'CocoLoop 商店',
    description: '来自 CocoLoop 的精选 Skills，含 CLS 安全认证与国内镜像下载。',
    type: 'cocoloop',
    url: 'https://api.cocoloop.cn/api/v1/store/skills',
  },
];

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

/** 合并内置来源、onlineConf 的 fileSource 与 apiSource；同 id 时远程配置覆盖内置 */
export function mergeOnlineSkillStoreSources(
  config: DOnlineConf | null,
): IRemoteSkillStoreSource[] {
  const mergedSources = [
    ...BUILTIN_ONLINE_SKILL_API_SOURCES,
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
  return type === 'skillhub' || type === 'clawhub' || type === 'cocoloop' || type === 'skills-sh';
}

export function isSearchRemoteStoreType(type: TRemoteSkillStoreType): boolean {
  return type === 'skillhub' || type === 'cocoloop' || type === 'skills-sh';
}

/** 在线配置：版本更新信息 */
export interface DOnlineConfUpdate {
  version: string;
  description: string;
  download: string;
}

/** 在线配置：工具箱链接项（叶子节点） */
export interface DOnlineConfToolLink {
  title: string;
  href?: string;
  /** 兼容配置中的拼写错误 */
  herf?: string;
}

/** 在线配置：工具箱菜单项 */
export interface DOnlineConfTool {
  title: string;
  /** Lucide 图标名（camelCase / PascalCase，如 bot、listOrdered） */
  icon?: string;
  href?: string;
  /** 兼容配置中的拼写错误 */
  herf?: string;
  /** 为 true 时，children 作为侧栏三级树展示 */
  childrenInLeaf?: boolean;
  children?: DOnlineConfTool[];
}

/** 远程 momo-ai-conf.json 完整结构 */
export interface DOnlineConfSkillSource {
  id: string;
  name: string;
  description?: string;
  type:
    | 'git-repo'
    | 'skillhub'
    | 'clawhub'
    | 'cocoloop'
    | 'skills-sh'
    | 'marketplace-json'
    | 'local-dir';
  url: string;
  gitRef?: string;
}

export interface DOnlineConfSkills {
  fileSource?: DOnlineConfSkillSource[];
  apiSource?: DOnlineConfSkillSource[];
}

export interface DOnlineConf {
  update?: DOnlineConfUpdate;
  tools?: DOnlineConfTool[];
  skills?: DOnlineConfSkills;
}

export interface DOnlineConfFetchResult {
  config: DOnlineConf | null;
  localVersion: string;
  onlineConfUrl: string;
  error?: string;
}

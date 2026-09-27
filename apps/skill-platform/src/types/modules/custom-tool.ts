import type { IApiRequestConfig } from '@momo/api-request/core';

/** 自定义工具树只负责设置页中的目录组织。 */
export type ECustomToolNodeKind = 'folder' | 'tool';

export interface ICustomToolTreeNode {
  id: string;
  name: string;
  kind: ECustomToolNodeKind;
  children?: ICustomToolTreeNode[];
}

export type ECustomToolViewKind = 'openui' | 'html';
export type ECustomToolDataMode = 'static' | 'api';

export interface ICustomToolPollingConfig {
  enabled: boolean;
  intervalMs: number;
}

/** 组件数据来源。接口响应通过 responsePath 取值后写入 targetProp。 */
export interface ICustomToolDataSource {
  mode: ECustomToolDataMode;
  targetProp: string;
  staticValue: unknown;
  request: IApiRequestConfig;
  responsePath: string;
  polling: ICustomToolPollingConfig;
}

/** OpenUI statementId 对应的可视化覆盖配置。 */
export interface ICustomToolComponentConfig {
  componentType: string;
  props: Record<string, unknown>;
  data: ICustomToolDataSource;
}

/**
 * 新版自定义工具是纯视图文档，不包含 action、后台服务、MCP、Skill 或执行权限。
 * id 为 tools 根目录下的相对路径。
 */
export interface ICustomToolDocument {
  id: string;
  name: string;
  kind: ECustomToolViewKind;
  content: string;
  components: Record<string, ICustomToolComponentConfig>;
}

export interface ICustomToolSaveInput {
  kind: ECustomToolViewKind;
  content: string;
  components: Record<string, ICustomToolComponentConfig>;
}

import type { IApiRequestConfig } from '@momo/api-request/core';

/** 自定义工具树只负责设置页中的目录组织。 */
export type ECustomToolNodeKind = 'folder' | 'tool';

export interface ICustomToolTreeNode {
  id: string;
  name: string;
  kind: ECustomToolNodeKind;
  children?: ICustomToolTreeNode[];
  webUrl?: string;
  toolIdentifier?: string;
}

export type ECustomToolViewKind = 'openui' | 'html' | 'web' | 'plugin';
export type ECustomToolGeneratedViewKind = 'openui' | 'html';
export type ECustomToolDataMode = 'static' | 'api';

export interface ICustomToolCreateInput {
  kind: 'openui' | 'web' | 'plugin';
  url?: string;
  identifier?: string;
}

export interface ICustomToolPlugin {
  identifier: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  tests: Array<{ name: string; input: Record<string, unknown>; expected: unknown }>;
}

export interface ICustomToolPluginValidation {
  revision: string;
  results: Array<{ name: string; output: unknown }>;
}

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
  /** OpenUI 源码中生成的原始属性，用于业务化表格展示。 */
  sourceProps?: Record<string, unknown>;
  props: Record<string, unknown>;
  data: ICustomToolDataSource;
}

/**
 * 界面、网页与经过校验的 Harness AI 插件共用工具箱目录。
 * id 为 tools 根目录下的相对路径。
 */
export interface ICustomToolDocument {
  id: string;
  name: string;
  kind: ECustomToolViewKind;
  content: string;
  components: Record<string, ICustomToolComponentConfig>;
  plugin?: ICustomToolPlugin;
  validation?: ICustomToolPluginValidation;
}

export interface ICustomToolSaveInput {
  kind: ECustomToolViewKind;
  content: string;
  components: Record<string, ICustomToolComponentConfig>;
  plugin?: ICustomToolPlugin;
}

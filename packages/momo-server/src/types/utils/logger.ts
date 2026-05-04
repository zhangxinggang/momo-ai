import type { ICommunicationConfig, ILoggerConfig } from '../runtime-config';

export interface ILoggerRuntimeConfig {
  logger?: ILoggerConfig;
  communication?: ICommunicationConfig;
}

export interface IAppenderConfig {
  type: string;
  [key: string]: unknown;
}

export interface ICategoryConfig {
  appenders: string[];
  level: string;
}

export type {
  IMailerConfig as IMailerConfig,
  IMailServerConfig as IMailServerConfig,
} from '../runtime-config';

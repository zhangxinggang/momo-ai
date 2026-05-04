import type { IServiceConfig } from './runtime-config';

/** 可启动服务的构造函数签名 */
export type TServiceConstructor = new (serviceConfig: IServiceConfig) => {
  start: (callback?: () => void) => void;
};

import koaConnect from 'koa-connect';
import send from 'koa-send';
import type { IHttpRouteDirConfig, IHttpRoutesConfig } from '../runtime-config';

/** 动态路由上下文 */
export interface IDynamicCtx {
  method: string;
  url: string;
  path: string;
  request: {
    body?: Record<string, unknown>;
    query?: Record<string, unknown>;
  };
  response: {
    body?: unknown;
  };
  throw: (status: number, error: Error) => never;
  formatSuccess: (data?: unknown, status?: number, message?: string) => void;
  formatError: (status?: unknown, message?: string) => void;
  [key: string]: unknown;
}

export type TNext = () => Promise<void>;

export type TMiddleware = (ctx: IDynamicCtx, next: TNext) => Promise<void>;

export interface IAppLike {
  use: (middleware: unknown) => void;
}

export type TRouteHandler = (ctx: IDynamicCtx, next?: TNext) => Promise<void> | void;

export type TControllerMethodMap = Record<string, TRouteHandler | TRouteHandler[]>;

export type TControllerExports = Record<
  string,
  TRouteHandler | TRouteHandler[] | TControllerMethodMap
>;

export type TProxyKoaContext = Parameters<ReturnType<typeof koaConnect>>[0];

export type TSendKoaContext = Parameters<typeof send>[0];

export type TSendOptions = NonNullable<Parameters<typeof send>[2]>;

export interface IRouteStackItem {
  methods: string[];
  regexp: RegExp;
  nkr_params?: {
    rootDir: string;
    rootPath: string;
  };
}

export interface IRouteLike {
  routes: () => TMiddleware;
  nkr_auth?: boolean;
  stack: IRouteStackItem[];
  [key: string]: unknown;
}

export interface IRouterOptions {
  routes?: IRouteLike[];
  proxyRoutes?: IHttpRoutesConfig['proxyRoutes'];
  staticDirs?: IHttpRouteDirConfig[];
  mountRouteDirs?: IHttpRouteDirConfig[];
  dynamicRouteDirs?: IHttpRouteDirConfig[];
  [key: string]: unknown;
}

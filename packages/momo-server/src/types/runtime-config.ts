export interface IRouteDirConfig {
  rootDir: string;
  rootPath: string;
  auth?: boolean;
  ignore?: string | string[];
  ext?: string;
}

export interface IHttpRouteDirConfig extends IRouteDirConfig {
  index?: string | false;
}

export interface IHttpProtocolConfig {
  start?: boolean;
  port?: number;
  key?: {
    path?: string;
    value?: string;
  };
  cert?: {
    path?: string;
    value?: string;
  };
}

export interface IHttpSecurityConfig {
  secret: string;
  tokenExpiresIn: string;
  noAuthorityRoutes: string[];
}

export interface IHttpRoutesConfig {
  dynamicRouteDirs?: IHttpRouteDirConfig[];
  mountRouteDirs?: IHttpRouteDirConfig[];
  staticDirs?: IHttpRouteDirConfig[];
  proxyRoutes?: Record<string, string | IProxyRouteOption>;
}

export interface IProxyRouteOption {
  target: string;
  auth?: boolean;
  [key: string]: unknown;
}

export interface IMailServerConfig {
  auth?: {
    user?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface IMailerConfig {
  start: boolean;
  defaultRecipients: string[];
  server: string;
  [key: string]: string | boolean | string[] | IMailServerConfig | undefined;
}

export interface IRtmpAuthConfig {
  publish?: boolean;
  play?: boolean;
  secret?: string;
}

export interface IRtmpServerConfig {
  start: boolean;
  port: number;
  chunk_size?: number;
  gop_cache?: boolean;
  ping?: number;
  ping_timeout?: number;
  auth?: IRtmpAuthConfig;
  [key: string]: unknown;
}

export interface IVideoCameraConfig {
  deviceName?: string;
  streamUrl?: string;
  tempLive?: boolean;
  [key: string]: unknown;
}

export interface IHttpServerConfig {
  start: boolean;
  protocols: {
    http?: IHttpProtocolConfig;
    https?: IHttpProtocolConfig;
  };
  security: IHttpSecurityConfig;
  bodyparser: IHttpBodyParserConfig;
  routes: IHttpRoutesConfig;
}

export interface IHttpBodyParserConfig {
  multipart?: boolean;
  formidable?: {
    maxFileSize?: number;
    uploadDir?: string;
    keepExtensions?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface IBasicServiceConfig {
  start: boolean;
  [key: string]: unknown;
}

export interface IPortServiceConfig extends IBasicServiceConfig {
  port: number;
}

export interface IAutoRunTaskConfig {
  start: boolean;
  rootDirs: string[];
}

export interface ILoggerConfig {
  start: boolean;
  rootDir: string;
}

export interface ICommunicationConfig {
  mailer?: IMailerConfig;
}

export interface IProjectConfig {
  name: string;
  favIcon: string;
}

export interface IVideoConfig {
  camera?: IVideoCameraConfig;
}

export type IServiceConfig =
  | IBasicServiceConfig
  | IPortServiceConfig
  | IHttpServerConfig
  | IRtmpServerConfig;

export interface IRuntimeConfig {
  services: {
    rtmpServer: IRtmpServerConfig;
    rtspServer: IPortServiceConfig;
    tcpServer: IPortServiceConfig;
    udpServer: IPortServiceConfig;
    httpServer: IHttpServerConfig;
    [key: string]: IServiceConfig;
  };
  requireAlias: Record<string, string>;
  autoRunTask: IAutoRunTaskConfig;
  logger: ILoggerConfig;
  communication: ICommunicationConfig;
  project: IProjectConfig;
  video?: IVideoConfig;
  httpServerPath?: string;
  [key: string]: unknown;
}

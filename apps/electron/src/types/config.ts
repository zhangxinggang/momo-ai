/** appConf.cjs 中 server.proxyRoutes 单项 */
export interface IAppConfigProxyRoute {
  target: string;
  pathRewrite?: Record<string, string>;
  changeOrigin?: boolean;
  secure?: boolean;
  auth?: boolean;
}

/** appConf.cjs 中 server.upload */
export interface IAppConfigServerUpload {
  maxFileSize?: number;
}

/** appConf.cjs 中 server 段 */
export interface IAppConfigServer {
  httpPort?: number;
  httpsPort?: number;
  filePreviewBaseUrl?: string;
  upload?: IAppConfigServerUpload;
  autoRunDirs?: string[];
  proxyRoutes?: Record<string, IAppConfigProxyRoute>;
}

/** appConf.cjs 中 browserWindow 段 */
export interface IAppConfigBrowserWindow {
  width?: number;
}

/** 与 apps/electron/appConf.cjs 结构一致的桌面应用配置 */
export interface IAppConfig {
  appName?: string;
  loadUrl?: string;
  openDevTools?: boolean;
  closeConfirm?: boolean;
  onlineConfUrl?: string;
  databaseName?: string;
  browserWindow?: IAppConfigBrowserWindow;
  server?: IAppConfigServer;
}

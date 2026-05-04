/** Electron 路径配置相关类型 */

export interface IConfigureElectronBasePathsOptions {
  appRootPath: string;
}

export type TElectronPathName =
  | 'home'
  | 'appData'
  | 'assets'
  | 'userData'
  | 'sessionData'
  | 'temp'
  | 'exe'
  | 'module'
  | 'desktop'
  | 'documents'
  | 'downloads'
  | 'music'
  | 'pictures'
  | 'videos'
  | 'recent'
  | 'logs'
  | 'crashDumps';

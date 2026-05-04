/** userData 路径解析相关类型 */

export interface IUserDataPathProductConfig {
  /** 默认 userData 目录名（位于 appData 下），如 PromptHub */
  productName: string;
  /** appData 下存放 data-path.json 的目录名，默认与 productName 相同 */
  configDirName?: string;
  /** 配置文件名，默认 data-path.json */
  configFileName?: string;
  /** 用于判断目录是否已有用户数据的标记文件/目录名 */
  dataMarkers: string[];
}

export interface IExistingDataMarker {
  name: string;
  path: string;
  type: 'file' | 'directory' | 'other';
}

export interface IDataPathInspection {
  targetPath: string;
  exists: boolean;
  hasExistingData: boolean;
  markers: IExistingDataMarker[];
}

export interface IDataPathResolverOptions {
  productConfig: IUserDataPathProductConfig;
  appDataPath: string;
  defaultUserDataPath: string;
  exePath: string;
  isPackaged: boolean;
  platform: NodeJS.Platform;
}

export interface IConfigureAppUserDataPathOptions {
  productConfig: IUserDataPathProductConfig;
  exePath?: string;
  platform?: NodeJS.Platform;
}

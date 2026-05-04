import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import type {
  IConfigureAppUserDataPathOptions,
  IDataPathInspection,
  IDataPathResolverOptions,
  IExistingDataMarker,
  IUserDataPathProductConfig,
} from '../types/user-data-path';
import { getPlatformPath, isPathWritable } from './path';

export type {
  IConfigureAppUserDataPathOptions,
  IDataPathInspection,
  IDataPathResolverOptions,
  IExistingDataMarker,
  IUserDataPathProductConfig,
};

const DEFAULT_CONFIG_FILE_NAME = 'data-path.json';

function getConfigFilePath(config: IUserDataPathProductConfig): string {
  const configDirName = config.configDirName ?? config.productName;
  const configFileName = config.configFileName ?? DEFAULT_CONFIG_FILE_NAME;
  return path.join(app.getPath('appData'), configDirName, configFileName);
}

export function readConfiguredDataPath(config: IUserDataPathProductConfig): string | null {
  const configPath = getConfigFilePath(config);
  try {
    if (!fs.existsSync(configPath)) {
      return null;
    }

    const parsed = JSON.parse(fs.readFileSync(configPath, 'utf8')) as {
      dataPath?: unknown;
    };
    if (typeof parsed.dataPath !== 'string' || parsed.dataPath.trim() === '') {
      return null;
    }

    return path.resolve(parsed.dataPath);
  } catch (error) {
    console.warn(`Failed to read configured data path:`, error);
    return null;
  }
}

export function writeConfiguredDataPath(
  config: IUserDataPathProductConfig,
  dataPath: string,
): void {
  const configPath = getConfigFilePath(config);
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(
    configPath,
    JSON.stringify(
      {
        dataPath: path.resolve(dataPath),
        updatedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
    'utf8',
  );
}

export function inspectDataPath(
  config: IUserDataPathProductConfig,
  targetPath: string,
): IDataPathInspection {
  const resolvedTargetPath = path.resolve(targetPath);
  if (!targetPath || !fs.existsSync(resolvedTargetPath)) {
    return {
      targetPath: resolvedTargetPath,
      exists: false,
      hasExistingData: false,
      markers: [],
    };
  }

  const markers = config.dataMarkers.flatMap((marker): IExistingDataMarker[] => {
    const markerPath = path.join(resolvedTargetPath, marker);
    if (!fs.existsSync(markerPath)) {
      return [];
    }

    try {
      const stat = fs.statSync(markerPath);
      return [
        {
          name: marker,
          path: markerPath,
          type: stat.isDirectory() ? 'directory' : stat.isFile() ? 'file' : 'other',
        },
      ];
    } catch {
      return [
        {
          name: marker,
          path: markerPath,
          type: 'other',
        },
      ];
    }
  });

  return {
    targetPath: resolvedTargetPath,
    exists: true,
    hasExistingData: markers.length > 0,
    markers,
  };
}

function resolvePlatformPath(targetPath: string, platform: NodeJS.Platform): string {
  if (platform === 'win32') {
    return targetPath.replace(/\//g, '\\');
  }

  return path.resolve(targetPath);
}

function dirnamePlatformPath(targetPath: string, platform: NodeJS.Platform): string {
  return platform === 'win32' ? path.win32.dirname(targetPath) : path.dirname(targetPath);
}

function isProtectedInstallDir(targetPath: string, platform: NodeJS.Platform): boolean {
  const normalized = resolvePlatformPath(targetPath, platform).toLowerCase();

  if (platform === 'win32') {
    return ['\\windows\\', '\\program files\\', '\\program files (x86)\\'].some((segment) =>
      normalized.includes(segment),
    );
  }

  if (platform === 'darwin') {
    return (
      normalized.startsWith('/applications') ||
      normalized.startsWith('/system') ||
      normalized.startsWith('/library')
    );
  }

  return normalized.startsWith('/usr') || normalized.startsWith('/opt');
}

function isDefaultPerUserInstallDir(targetPath: string, platform: NodeJS.Platform): boolean {
  if (platform !== 'win32') {
    return false;
  }

  const normalized = resolvePlatformPath(targetPath, platform).toLowerCase();
  return normalized.includes('\\appdata\\local\\programs\\');
}

function getInstallScopedDataPath(
  exePath: string,
  platform: NodeJS.Platform,
  isPackaged: boolean,
): string | null {
  if (!isPackaged || platform !== 'win32') {
    return null;
  }

  const installDir = dirnamePlatformPath(resolvePlatformPath(exePath, platform), platform);
  if (isProtectedInstallDir(installDir, platform)) {
    return null;
  }

  if (isDefaultPerUserInstallDir(installDir, platform)) {
    return null;
  }

  return getPlatformPath(installDir, 'data');
}

export function resolveInitialUserDataPath(options: IDataPathResolverOptions): string {
  const configuredPath = readConfiguredDataPath(options.productConfig);
  if (configuredPath) {
    return configuredPath;
  }

  if (inspectDataPath(options.productConfig, options.defaultUserDataPath).hasExistingData) {
    return options.defaultUserDataPath;
  }

  const installScopedPath = getInstallScopedDataPath(
    options.exePath,
    options.platform,
    options.isPackaged,
  );

  if (
    installScopedPath &&
    isPathWritable(dirnamePlatformPath(installScopedPath, options.platform))
  ) {
    if (inspectDataPath(options.productConfig, installScopedPath).hasExistingData) {
      return installScopedPath;
    }
  }

  return options.defaultUserDataPath;
}

/**
 * 解析初始 userData 目录并写入 Electron app（须在 app ready 之前调用）。
 * @returns 解析后的 userData 绝对路径
 */
function configureAppUserDataPath(options: IConfigureAppUserDataPathOptions): string {
  const { productConfig } = options;
  const platform = options.platform ?? process.platform;
  const appDataPath = app.getPath('appData');
  const resolvedUserDataPath = resolveInitialUserDataPath({
    productConfig,
    appDataPath,
    defaultUserDataPath: getPlatformPath(appDataPath, productConfig.productName),
    exePath: options.exePath ?? process.execPath,
    isPackaged: app.isPackaged,
    platform,
  });
  app.setPath('userData', resolvedUserDataPath);
  return resolvedUserDataPath;
}

export { configureAppUserDataPath };

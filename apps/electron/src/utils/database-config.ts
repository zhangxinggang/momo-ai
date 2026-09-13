import fs from 'fs';
import path from 'path';
import packageJson from '../../package.json';

function getElectronPackagePath(): string {
  try {
    return path.join(require.resolve('@momo/electron'), '../../');
  } catch {
    // Consumer apps bundle this helper, so a runtime node_modules entry is optional.
    return path.resolve(__dirname, '../..');
  }
}

/**
 * Resolve the optional better-sqlite3 native binding without loading Electron
 * main-process APIs. This helper is also safe to use from utility processes.
 */
export function getDbConfig(): { nativeBinding?: string } {
  const betterVersion =
    packageJson.dependencies['better-sqlite3'] || packageJson.devDependencies['better-sqlite3'];
  // https://juejin.cn/post/7424425429699198991
  const sqlFileName = `better-sqlite3-v${betterVersion}-electron-v${process.versions.modules}-win32-x64.node`;
  const nativeFolders = [
    path.join(process.resourcesPath, 'native'),
    path.join(getElectronPackagePath(), 'src/main/database/native'),
  ];

  for (const nativeFolder of nativeFolders) {
    const nativeBinding = path.join(nativeFolder, sqlFileName);
    if (fs.existsSync(nativeBinding)) {
      return { nativeBinding };
    }
  }
  return {};
}

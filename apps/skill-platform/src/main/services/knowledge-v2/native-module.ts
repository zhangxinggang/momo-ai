import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

type TModuleLoader = (
  request: string,
  parent: NodeModule | null | undefined,
  isMain: boolean,
) => unknown;

const packageRequire = createRequire(__filename);
const moduleBuiltin = packageRequire('node:module') as typeof import('node:module') & {
  _load: TModuleLoader;
};

/**
 * Load a JavaScript package from app.asar while redirecting only its platform
 * binding to the flat resources/native directory.
 */
export function loadPackagedNativeModule<T>(options: {
  packageName: string;
  nativePackageName: string;
  nativeFileName: string;
  nativePackageVersion: string;
}): T {
  const nativePath = path.join(process.resourcesPath, 'native', options.nativeFileName);
  if (!fs.existsSync(nativePath)) {
    return packageRequire(options.packageName) as T;
  }

  const originalLoad = moduleBuiltin._load;
  moduleBuiltin._load = function loadWithFlatNative(
    request: string,
    parent: NodeModule | null | undefined,
    isMain: boolean,
  ) {
    if (request === options.nativePackageName) {
      return originalLoad.call(this, nativePath, parent, isMain);
    }
    if (request === `${options.nativePackageName}/package.json`) {
      return { version: options.nativePackageVersion };
    }
    return originalLoad.call(this, request, parent, isMain);
  };
  try {
    return packageRequire(options.packageName) as T;
  } finally {
    moduleBuiltin._load = originalLoad;
  }
}

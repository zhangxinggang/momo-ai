import type { BrowserWindow } from 'electron';
import { join } from 'path';

import { getAppConfig, getPackagePath, getServerConfig, getStaticPath } from '../../utils';
import { STATIC_FOLDER_NAME } from '../../utils/constant';
import { licenseService } from '../database/service/LicenseService';

const appConf = getAppConfig();
const { loadURL } = appConf;
const enterAuthPage = process.env.ELECTRON_DEV_SET_AUTH === 'true';
const isLicenseRequired = process.env.REQUIRE_LICENSE === 'true';

function licenseStaticPath(fileName: string): string {
  return join(getPackagePath(), STATIC_FOLDER_NAME, fileName);
}

/** 加载主应用、授权页或开发授权生成页 */
export async function loadWindowContent(win: BrowserWindow): Promise<void> {
  const { httpPort } = getServerConfig();
  if (enterAuthPage) {
    win.loadFile(licenseStaticPath('setAuth.html'), { query: { httpPort: String(httpPort) } });
    return;
  }
  if (isLicenseRequired) {
    const licensed = await licenseService.hasValidLicense();
    if (!licensed) {
      win.loadFile(licenseStaticPath('license.html'), { query: { httpPort: String(httpPort) } });
      return;
    }
  }

  if (loadURL) {
    win.loadURL(loadURL);
    return;
  }
  const filePath = join(getStaticPath(), 'index.html');
  win.loadFile(filePath);
}

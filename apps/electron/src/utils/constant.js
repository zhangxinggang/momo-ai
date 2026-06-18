import packageJson from '../../package.json';
import { getSystemLogo } from './file';

export const STATIC_FOLDER_NAME = 'static';
export const CONFIG_FILE = 'appConf.cjs';
export const SERVER_FOLDER = 'server';
export const UPLOAD_FOLDER = 'assets';
export const SYSTEM_API_PREFIX = 'system_api';

const systemLogo = getSystemLogo();

export const DEFAULT_WINDOW_ATTR = {
  width: 1366,
  height: 768,
  minWidth: 1024,
  minHeight: 720,
  backgroundColor: '#1a1d23',
  title: packageJson.name,
  icon: systemLogo,
};

import fs from 'fs';
import path from 'path';
import { getServerConfig } from './config';
import { SYSTEM_API_PREFIX } from './constant';
import { getStaticPath } from './path';

function getFolderAllFiles(dirPath: string, arrayOfFiles: string[]) {
  let files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getFolderAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(__dirname, dirPath, '/', file));
    }
  });
  return arrayOfFiles;
}

/**
 * 解析应用静态资源目录下的图标路径（存在则返回，否则尝试备用名）
 */
function getSystemLogo(): string | undefined {
  const faviconPng = path.join(getStaticPath(), 'favicon.png');
  const logoPng = path.join(getStaticPath(), 'logo.png');
  let systemLogo: string | undefined = undefined;
  const existFaviconPng = fs.existsSync(faviconPng);
  const existLogoPng = fs.existsSync(logoPng);
  if (existFaviconPng || existLogoPng) {
    if (existFaviconPng) {
      systemLogo = faviconPng;
    } else {
      systemLogo = logoPng;
    }
  } else {
    const momoServerPath = require.resolve('@momo/server');
    const momoServerIcon = path.join(momoServerPath, '../assets/favicon.png');
    if (fs.existsSync(momoServerIcon)) {
      systemLogo = momoServerIcon;
    }
  }
  return systemLogo;
}

const getUploadUrl = () =>
  `http://localhost:${getServerConfig().httpPort}/${SYSTEM_API_PREFIX}/upload`;

export { getFolderAllFiles, getSystemLogo, getUploadUrl };

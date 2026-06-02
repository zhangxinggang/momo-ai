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
function getSystemLogo(): { ico: string | undefined; png: string | undefined } {
  const ico = path.join(getStaticPath(), 'favicon.ico');
  const icoLogo = path.join(getStaticPath(), 'logo.ico');
  const png = path.join(getStaticPath(), 'favicon.png');
  const pngLogo = path.join(getStaticPath(), 'logo.png');
  let icoData: string | undefined = ico;
  let pngData: string | undefined = png;
  if (!fs.existsSync(icoData)) {
    icoData = fs.existsSync(icoLogo) ? icoLogo : undefined;
    if (!icoData) {
      const momoServerPath = require.resolve('@momo/server');
      const momoServerIcon = path.join(momoServerPath, '../assets/favicon.ico');
      if (fs.existsSync(momoServerIcon)) {
        icoData = momoServerIcon;
      }
    }
  }
  if (!fs.existsSync(pngData)) {
    pngData = fs.existsSync(pngLogo) ? pngLogo : undefined;
  }
  return { ico: icoData, png: pngData };
}

const getUploadUrl = () =>
  `http://localhost:${getServerConfig().httpPort}/${SYSTEM_API_PREFIX}/upload`;

export { getFolderAllFiles, getSystemLogo, getUploadUrl };

import path from 'path';
import { getPackagePath, getServerConfig, getServerPath, getUserPath } from '../../utils';
import { UPLOAD_FOLDER } from '../../utils/constant';

const { httpPort, httpsPort, upload, autoRunDirs, proxyRoutes } = getServerConfig();
const uploadDir = path.join(getUserPath(), UPLOAD_FOLDER);
const config = {
  services: {
    httpServer: {
      protocols: {
        http: {
          start: true,
          port: httpPort,
        },
        https: {
          start: httpsPort ? true : false,
          port: httpsPort,
        },
      },
      bodyparser: {
        multipart: true,
        formidable: {
          maxFileSize: upload.maxFileSize,
          uploadDir: uploadDir,
          keepExtensions: true,
        },
      },
      routes: {
        staticDirs: [
          {
            rootDir: uploadDir,
            rootPath: UPLOAD_FOLDER,
            auth: false,
          },
        ],
        dynamicRouteDirs: [
          {
            rootDir: path.join(getPackagePath(), './src/main/server/system'),
            rootPath: 'system_api',
            auth: false,
          },
          {
            rootDir: getServerPath(),
            rootPath: 'api',
            auth: false,
          },
        ],
        proxyRoutes,
      },
    },
  },
  autoRunTask: {
    start: Boolean(autoRunDirs.length),
    rootDirs: autoRunDirs,
  },
  logger: {
    start: true,
    rootDir: path.join(process.cwd(), '/logs'),
  },
};

export default config;

import path from 'path';
import { getPackagePath, getServerConfig, getServerPath, getUploadDir } from '../../utils';
import { SYSTEM_API_PREFIX, UPLOAD_FOLDER } from '../../utils/constant';

const { httpPort, httpsPort, upload, autoRunDirs, proxyRoutes } = getServerConfig();
const uploadDir = getUploadDir();
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
            rootPath: SYSTEM_API_PREFIX,
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

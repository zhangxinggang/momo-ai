import dotenv from 'dotenv';
import fs from 'fs';
import glob from 'glob';
import merge from 'merge';
import path from 'path';
import config from '../config';
import type { IRuntimeConfig } from '../types/runtime-config';
import type { TServiceConstructor } from '../types/services-constructor';
import Logger from '../utils/logger';
import Request from '../utils/request';
import httpServer from './http-server';

dotenv.config();

const allServers = { httpServer };
const fixVal = (originObj: object, newObjName: string, value: unknown): void => {
  Object.defineProperty(originObj, newObjName, {
    value,
    writable: false,
    enumerable: true,
    configurable: false,
  });
};

const errorHandler = (): void => {
  process.on('uncaughtException', (err) => {
    console.error('uncaughtException:', err);
  });
  process.on('unhandledRejection', (err) => {
    console.error('unhandledRejection:', err);
  });
  process.on('rejectionHandled', (err) => {
    console.error('rejectionHandled:', err);
  });
};

const init = (runtimeConfig: IRuntimeConfig): void => {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }
  global.NKGlobal = { config: runtimeConfig };
  if (runtimeConfig.requireAlias) {
    global.NKRequire = <T = unknown>(namespace: string, file: string): T | undefined => {
      const dir = runtimeConfig.requireAlias?.[namespace];
      if (!dir) return undefined;
      if (!fs.existsSync(dir)) {
        console.error(new Error(`at config->requireAlias not found ${namespace}!`));
        return undefined;
      }
      const dealFile = file.endsWith('.cjs') ? file : `${file}.cjs`;
      return require(path.join(dir, dealFile)) as T;
    };
  }
  fixVal(global, '$fixVal', fixVal);
  global.$fixVal(global, '$request', Request);
  new Logger(runtimeConfig).init();
  process.title = runtimeConfig.project?.name || 'nk';
  errorHandler();
};

const endingWorks = (): void => {
  const allPrerequisites: Array<Promise<unknown>> = [];
  const jsDirs = path.join(__dirname, './server/prerequisite/**/*.js');
  const prerequisitePreLoads = glob.sync(jsDirs, { cwd: __dirname });
  prerequisitePreLoads.forEach((modPath: string) => {
    allPrerequisites.push(require(modPath)());
  });

  void Promise.all(allPrerequisites)
    .then((values) => {
      const prerequisiteSuc = values.every((item) => Boolean(item));
      if (!prerequisiteSuc) {
        return;
      }
      const autoRunTask = global.NKGlobal.config.autoRunTask;
      if (autoRunTask.start === true && autoRunTask.rootDirs) {
        console.info('[autoRun] task is open');
        autoRunTask.rootDirs.forEach((item: string) => {
          const autoRunTaskPreLoads = glob.sync(path.join(item, '/**/*.js'), { cwd: __dirname });
          autoRunTaskPreLoads.forEach((modPath: string) => {
            require(modPath);
          });
        });
      }
    })
    .catch((err: unknown) => {
      console.error(err);
    });
};

const startServices = (pcf: Record<string, unknown> = {}): void => {
  merge.recursive(config, pcf);
  init(config);

  const allService: Array<Promise<string>> = [];
  const serviceConfigs = config.services || {};

  Object.keys(serviceConfigs).forEach((item) => {
    const serverConf = serviceConfigs[item];
    if (!serverConf?.start) {
      return;
    }
    try {
      const Service = allServers[item] as TServiceConstructor;
      allService.push(
        new Promise((resolve, reject) => {
          try {
            new Service(serverConf).start(() => {
              resolve(item);
            });
          } catch (err) {
            reject(err);
          }
        }),
      );
    } catch (err) {
      console.error(err);
    }
  });

  void Promise.all(allService).then(() => {
    endingWorks();
  });
};

export default startServices;

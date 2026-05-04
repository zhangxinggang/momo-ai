import type { DataSource } from 'typeorm';

import { getAppDataSource } from '../init';

/** 获取已初始化的 TypeORM DataSource */
export function requireDataSource(): DataSource {
  const ds = getAppDataSource();
  if (!ds?.isInitialized) {
    throw new Error('DataSource 未初始化');
  }
  return ds;
}

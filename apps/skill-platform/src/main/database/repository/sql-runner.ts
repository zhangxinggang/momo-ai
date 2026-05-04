import type { EntityManager } from 'typeorm';

import { requireDataSource } from './orm-data-source';

/** 执行原生 SQL（经 TypeORM 连接，与 better-sqlite3 一致） */
export async function runQuery<T = unknown>(
  sql: string,
  params: unknown[] = [],
  manager?: EntityManager,
): Promise<T> {
  const m = manager ?? requireDataSource().manager;
  return m.query(sql, params) as Promise<T>;
}

/** 在单事务中执行回调 */
export async function runInTransaction<T>(fn: (manager: EntityManager) => Promise<T>): Promise<T> {
  return requireDataSource().transaction(fn);
}

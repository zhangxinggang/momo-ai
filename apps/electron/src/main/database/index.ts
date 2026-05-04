import type { Database } from 'better-sqlite3';
import type { ObjectLiteral, Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import { getAppConfig, getDbConfig } from '../../utils';
import { SoftwareLicense } from './entities/SoftwareLicense';
import { User } from './entities/User';

/** TypeORM 实体类（非 ObjectLiteral 实例） */
type EntityCtor = typeof User | typeof SoftwareLicense | Function;

/** 默认注册的 TypeORM 实体 */
export const DEFAULT_ENTITIES: EntityCtor[] = [User, SoftwareLicense];

const appConf = getAppConfig();
const { databaseName = 'database.sql' } = appConf;

/** 全局 TypeORM DataSource（better-sqlite3 + 全表实体） */
let dataSource: DataSource | null = null;

/** 创建并初始化 DataSource，底层与 prompthub.db 单一连接 */
export async function initializeDataSource(
  options: { entities?: EntityCtor[] } = {},
): Promise<DataSource> {
  if (dataSource?.isInitialized) {
    return dataSource;
  }
  const entities: EntityCtor[] = options.entities?.length
    ? [SoftwareLicense, ...options.entities]
    : DEFAULT_ENTITIES;
  const ds = new DataSource({
    type: 'better-sqlite3',
    database: databaseName,
    synchronize: false,
    logging: false,
    ...getDbConfig(),
    entities,
  });
  await ds.initialize();
  dataSource = ds;
  return ds;
}

export function getBetterSqliteFromDataSource(ds: DataSource): Database {
  if (!ds.isInitialized) {
    throw new Error('DataSource 未初始化');
  }
  const driver = ds.driver as any;
  if (driver?.databaseConnection) {
    return driver.databaseConnection as Database;
  }
  if (driver?.sqlite) {
    return driver.sqlite as Database;
  }
  throw new Error('无法从 DataSource 提取 better-sqlite3 Database');
}

export async function destroyDataSource(dbPath: string): Promise<void> {
  if (!dataSource?.isInitialized) {
    return;
  }

  const currentPath = (dataSource.options as any)?.database;
  if (currentPath && currentPath !== dbPath) {
    console.warn(
      `[DB] destroyDataSource: requested path ${dbPath} does not match active database ${currentPath}`,
    );
  }

  await dataSource.destroy();
  dataSource = null;
}

export class DatabaseManager {
  private static instance: DatabaseManager;
  private connection: DataSource | null = null;

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }

    return DatabaseManager.instance;
  }

  public async connect(): Promise<DataSource> {
    this.connection = await initializeDataSource();
    return this.connection;
  }

  public async disconnect(): Promise<void> {
    if (!this.connection?.isInitialized) {
      this.connection = null;
      return;
    }
    const dbPath = (this.connection.options as { database?: string }).database;
    if (dbPath) {
      await destroyDataSource(dbPath);
    } else {
      await this.connection.destroy();
      dataSource = null;
    }
    this.connection = null;
  }

  public async getRepository<T extends ObjectLiteral>(entity: {
    new (): T;
  }): Promise<Repository<T>> {
    await this.connect();
    if (!this.connection) {
      throw new Error('database connection not established');
    }
    return this.connection.getRepository(entity);
  }
}

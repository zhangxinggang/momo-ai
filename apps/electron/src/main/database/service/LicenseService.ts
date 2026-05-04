import { machineIdSync } from 'node-machine-id';

import { getBetterSqliteFromDataSource, initializeDataSource } from '../index';
import { LicenseRepository } from '../repository/LicenseRepository';

/** @momo/server 运行时全局注入 */
declare function NKRequire<T>(namespace: string, file: string): T | undefined;

const LICENSE_TABLE = 'software_license';
const AUTH_CODE_MAX_LEN = 1000;

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS ${LICENSE_TABLE} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  auth_code TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
`;

interface IDiffieHellmanApi {
  decrypt: (str: string) => string;
}

interface INkhSecurityModule {
  DiffieHellman: IDiffieHellmanApi;
}

function checkMachineAuth(authCode: string): boolean {
  const security = NKRequire<INkhSecurityModule>('NKH', 'security');
  if (!security?.DiffieHellman) {
    return false;
  }
  try {
    const plain = security.DiffieHellman.decrypt(authCode);
    const { machineId, startTime, endTime } = JSON.parse(plain) as {
      machineId?: string;
      startTime?: number;
      endTime?: number;
    };
    if (!machineId || startTime == null || endTime == null) {
      return false;
    }
    if (Number(endTime) <= Date.now()) {
      return false;
    }
    return machineId === machineIdSync(true);
  } catch {
    return false;
  }
}

class LicenseService {
  private licenseRepository = new LicenseRepository();
  private tableEnsured = false;

  /** 确保授权表已创建（synchronize 关闭时由服务自行建表） */
  private async ensureLicenseTable(): Promise<void> {
    if (this.tableEnsured) {
      return;
    }
    const ds = await initializeDataSource();
    const db = getBetterSqliteFromDataSource(ds);
    db.exec(CREATE_TABLE_SQL);
    this.tableEnsured = true;
  }

  /** 读取当前保存的授权码（表内仅保留一条） */
  async getStoredAuthCode(): Promise<string | null> {
    await this.ensureLicenseTable();
    const repository = await this.licenseRepository.getRepository();
    const row = await repository.findOne({ where: {}, order: { id: 'ASC' } });
    return row?.authCode ?? null;
  }

  /** 校验授权码是否对当前机器有效 */
  isAuthCodeValid(authCode: string): boolean {
    return checkMachineAuth(authCode);
  }

  /** 是否存在对当前机器有效的授权 */
  async hasValidLicense(): Promise<boolean> {
    const authCode = await this.getStoredAuthCode();
    if (!authCode) {
      return false;
    }
    return checkMachineAuth(authCode);
  }

  /** 保存授权码（校验通过后写入，表内始终仅一条记录） */
  async saveLicenseRecord(authCode: string): Promise<void> {
    const trimmed = authCode.trim();
    if (!trimmed || trimmed.length > AUTH_CODE_MAX_LEN) {
      throw new Error('授权码无效或超出长度限制');
    }
    await this.ensureLicenseTable();
    const repository = await this.licenseRepository.getRepository();
    const existing = await repository.findOne({ where: {}, order: { id: 'ASC' } });
    const now = Date.now();
    if (existing) {
      await repository.update(existing.id, { authCode: trimmed, createdAt: now });
      return;
    }
    await repository.insert({
      authCode: trimmed,
      createdAt: now,
    });
  }
}

export const licenseService = new LicenseService();

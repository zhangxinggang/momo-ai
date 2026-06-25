import fs from 'fs';
import path from 'path';

import ignore, { type Ignore } from 'ignore';

/** 工作区 gitignore 过滤器：读取工作区根目录 .gitignore 并叠加默认规则 */
export class WorkspaceIgnoreFilter {
  private ig: Ignore;

  constructor(workspaceRoot: string) {
    this.ig = ignore();
    this.ig.add(['.git/', 'node_modules/', '__pycache__/']);
    const gitignorePath = path.join(path.resolve(workspaceRoot), '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      try {
        this.ig.add(fs.readFileSync(gitignorePath, 'utf-8'));
      } catch {
        // 忽略不可读
      }
    }
  }

  /** relativePath 使用 posix 风格，目录建议带尾部 / */
  isIgnored(relativePath: string): boolean {
    const normalized = relativePath.replace(/\\/g, '/');
    return this.ig.ignores(normalized);
  }
}

export function createIgnoreFilter(workspaceRoot: string): WorkspaceIgnoreFilter {
  return new WorkspaceIgnoreFilter(workspaceRoot);
}

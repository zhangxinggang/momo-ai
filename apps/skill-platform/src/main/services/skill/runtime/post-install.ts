import { ensureSharpNativeBinary } from './sharp-native';
import { runNpxWithRetry } from './shell';

export interface IRuntimePostInstallContext {
  runtimeDir: string;
  nodeModulesDir: string;
  pathEnv: string;
  logs: string[];
}

type RuntimePostInstallRunner = (ctx: IRuntimePostInstallContext) => Promise<string | null>;

interface IRuntimePostInstallRule {
  packageName: string;
  run: RuntimePostInstallRunner;
}

/** 运行时依赖安装后的通用后置步骤（按包名注册，避免在业务代码中散落 includes 判断） */
const POST_INSTALL_RULES: IRuntimePostInstallRule[] = [
  {
    packageName: 'sharp',
    run: async (ctx) =>
      ensureSharpNativeBinary(ctx.runtimeDir, ctx.nodeModulesDir, ctx.pathEnv, ctx.logs),
  },
  {
    packageName: 'playwright',
    run: async (ctx) => {
      ctx.logs.push('正在安装 Playwright Chromium…');
      const browserResult = await runNpxWithRetry(
        'playwright install chromium',
        ctx.runtimeDir,
        ctx.pathEnv,
        ctx.logs,
        15 * 60 * 1000,
      );
      if (browserResult.exitCode !== 0) {
        return `Playwright 浏览器安装失败（退出码 ${browserResult.exitCode ?? 'unknown'}）`;
      }
      return null;
    },
  },
];

/** 对已安装的 npm 包执行注册的后置安装步骤 */
export async function runRuntimePostInstallHooks(
  packageList: string[],
  ctx: IRuntimePostInstallContext,
): Promise<string | null> {
  const installed = new Set(packageList);
  for (const rule of POST_INSTALL_RULES) {
    if (!installed.has(rule.packageName)) {
      continue;
    }
    const error = await rule.run(ctx);
    if (error) {
      return error;
    }
  }
  return null;
}

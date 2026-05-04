import type { TCallCliAgent } from '@momo/aichat';

/** 通过 Electron IPC 调用主进程 CLI Agent */
export function createCliAgentCaller(): TCallCliAgent {
  return async (input) => {
    const api = window.api?.aichat;
    if (!api?.callCliAgent) {
      throw new Error('当前环境不支持 CLI Agent');
    }
    return api.callCliAgent(input);
  };
}

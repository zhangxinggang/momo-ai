import type {
  DAgentAppContext,
  DAgentAppDetectInput,
  DAgentAppDetectResult,
  DAgentAppListSlashInput,
  DAgentAppListSlashResult,
  DAgentAppPrepareSubmitInput,
  DAgentAppPrepareSubmitResult,
} from '@/types/modules/agent-app';

function getAgentAppApi() {
  return window.api?.agentApp;
}

/** 探测文件夹下的 Agent 应用 */
export async function detectAgentApps(input: DAgentAppDetectInput): Promise<DAgentAppDetectResult> {
  const api = getAgentAppApi();
  if (!api?.detect) {
    return {
      requestKey: input.requestKey,
      folderPaths: input.folderPaths,
      items: [],
      errors: [],
    };
  }
  return api.detect(input);
}

/** 解析 Agent 应用对话上下文 */
export async function resolveAgentAppContext(input: {
  agentAppId: string;
  folderPaths: string[];
}): Promise<DAgentAppContext | null> {
  const api = getAgentAppApi();
  if (!api?.resolveContext) {
    return null;
  }
  return api.resolveContext(input);
}

/** 列出当前 Agent 的斜杠命令 */
export async function listAgentAppSlashCommands(
  input: DAgentAppListSlashInput,
): Promise<DAgentAppListSlashResult> {
  const api = getAgentAppApi();
  if (!api?.listSlash) {
    return { items: [] };
  }
  return api.listSlash(input);
}

/** 发送前：展开斜杠命令 + 声明式 hooks */
export async function prepareAgentAppSubmit(
  input: DAgentAppPrepareSubmitInput,
): Promise<DAgentAppPrepareSubmitResult> {
  const api = getAgentAppApi();
  if (!api?.prepareSubmit) {
    return {
      action: 'allow',
      content: input.content,
      displayContent: input.displayContent,
      invocation: input.invocation,
    };
  }
  return api.prepareSubmit(input);
}

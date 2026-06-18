export const SKILL_NAME_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function formatSkillTranslationError(error: unknown): string {
  const rawMessage = getErrorMessage(error);
  const normalized = rawMessage.toLowerCase();

  if (rawMessage === 'AI_NOT_CONFIGURED') {
    return '当前没有可用的 AI 翻译模型。请先在设置中配置可用的聊天模型，或修复当前选中的翻译模型配置。';
  }

  if (
    normalized.includes('(504)') ||
    normalized.includes(' 504') ||
    normalized.includes('gateway timeout') ||
    normalized.includes('网关超时')
  ) {
    return 'AI 翻译服务响应超时。请稍后重试，或切换到更快、更稳定的模型接口。';
  }

  if (
    normalized.includes('failed to fetch') ||
    normalized.includes('network request failed') ||
    normalized.includes('network timeout') ||
    normalized.includes('timed out') ||
    normalized.includes('timeout') ||
    normalized.includes('网络请求失败')
  ) {
    return '翻译请求无法连接到 AI 服务。请检查网络和 API 地址后重试。';
  }

  return `翻译失败: ${rawMessage}`;
}

import fs from 'node:fs';

// Standalone bundles carry a build-time snapshot from the app's builtIn catalog.
// Source execution reads the same catalog without requiring a generated bundle.
let builtinPolicies;
try {
  builtinPolicies = JSON.parse(fs.readFileSync(new URL('./builtin-policies.json', import.meta.url), 'utf8'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  const sourceRoot = new URL('../../../../apps/skill-platform/default/skills/builtIn/', import.meta.url);
  const manifest = JSON.parse(fs.readFileSync(new URL('manifest.json', sourceRoot), 'utf8'));
  builtinPolicies = Object.fromEntries(
    ['runtimeLanguage', 'runtimeContinue', 'runtimeAssistant', 'runtimePlan'].map(id => [id,
      fs.readFileSync(new URL(manifest[id], sourceRoot), 'utf8')
        .replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '').trim(),
    ]),
  );
}

export function builtinPolicy(id) {
  const text = builtinPolicies[id];
  if (typeof text !== 'string' || !text.trim()) throw Error('Missing builtin policy: ' + id);
  return text;
}

// Keep request policy at the native Harness configuration boundary.
export const CHINESE_OUTPUT = builtinPolicy('runtimeLanguage');
export const CONTINUE_AFTER_LIMIT = builtinPolicy('runtimeContinue');
const DEFAULT_MAX_TOKENS = 32768;
function isQwen(model) { return (model.apiProtocol ?? 'openai') === 'openai' && /qwen|dashscope/i.test(model.model + ' ' + (model.provider ?? '') + ' ' + model.apiUrl); }
export function providerProfile(model, api, envKey) {
  const qwen = isQwen(model);
  return {
    api, baseURL: model.apiUrl, apiKeyEnv: envKey,
    models: [{ id: model.model, input: ['text', 'image'],
      ...(qwen ? { reasoningEfforts: { off: null, medium: 'medium' }, compat: {
        thinkingFormat: 'qwen', supportsDeveloperRole: false, supportsReasoningEffort: false,
      } } : {}),
    }],
    defaultMaxTokens: DEFAULT_MAX_TOKENS,
    ...(qwen ? { reasoning: 'off' } : {}),
    retryPolicy: { mode: 'normal', maxRetries: 2 },
  };
}
export function requestConfig(config, run) {
  const params = run.model.chatParams ?? {};
  const temperature = run.temperature ?? params.temperature;
  return { ...config, maxTokens: params.maxTokens ?? DEFAULT_MAX_TOKENS,
    ...(temperature === undefined ? {} : { temperature }),
    ...(isQwen(run.model) ? { reasoningEffort: params.enableThinking ? 'medium' : 'off' } : {}),
  };
}
export function failurePayload(reason) {
  const kind = reason?.kind ?? 'error', failure = reason?.error ?? {};
  const code = failure.code, status = failure.status;
  let message;
  if (kind === 'max-tokens') message = '模型输出连续达到设置的最大 Token 数，答复尚未完成。已有工具结果已保存，可提高模型输出上限后继续。';
  else if (kind === 'blocked') message = '本轮执行被当前策略阻止，请检查权限和计划模式。';
  else if (kind === 'aborted') message = '本轮生成已中断，已有输出和工具结果已保留。';
  else if (status === 401 || status === 403 || /AUTH|CREDENTIAL|API_KEY/.test(code ?? '')) message = '模型服务认证失败，请检查所选模型的密钥和访问权限。';
  else if (status === 429 || /RATE_LIMIT/.test(code ?? '')) message = '模型服务请求过于频繁或额度不足，请稍后重试并检查额度。';
  else if (/CONTEXT|INPUT_TOO_LONG/.test(code ?? '')) message = '对话内容超过模型上下文上限，请压缩对话后重试。';
  else if (/TIMEOUT|NETWORK|CONNECTION/.test(code ?? '')) message = '模型服务连接失败或超时，请检查网络和接口地址后重试。';
  else if (status >= 500) message = '模型服务暂时不可用，请稍后重试。';
  else if (typeof failure.message === 'string' && /[\u3400-\u9fff]/.test(failure.message)) message = failure.message.slice(0, 500);
  else message = '模型生成未能完成，请检查模型配置或下载对话日志查看详细原因。';
  return { stopReason: kind, message, ...(code ? { errorCode: code } : {}), ...(status ? { status } : {}) };
}

// Translate framework-authored command confirmations; the native command/journal stays authoritative.
export function commandResultText(command, result, goal) {
  if (command === 'compact') {
    if (result.kind === 'error') return '对话压缩未能完成，请稍后重试；详细原因已记录在对话日志中。';
    const counts = result.text?.match(/^Compacted (\d+) history items \(~(\d+) tokens\)\./);
    return counts ? `已压缩 ${counts[1]} 条历史记录（约 ${counts[2]} Token）。` : '当前没有可压缩的历史记录。';
  }
  if (result.kind === 'error') return '目标操作无法完成，请输入 /goal 查看当前目标，或使用 /goal edit <目标> 修改目标。';
  if (!goal) return result.text === 'Goal cleared.' ? '目标已清除。' : '当前未设置目标。可输入 /goal <目标> 设置长期任务目标。';
  const title = { 'Goal created':'目标已设置', 'Goal updated':'目标已更新', 'Goal paused':'目标已暂停', 'Goal resumed':'目标已恢复', 'Goal':'当前目标' }[result.text?.split('\n')[0]] ?? '当前目标';
  const phase = { active:'进行中', paused:'已暂停', blocked:'等待处理', complete:'已完成' }[goal.phase] ?? '等待处理';
  return `${title}\n状态：${phase}\n目标：${goal.objective}\n执行轮数：${goal.roundsStarted}/${goal.maxGoalRounds}\n后续执行：${goal.activation === 'armed' ? '已启用' : '等待恢复'}${goal.phase === 'blocked' ? '\n目标遇到阻碍，请查看对话日志后补充信息并恢复。' : ''}`;
}

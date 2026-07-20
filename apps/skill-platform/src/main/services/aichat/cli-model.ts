import fs from 'fs';
import os from 'os';
import path from 'path';

/** 读取 Codex 配置中的默认模型（JSONL 暂不保证带 model 字段） */
export function resolveCodexConfiguredModel(): string | null {
  const codexHome = process.env.CODEX_HOME?.trim() || path.join(os.homedir(), '.codex');
  const configPath = path.join(codexHome, 'config.toml');

  try {
    const content = fs.readFileSync(configPath, 'utf8');
    // 只取顶层 model = "..."，避免误匹配 model_provider 等
    const match = content.match(/^\s*model\s*=\s*["']([^"']+)["']\s*$/m);
    const model = match?.[1]?.trim();
    return model || null;
  } catch {
    return null;
  }
}

interface IClaudeSettingsFile {
  env?: Record<string, string>;
  model?: string;
}

function readClaudeSettings(): IClaudeSettingsFile | null {
  const configHome = process.env.CLAUDE_CONFIG_DIR?.trim() || path.join(os.homedir(), '.claude');
  const configPath = path.join(configHome, 'settings.json');
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw) as IClaudeSettingsFile;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

/** 读取 Claude Code settings 中的 env，供 Electron 子进程继承鉴权与模型 */
export function resolveClaudeSettingsEnv(): Record<string, string> {
  const settings = readClaudeSettings();
  const env = settings?.env;
  if (!env || typeof env !== 'object') {
    return {};
  }

  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === 'string' && value.trim()) {
      result[key] = value;
    }
  }

  // 部分运行时只认 ANTHROPIC_API_KEY
  if (result.ANTHROPIC_AUTH_TOKEN && !result.ANTHROPIC_API_KEY) {
    result.ANTHROPIC_API_KEY = result.ANTHROPIC_AUTH_TOKEN;
  }

  return result;
}

/** 读取 Claude Code 当前默认模型名 */
export function resolveClaudeConfiguredModel(): string | null {
  const settings = readClaudeSettings();
  if (typeof settings?.model === 'string' && settings.model.trim()) {
    return settings.model.trim();
  }

  const env = {
    ...resolveClaudeSettingsEnv(),
    ...process.env,
  };

  const candidates = [
    env.ANTHROPIC_MODEL,
    env.ANTHROPIC_DEFAULT_SONNET_MODEL_NAME,
    env.ANTHROPIC_DEFAULT_SONNET_MODEL,
    env.ANTHROPIC_DEFAULT_OPUS_MODEL_NAME,
    env.ANTHROPIC_DEFAULT_OPUS_MODEL,
    env.ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME,
    env.ANTHROPIC_DEFAULT_HAIKU_MODEL,
  ];

  for (const item of candidates) {
    if (typeof item === 'string' && item.trim()) {
      return item.trim();
    }
  }

  return null;
}

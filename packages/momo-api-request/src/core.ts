import type {
  ApiRequestAuth,
  IApiKeyValue,
  IApiPreparedRequest,
  IApiRequestConfig,
  IApiRequestResponse,
} from './types';

export type * from './types';

export const MAX_API_RESPONSE_BYTES = 5 * 1024 * 1024;
const METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']);
const BODY_MODES = new Set(['none', 'json', 'text', 'form-urlencoded']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function assertText(value: unknown, label: string, maxLength = 32_768): asserts value is string {
  if (typeof value !== 'string' || value.length > maxLength) {
    throw new Error(`${label} 无效`);
  }
}

function assertKeyValues(value: unknown, label: string): asserts value is IApiKeyValue[] {
  if (!Array.isArray(value) || value.length > 200) throw new Error(`${label} 无效`);
  for (const item of value) {
    if (!isRecord(item)) throw new Error(`${label} 无效`);
    assertText(item.id, `${label} ID`, 200);
    assertText(item.key, `${label}名称`, 8_192);
    assertText(item.value, `${label}值`, 128 * 1024);
    if (typeof item.enabled !== 'boolean') throw new Error(`${label}启用状态无效`);
  }
}

/** Validate data crossing storage or IPC boundaries before it reaches the network stack. */
export function assertApiRequestConfig(config: unknown): asserts config is IApiRequestConfig {
  if (!isRecord(config)) throw new Error('接口请求配置无效');
  if (typeof config.method !== 'string' || !METHODS.has(config.method)) {
    throw new Error('请求方法无效');
  }
  assertText(config.url, '接口地址');
  assertKeyValues(config.query, '查询参数');
  assertKeyValues(config.headers, '请求头');
  if (
    !isRecord(config.body) ||
    typeof config.body.mode !== 'string' ||
    !BODY_MODES.has(config.body.mode)
  ) {
    throw new Error('请求 Body 配置无效');
  }
  assertText(config.body.content, '请求 Body', 2 * 1024 * 1024);
  if (
    typeof config.timeoutMs !== 'number' ||
    !Number.isFinite(config.timeoutMs) ||
    config.timeoutMs < 100 ||
    config.timeoutMs > 300_000
  ) {
    throw new Error('请求超时时间无效');
  }
  if (!isRecord(config.auth) || typeof config.auth.type !== 'string') {
    throw new Error('认证配置无效');
  }
  switch (config.auth.type) {
    case 'none':
      break;
    case 'bearer':
      assertText(config.auth.token, 'Bearer Token', 128 * 1024);
      break;
    case 'basic':
      assertText(config.auth.username, 'Basic 用户名', 8_192);
      assertText(config.auth.password, 'Basic 密码', 128 * 1024);
      break;
    case 'api-key':
      assertText(config.auth.key, 'API Key 名称', 8_192);
      assertText(config.auth.value, 'API Key 值', 128 * 1024);
      if (config.auth.placement !== 'header' && config.auth.placement !== 'query') {
        throw new Error('API Key 写入位置无效');
      }
      break;
    default:
      throw new Error('认证类型无效');
  }
}

export function createApiKeyValue(key = '', value = ''): IApiKeyValue {
  return { id: crypto.randomUUID(), key, value, enabled: true };
}

export function createApiRequestConfig(): IApiRequestConfig {
  return {
    method: 'GET',
    url: '',
    query: [],
    headers: [],
    auth: { type: 'none' },
    body: { mode: 'none', content: '' },
    timeoutMs: 30_000,
  };
}

function encodeBasicAuth(username: string, password: string): string {
  const bytes = new TextEncoder().encode(`${username}:${password}`);
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  for (let index = 0; index < bytes.length; index += 3) {
    const a = bytes[index] ?? 0;
    const b = bytes[index + 1] ?? 0;
    const c = bytes[index + 2] ?? 0;
    const combined = (a << 16) | (b << 8) | c;
    result += alphabet[(combined >> 18) & 63];
    result += alphabet[(combined >> 12) & 63];
    result += index + 1 < bytes.length ? alphabet[(combined >> 6) & 63] : '=';
    result += index + 2 < bytes.length ? alphabet[combined & 63] : '=';
  }
  return result;
}

function applyAuth(url: URL, headers: Headers, auth: ApiRequestAuth): void {
  if (auth.type === 'bearer' && auth.token.trim()) {
    headers.set('Authorization', `Bearer ${auth.token.trim()}`);
  } else if (auth.type === 'basic') {
    headers.set('Authorization', `Basic ${encodeBasicAuth(auth.username, auth.password)}`);
  } else if (auth.type === 'api-key' && auth.key.trim()) {
    if (auth.placement === 'query') url.searchParams.set(auth.key.trim(), auth.value);
    else headers.set(auth.key.trim(), auth.value);
  }
}

export function prepareApiRequest(config: IApiRequestConfig): IApiPreparedRequest {
  assertApiRequestConfig(config);
  const rawUrl = config.url.trim();
  if (!rawUrl) throw new Error('请输入接口地址');
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error('接口地址格式无效');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('仅支持 HTTP 和 HTTPS 接口');
  }
  if (url.username || url.password) {
    throw new Error('请在 Authorization 中配置认证信息，不要写入 URL');
  }

  for (const item of config.query) {
    if (item.enabled && item.key.trim()) url.searchParams.append(item.key.trim(), item.value);
  }
  const headers = new Headers();
  for (const item of config.headers) {
    if (item.enabled && item.key.trim()) headers.append(item.key.trim(), item.value);
  }
  applyAuth(url, headers, config.auth);

  let body: BodyInit | undefined;
  if (!['GET', 'HEAD'].includes(config.method) && config.body.mode !== 'none') {
    if (config.body.mode === 'json') {
      const content = config.body.content.trim() || '{}';
      try {
        JSON.parse(content);
      } catch {
        throw new Error('请求 Body 不是有效 JSON');
      }
      if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
      body = content;
    } else if (config.body.mode === 'form-urlencoded') {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
      }
      body = config.body.content;
    } else {
      if (!headers.has('Content-Type')) headers.set('Content-Type', 'text/plain;charset=UTF-8');
      body = config.body.content;
    }
  }

  return {
    url: url.toString(),
    init: { method: config.method, headers, body, redirect: 'follow' },
  };
}

async function readResponseBody(
  response: Response,
  limit: number,
): Promise<{ body: string; sizeBytes: number; truncated: boolean }> {
  if (!response.body) return { body: '', sizeBytes: 0, truncated: false };
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let body = '';
  let sizeBytes = 0;
  let truncated = false;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      sizeBytes += chunk.value.byteLength;
      const remaining = Math.max(0, limit - (sizeBytes - chunk.value.byteLength));
      if (remaining > 0) body += decoder.decode(chunk.value.slice(0, remaining), { stream: true });
      if (sizeBytes > limit) {
        truncated = true;
        await reader.cancel();
        break;
      }
    }
    body += decoder.decode();
  } finally {
    reader.releaseLock();
  }
  return { body, sizeBytes, truncated };
}

export async function executeApiRequest(
  config: IApiRequestConfig,
  fetcher: typeof fetch = fetch,
  maxResponseBytes = MAX_API_RESPONSE_BYTES,
): Promise<IApiRequestResponse> {
  const prepared = prepareApiRequest(config);
  const controller = new AbortController();
  const timeoutMs = Math.max(100, Math.min(300_000, config.timeoutMs || 30_000));
  const timer = setTimeout(() => controller.abort(new Error(`请求超过 ${timeoutMs}ms`)), timeoutMs);
  const startedAt = performance.now();
  try {
    const response = await fetcher(prepared.url, { ...prepared.init, signal: controller.signal });
    const payload = await readResponseBody(response, maxResponseBytes);
    return {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url || prepared.url,
      headers: Object.fromEntries(response.headers.entries()),
      body: payload.body,
      durationMs: Math.round(performance.now() - startedAt),
      sizeBytes: payload.sizeBytes,
      truncated: payload.truncated,
    };
  } catch (error) {
    if (controller.signal.aborted) throw new Error(`请求超时（${timeoutMs}ms）`);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export function parseApiResponseBody(response: IApiRequestResponse): unknown {
  const contentType = response.headers['content-type'] ?? '';
  if (!contentType.includes('json') && !/^\s*[\[{]/.test(response.body)) return response.body;
  try {
    return JSON.parse(response.body);
  } catch {
    return response.body;
  }
}

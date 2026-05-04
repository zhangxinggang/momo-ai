import type { EAIProtocol } from '@/types/modules';

import { createResponseLike, getAITransport } from './internal/transport';
import {
  buildHeadersForProtocol,
  buildModelsEndpointFromBase,
  resolveAIProtocol,
  resolveProtocolBase,
} from './protocol';
import type { IFetchModelsResult, IModelInfo } from './types';

export async function fetchAvailableModels(
  apiUrl: string,
  apiKey: string,
  apiProtocol: EAIProtocol = 'openai',
): Promise<IFetchModelsResult> {
  if (!apiKey || !apiUrl) {
    return {
      success: false,
      models: [],
      error: 'Please fill in API Key and API URL first',
    };
    // 请先填写 API Key 和 API 地址
  }

  try {
    const endpoint = buildModelsEndpointFromBase(resolveProtocolBase(apiUrl, apiProtocol));
    const resolvedProtocol = resolveAIProtocol({
      apiProtocol,
      provider: '',
      apiUrl,
    });
    const headers = buildHeadersForProtocol(resolvedProtocol, apiKey, {
      accept: 'application/json',
      useNativeGeminiAuth: resolvedProtocol === 'gemini',
      apiUrl,
    });

    const transport = getAITransport();
    const response = transport
      ? createResponseLike(
          await transport.request({
            method: 'GET',
            url: endpoint,
            headers,
          }),
        )
      : await fetch(endpoint, {
          method: 'GET',
          headers,
        });

    if (!response.ok) {
      const errorText = await response.text();
      const reason =
        response.status === 401 || response.status === 403
          ? 'auth'
          : response.status === 404 || response.status === 405 || response.status === 501
            ? 'unsupported'
            : 'http';
      return {
        success: false,
        models: [],
        error: `获取模型列表失败: ${response.status} - ${errorText.substring(0, 100)}`,
        reason,
        endpoint,
        status: response.status,
        // Failed to get model list
      };
    }

    const data = await response.json();

    if (data.data && Array.isArray(data.data) && apiProtocol === 'anthropic') {
      const models = data.data
        .filter((m: { id?: string }) => typeof m.id === 'string')
        .map((m: { id: string; display_name?: string; created_at?: string }) => ({
          id: m.id,
          name: m.display_name || m.id,
          owned_by: 'Anthropic',
          created: m.created_at ? Date.parse(m.created_at) : undefined,
        }))
        .sort((a: IModelInfo, b: IModelInfo) => a.id.localeCompare(b.id));

      return { success: true, models };
    }

    // OpenAI 格式的响应
    // OpenAI format response
    if (data.data && Array.isArray(data.data)) {
      const models = data.data
        .filter((m: { id?: string }) => m.id) // 过滤掉没有 id 的 / Filter out those without id
        .map((m: { id: string; owned_by?: string; created?: number }) => ({
          id: m.id,
          name: m.id,
          owned_by: m.owned_by,
          created: m.created,
        }))
        .sort((a: IModelInfo, b: IModelInfo) => a.id.localeCompare(b.id));

      return { success: true, models };
    }

    // Gemini 格式的响应 / Gemini format response
    if (data.models && Array.isArray(data.models)) {
      const models = data.models
        .filter((m: { name?: string }) => m.name)
        .map((m: { name: string; displayName?: string; description?: string }) => {
          // Gemini returns "models/gemini-pro", we need "gemini-pro" for OpenAI compatible endpoint
          const id = m.name.replace(/^models\//, '');
          return {
            id: id,
            name: m.displayName ? `${m.displayName} (${id})` : id,
            owned_by: 'Google',
            description: m.description,
          };
        })
        .sort((a: IModelInfo, b: IModelInfo) => a.id.localeCompare(b.id));

      return { success: true, models };
    }

    // 某些 API 直接返回数组
    // Some APIs return array directly
    if (Array.isArray(data)) {
      const models = data
        .filter((m: { id?: string; model?: string }) => m.id || m.model)
        .map((m: { id?: string; model?: string; name?: string }) => ({
          id: m.id || m.model || '',
          name: m.name || m.id || m.model,
        }));
      return { success: true, models };
    }

    return {
      success: false,
      models: [],
      error: '无法解析模型列表响应',
      reason: 'unsupported',
      endpoint,
    };
    // Cannot parse model list response
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取模型列表失败';
    return {
      success: false,
      models: [],
      error: message,
      reason:
        message.toLowerCase().includes('failed to fetch') ||
        message.toLowerCase().includes('network')
          ? 'network'
          : 'http',
      // Failed to get model list
    };
  }
}

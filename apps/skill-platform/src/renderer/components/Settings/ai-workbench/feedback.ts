import type { IFetchModelsResult } from '@renderer/services/ai';

export function getConnectionErrorMessage(message: string, apiUrl?: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes('failed to fetch') || normalized.includes('networkerror')) {
    try {
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      const targetOrigin = apiUrl ? new URL(apiUrl).origin : '';
      if (
        currentOrigin &&
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(currentOrigin) &&
        targetOrigin
      ) {
        return `浏览器把这次跨域请求（CORS）拦截了。当前页面 ${currentOrigin} 不能直接请求 ${targetOrigin}。请在服务端放开 CORS，或者把这条请求改走 Electron 主进程代理。`;
      }
      if (targetOrigin) {
        return `浏览器把这次跨域请求（CORS）拦截了，目标接口是 ${targetOrigin}。请在服务端放开 CORS，或者改走应用侧代理。`;
      }
    } catch {
      // 使用通用网络错误文案
    }
    return '请求还没到供应商就失败了，请检查 API 地址、网络、代理或 CORS 限制。';
  }
  if (
    normalized.includes('401') ||
    normalized.includes('403') ||
    normalized.includes('unauthorized') ||
    normalized.includes('invalid api key')
  ) {
    return '供应商拒绝了这次请求，请检查 API Key、账号权限和 endpoint 路径。';
  }
  return message;
}

export function getFetchModelsFeedback(
  result: IFetchModelsResult,
  apiUrl?: string,
): { message: string; type: 'error' | 'warning' | 'info' } {
  if (result.success && result.models.length === 0) {
    return {
      message: '供应商没有返回任何模型。如果它隐藏了列表接口，可以直接手动填写模型 ID。',
      type: 'warning',
    };
  }

  switch (result.reason) {
    case 'auth':
      return {
        message: '模型列表请求被拒绝，请检查 API Key 和供应商权限设置。',
        type: 'error',
      };
    case 'unsupported':
    case 'parse':
      return {
        message: '这个供应商没有返回兼容的模型列表接口，你仍然可以直接手动填写模型 ID。',
        type: 'info',
      };
    case 'network':
      return {
        message: getConnectionErrorMessage(
          result.error || '无法连接到模型列表接口，请检查 API 地址、网络、代理或 CORS 限制。',
          result.endpoint || apiUrl,
        ),
        type: 'warning',
      };
    default:
      return {
        message: result.error || '拉取模型列表失败',
        type: 'error',
      };
  }
}

export function formatModelTestSuccessToast(
  modelName: string,
  latency: number,
  extra?: string,
): string {
  return `${modelName} 测试成功 (${latency}ms)${extra ?? ''}`;
}

export function formatModelTestFailureToast(
  modelName: string,
  message: string,
  apiUrl?: string,
): string {
  return `${modelName} 测试失败: ${getConnectionErrorMessage(message, apiUrl)}`;
}

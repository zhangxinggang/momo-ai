import { useMemo } from 'react';

import type { EAIProtocol } from '@/types/modules';
import { getProviderInfo } from '@renderer/components/Settings/ai-workbench/helpers';
import {
  getApiEndpointPreview,
  getBaseUrl,
  getImageApiEndpointPreview,
  normalizeApiUrlInput,
} from '@renderer/services/ai';
import type { EModelType } from '@renderer/types/ai-workbench';

interface IProps {
  apiUrl: string;
  apiProtocol: EAIProtocol;
  provider: string;
  modelType?: EModelType;
}

export function ApiUrlHintPanel({ apiUrl, apiProtocol, provider, modelType = 'chat' }: IProps) {
  const trimmedApiUrl = apiUrl.trim();
  const normalizedInput = useMemo(() => normalizeApiUrlInput(apiUrl), [apiUrl]);
  const baseUrlPreview = useMemo(() => getBaseUrl(apiUrl), [apiUrl]);
  const requestPreview = useMemo(
    () =>
      modelType === 'image'
        ? getImageApiEndpointPreview(apiUrl)
        : getApiEndpointPreview(apiUrl, apiProtocol),
    [apiProtocol, apiUrl, modelType],
  );
  const fullEndpointDetected = Boolean(
    trimmedApiUrl &&
    !trimmedApiUrl.endsWith('#') &&
    baseUrlPreview &&
    baseUrlPreview !== trimmedApiUrl.replace(/\/$/, ''),
  );
  const providerExamples = useMemo(() => {
    if (apiProtocol === 'gemini') {
      return [
        'https://generativelanguage.googleapis.com',
        'https://generativelanguage.googleapis.com/v1beta',
      ];
    }

    if (apiProtocol === 'anthropic') {
      return ['https://api.anthropic.com', 'https://api.anthropic.com/v1'];
    }

    const providerInfo = getProviderInfo(provider);
    return [
      providerInfo?.defaultUrl || 'https://api.openai.com',
      'https://api.example.com/v1',
    ].filter(Boolean);
  }, [apiProtocol, provider]);

  return (
    <div className='border-border/60 bg-muted/20 mt-2 space-y-2 rounded-lg border p-3 text-xs'>
      <div className='text-muted-foreground'>
        {
          '这里只填供应商基础地址或版本根路径即可，不用手动补 /chat/completions 或 /images/generations，PromptHub 会自动补全。'
        }
      </div>
      <div className='text-muted-foreground'>
        <span className='text-foreground font-medium'>{'示例'}:</span>{' '}
        <span className='font-mono'>{providerExamples.join('  ·  ')}</span>
      </div>
      {baseUrlPreview ? (
        <div className='text-muted-foreground flex flex-col gap-1'>
          <span className='text-foreground font-medium'>{'保存后的 Base URL'}:</span>
          <span className='text-primary break-all font-mono'>{baseUrlPreview}</span>
        </div>
      ) : null}
      {requestPreview ? (
        <div className='text-muted-foreground flex flex-col gap-1'>
          <span className='text-foreground font-medium'>{'实际请求地址预览'}:</span>
          <span className='text-primary break-all font-mono'>{requestPreview}</span>
        </div>
      ) : null}
      {trimmedApiUrl.endsWith('#') ? (
        <div className='inline-flex w-fit rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[11px] text-amber-600 dark:text-amber-400'>
          {'已禁用自动填充 (#)'}
        </div>
      ) : null}
      {fullEndpointDetected || normalizedInput !== trimmedApiUrl ? (
        <div className='text-[11px] text-amber-600 dark:text-amber-400'>
          {'检测到你粘贴了完整 endpoint，失焦或保存时会自动收敛为基础地址。'}
        </div>
      ) : null}
    </div>
  );
}

import { useMemo, type Dispatch, type SetStateAction } from 'react';

import { PROVIDER_OPTIONS } from '@renderer/components/Settings/AiWorkbench/constants';
import {
  getProtocolLabel,
  getProviderInfo,
} from '@renderer/components/Settings/AiWorkbench/helpers';
import { groupedSelectOptions } from '@renderer/components/Settings/AiWorkbench/shared-ui';
import { PasswordInput } from '@renderer/components/Settings/setting-primitives';
import {
  getApiEndpointPreview,
  getBaseUrl,
  getImageApiEndpointPreview,
  normalizeApiUrlInput,
} from '@renderer/services/ai';
import type { EModelType, IModelFormState } from '@renderer/types/ai-workbench';
import { Button, Input, Select } from 'antd';
import { Loader2Icon, SparklesIcon } from 'lucide-react';

export function BaseFields({
  modelForm,
  setModelForm,
  fetchingModels,
  onFetchModels,
}: {
  modelForm: IModelFormState;
  setModelForm: Dispatch<SetStateAction<IModelFormState>>;
  fetchingModels: boolean;
  onFetchModels: () => void;
}) {
  const trimmedApiUrl = modelForm.apiUrl.trim();
  const normalizedInput = useMemo(() => normalizeApiUrlInput(modelForm.apiUrl), [modelForm.apiUrl]);
  const baseUrlPreview = useMemo(() => getBaseUrl(modelForm.apiUrl), [modelForm.apiUrl]);
  const requestPreview = useMemo(
    () =>
      modelForm.type === 'image'
        ? getImageApiEndpointPreview(modelForm.apiUrl)
        : getApiEndpointPreview(modelForm.apiUrl, modelForm.apiProtocol),
    [modelForm.apiProtocol, modelForm.apiUrl, modelForm.type],
  );
  const fullEndpointDetected = Boolean(
    trimmedApiUrl &&
    !trimmedApiUrl.endsWith('#') &&
    baseUrlPreview &&
    baseUrlPreview !== trimmedApiUrl.replace(/\/$/, ''),
  );
  const providerExamples = useMemo(() => {
    if (modelForm.apiProtocol === 'gemini') {
      return [
        'https://generativelanguage.googleapis.com',
        'https://generativelanguage.googleapis.com/v1beta',
      ];
    }

    if (modelForm.apiProtocol === 'anthropic') {
      return ['https://api.anthropic.com', 'https://api.anthropic.com/v1'];
    }

    const provider = getProviderInfo(modelForm.provider);
    return [provider?.defaultUrl || 'https://api.openai.com', 'https://api.example.com/v1'].filter(
      Boolean,
    );
  }, [modelForm.apiProtocol, modelForm.provider]);

  return (
    <>
      <div className='grid gap-4 md:grid-cols-2'>
        <div>
          <label className='text-muted-foreground mb-1 block text-xs'>{'模型类型'}</label>
          <Select
            className='w-full'
            value={modelForm.type}
            onChange={(value) =>
              setModelForm((prev) => ({
                ...prev,
                type: value as EModelType,
              }))
            }
            options={[
              { value: 'chat', label: '对话模型' },
              { value: 'image', label: '图像模型' },
            ]}
          />
        </div>
        <div>
          <label className='text-muted-foreground mb-1 block text-xs'>{'自定义名称（可选）'}</label>
          <Input
            value={modelForm.name}
            onChange={(event) => setModelForm((prev) => ({ ...prev, name: event.target.value }))}
            aria-label={'自定义名称（可选）'}
            placeholder={'例如：我的 GPT-4o、工作用'}
            className='bg-muted h-10 w-full rounded-lg px-3 text-sm'
          />
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <div>
          <label className='text-muted-foreground mb-1 block text-xs'>{'供应商'}</label>
          <Select
            className='w-full'
            value={modelForm.provider}
            onChange={(value) => {
              const provider = getProviderInfo(value);
              setModelForm((prev) => ({
                ...prev,
                provider: value,
                apiProtocol: provider?.recommendedProtocol || prev.apiProtocol,
                apiUrl: provider?.defaultUrl || prev.apiUrl,
              }));
            }}
            options={groupedSelectOptions(
              PROVIDER_OPTIONS.map((item) => ({
                value: item.id,
                label: item.name,
                group: item.group,
              })),
            )}
          />
        </div>
        <div>
          <label className='text-muted-foreground mb-1 block text-xs'>{'协议'}</label>
          <Select
            className='w-full'
            value={modelForm.apiProtocol}
            onChange={(value) =>
              setModelForm((prev) => ({
                ...prev,
                apiProtocol: value as IModelFormState['apiProtocol'],
              }))
            }
            options={[
              { value: 'openai', label: getProtocolLabel('openai') },
              { value: 'gemini', label: getProtocolLabel('gemini') },
              { value: 'anthropic', label: getProtocolLabel('anthropic') },
            ]}
          />
        </div>
        <div>
          <label className='text-muted-foreground mb-1 block text-xs'>{'API Key'}</label>
          <PasswordInput
            value={modelForm.apiKey}
            placeholder={'输入 API Key'}
            onChange={(value) => setModelForm((prev) => ({ ...prev, apiKey: value }))}
          />
        </div>
      </div>

      <div>
        <label className='text-muted-foreground mb-1 block text-xs'>{'API 地址'}</label>
        <Input
          value={modelForm.apiUrl}
          onChange={(event) => setModelForm((prev) => ({ ...prev, apiUrl: event.target.value }))}
          onBlur={() =>
            setModelForm((prev) => {
              const nextApiUrl = normalizeApiUrlInput(prev.apiUrl);
              return nextApiUrl === prev.apiUrl ? prev : { ...prev, apiUrl: nextApiUrl };
            })
          }
          aria-label={'API 地址'}
          placeholder={'https://api.example.com/v1'}
          className='bg-muted h-10 w-full rounded-lg px-3 text-sm'
        />
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
      </div>

      <div>
        <div className='text-muted-foreground mb-1 flex items-center justify-between text-xs'>
          <span>{'模型名称'}</span>
          <Button
            type='text'
            size='small'
            onClick={onFetchModels}
            disabled={fetchingModels}
            className='text-primary hover:bg-primary/10 inline-flex items-center gap-1 rounded-md px-2 py-1 disabled:opacity-50'>
            {fetchingModels ? (
              <Loader2Icon className='h-3.5 w-3.5 animate-spin' />
            ) : (
              <SparklesIcon className='h-3.5 w-3.5' />
            )}
            {'获取模型'}
          </Button>
        </div>
        <Input
          value={modelForm.model}
          onChange={(event) => setModelForm((prev) => ({ ...prev, model: event.target.value }))}
          aria-label={'模型名称'}
          placeholder={'例如：gpt-4o、deepseek-chat'}
          className='bg-muted h-10 w-full rounded-lg px-3 text-sm'
        />
      </div>
    </>
  );
}

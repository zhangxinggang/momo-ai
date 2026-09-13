import type { Dispatch, SetStateAction } from 'react';

import { ApiUrlHintPanel } from '@renderer/components/Settings/ai-workbench/ApiUrlHintPanel';
import { PROVIDER_OPTIONS } from '@renderer/components/Settings/ai-workbench/constants';
import {
  getProtocolLabel,
  getProviderInfo,
} from '@renderer/components/Settings/ai-workbench/helpers';
import { groupedSelectOptions } from '@renderer/components/Settings/ai-workbench/shared-ui';
import { PasswordInput } from '@renderer/components/Settings/SettingPrimitives';
import { normalizeApiUrlInput } from '@renderer/services/ai';
import type { EModelType, IModelFormState } from '@renderer/types/ai-workbench';
import { Button, Input, Select } from 'antd';
import { Loader2Icon, SparklesIcon } from 'lucide-react';

export function BaseFields({
  modelForm,
  setModelForm,
  fetchingModels,
  onFetchModels,
  isEditing = false,
}: {
  modelForm: IModelFormState;
  setModelForm: Dispatch<SetStateAction<IModelFormState>>;
  fetchingModels: boolean;
  onFetchModels: () => void;
  isEditing?: boolean;
}) {
  return (
    <>
      <div className={isEditing ? 'grid gap-4 md:grid-cols-2' : undefined}>
        <div>
          <label className='text-muted-foreground mb-1 block text-xs'>{'模型类型'}</label>
          <Select
            className='w-full'
            size='middle'
            value={modelForm.type}
            onChange={(value) =>
              setModelForm((prev) => ({
                ...prev,
                type: value as EModelType,
                apiProtocol: value === 'embedding' ? 'openai' : prev.apiProtocol,
              }))
            }
            options={[
              { value: 'chat', label: '对话模型' },
              { value: 'embedding', label: '嵌入模型（知识库）' },
              { value: 'image', label: '图像模型' },
            ]}
          />
        </div>
        {isEditing ? (
          <div>
            <label className='text-muted-foreground mb-1 block text-xs'>
              {'自定义名称（可选）'}
            </label>
            <Input
              size='middle'
              value={modelForm.name}
              onChange={(event) => setModelForm((prev) => ({ ...prev, name: event.target.value }))}
              aria-label={'自定义名称（可选）'}
              placeholder={'例如：我的 GPT-4o、工作用'}
              className='bg-muted w-full rounded-lg text-sm'
            />
          </div>
        ) : null}
      </div>

      {isEditing ? null : (
        <>
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
                    apiProtocol:
                      prev.type === 'embedding'
                        ? 'openai'
                        : provider?.recommendedProtocol || prev.apiProtocol,
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
                disabled={modelForm.type === 'embedding'}
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
              onChange={(event) =>
                setModelForm((prev) => ({ ...prev, apiUrl: event.target.value }))
              }
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
            {modelForm.type === 'embedding' ? (
              <ApiUrlHintPanel
                apiUrl={modelForm.apiUrl}
                apiProtocol='openai'
                provider={modelForm.provider}
                model={modelForm.model}
                modelType='embedding'
              />
            ) : null}
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
              placeholder={
                modelForm.type === 'embedding'
                  ? '例如：text-embedding-3-small、bge-m3'
                  : '例如：gpt-4o、deepseek-chat'
              }
              className='bg-muted h-10 w-full rounded-lg px-3 text-sm'
            />
            {modelForm.type === 'embedding' ? (
              <div className='mt-1.5 text-xs text-amber-600 dark:text-amber-400'>
                {'嵌入模型与“文本切分”对话模型用途不同；知识库入库必须配置此类型。'}
              </div>
            ) : null}
          </div>
        </>
      )}
    </>
  );
}

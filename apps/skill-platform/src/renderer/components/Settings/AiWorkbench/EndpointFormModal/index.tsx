import type { Dispatch, SetStateAction } from 'react';

import { PROVIDER_OPTIONS } from '@renderer/components/Settings/AiWorkbench/constants';
import {
  getProtocolLabel,
  getProviderInfo,
} from '@renderer/components/Settings/AiWorkbench/helpers';
import { groupedSelectOptions } from '@renderer/components/Settings/AiWorkbench/shared-ui';
import { PasswordInput } from '@renderer/components/Settings/setting-primitives';
import type { IEndpointDraft } from '@renderer/types/ai-workbench';
import { Button, Input, Modal, Select } from 'antd';

export function EndpointFormModal({
  endpointDraft,
  setEndpointDraft,
  onClose,
  onSave,
}: {
  endpointDraft: IEndpointDraft;
  setEndpointDraft: Dispatch<SetStateAction<IEndpointDraft | null>>;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnClose
      title={
        <div>
          <div>{'编辑端点'}</div>
          <div className='text-muted-foreground mt-1 text-xs font-normal'>
            {'会把该端点下所有模型的 provider / API Key / API 地址一并更新。'}
          </div>
        </div>
      }>
      <div className='space-y-4'>
        <div>
          <label className='text-muted-foreground mb-1 block text-xs'>{'供应商'}</label>
          <Select
            className='w-full'
            value={endpointDraft.provider}
            onChange={(value) => {
              const provider = getProviderInfo(value);
              setEndpointDraft((prev) =>
                prev
                  ? {
                      ...prev,
                      provider: value,
                      apiProtocol: provider?.recommendedProtocol || prev.apiProtocol,
                      apiUrl: provider?.defaultUrl || prev.apiUrl,
                    }
                  : prev,
              );
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
            value={endpointDraft.apiProtocol}
            onChange={(value) =>
              setEndpointDraft((prev) =>
                prev ? { ...prev, apiProtocol: value as IEndpointDraft['apiProtocol'] } : prev,
              )
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
            value={endpointDraft.apiKey}
            placeholder={'输入 API Key'}
            onChange={(value) =>
              setEndpointDraft((prev) => (prev ? { ...prev, apiKey: value } : prev))
            }
          />
        </div>
        <div>
          <label className='text-muted-foreground mb-1 block text-xs'>{'API 地址'}</label>
          <Input
            value={endpointDraft.apiUrl}
            onChange={(event) =>
              setEndpointDraft((prev) => (prev ? { ...prev, apiUrl: event.target.value } : prev))
            }
            aria-label={'API 地址'}
            className='bg-muted h-10 w-full rounded-lg px-3 text-sm'
          />
        </div>
        <div className='border-border flex justify-end gap-2 border-t pt-4'>
          <Button onClick={onClose}>{'取消'}</Button>
          <Button type='primary' onClick={onSave}>
            {'保存修改'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

import { useMemo, type Dispatch, type SetStateAction } from 'react';

import type { IModelFormState } from '@renderer/types/ai-workbench';
import { InputNumber } from 'antd';

export function SamplingFields({
  modelForm,
  setModelForm,
}: {
  modelForm: IModelFormState;
  setModelForm: Dispatch<SetStateAction<IModelFormState>>;
}) {
  const fieldClassName = useMemo(
    () => 'border-border bg-background h-10 w-full rounded-lg border px-3 text-sm',
    [],
  );

  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <div>
        <label className='text-muted-foreground mb-1 block text-xs'>{'温度 (Temperature)'}</label>
        <InputNumber
          min={0}
          max={2}
          step={0.1}
          className='w-full'
          value={modelForm.chatParams.temperature}
          onChange={(value) =>
            setModelForm((prev) => ({
              ...prev,
              chatParams: {
                ...prev.chatParams,
                temperature: Number(value ?? prev.chatParams.temperature),
              },
            }))
          }
        />
      </div>
      <div>
        <label className='text-muted-foreground mb-1 block text-xs'>{'最大 Token 数'}</label>
        <InputNumber
          min={1}
          step={1}
          className='w-full'
          value={modelForm.chatParams.maxTokens}
          onChange={(value) =>
            setModelForm((prev) => ({
              ...prev,
              chatParams: {
                ...prev.chatParams,
                maxTokens: Number(value ?? prev.chatParams.maxTokens),
              },
            }))
          }
        />
      </div>
      <div>
        <label className='text-muted-foreground mb-1 block text-xs'>{'Top P'}</label>
        <InputNumber
          min={0}
          max={1}
          step={0.01}
          className='w-full'
          value={modelForm.chatParams.topP}
          onChange={(value) =>
            setModelForm((prev) => ({
              ...prev,
              chatParams: {
                ...prev.chatParams,
                topP: Number(value ?? prev.chatParams.topP),
              },
            }))
          }
        />
      </div>
      <div>
        <label className='text-muted-foreground mb-1 block text-xs'>{'Top K'}</label>
        <input
          type='number'
          min={1}
          step={1}
          value={modelForm.chatParams.topK}
          onChange={(event) =>
            setModelForm((prev) => ({
              ...prev,
              chatParams: {
                ...prev.chatParams,
                topK: event.target.value,
              },
            }))
          }
          className={fieldClassName}
        />
      </div>
      <div>
        <label className='text-muted-foreground mb-1 block text-xs'>{'频率惩罚'}</label>
        <InputNumber
          min={-2}
          max={2}
          step={0.1}
          className='w-full'
          value={modelForm.chatParams.frequencyPenalty}
          onChange={(value) =>
            setModelForm((prev) => ({
              ...prev,
              chatParams: {
                ...prev.chatParams,
                frequencyPenalty: Number(value ?? prev.chatParams.frequencyPenalty),
              },
            }))
          }
        />
      </div>
      <div>
        <label className='text-muted-foreground mb-1 block text-xs'>{'存在惩罚'}</label>
        <InputNumber
          min={-2}
          max={2}
          step={0.1}
          className='w-full'
          value={modelForm.chatParams.presencePenalty}
          onChange={(value) =>
            setModelForm((prev) => ({
              ...prev,
              chatParams: {
                ...prev.chatParams,
                presencePenalty: Number(value ?? prev.chatParams.presencePenalty),
              },
            }))
          }
        />
      </div>
    </div>
  );
}

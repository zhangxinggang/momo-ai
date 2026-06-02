import type { Dispatch, SetStateAction } from 'react';

import type { IModelFormState } from '@renderer/types/ai-workbench';

import { CustomParamsField } from '../chat-params/CustomParamsField';
import { SamplingFields } from '../chat-params/SamplingFields';
import { ToggleFields } from '../chat-params/ToggleFields';

export function ChatParamsSection({
  modelForm,
  setModelForm,
}: {
  modelForm: IModelFormState;
  setModelForm: Dispatch<SetStateAction<IModelFormState>>;
}) {
  return (
    <div className='border-border mt-4 rounded-xl border p-4'>
      <div className='mb-3 text-sm font-medium'>{'对话参数'}</div>
      <SamplingFields modelForm={modelForm} setModelForm={setModelForm} />
      <ToggleFields modelForm={modelForm} setModelForm={setModelForm} />
      <CustomParamsField modelForm={modelForm} setModelForm={setModelForm} />
    </div>
  );
}

import type { Dispatch, SetStateAction } from 'react';

import type { IModelFormState } from '@renderer/types/ai-workbench';
import { Input } from 'antd';

const { TextArea } = Input;

export function CustomParamsField({
  modelForm,
  setModelForm,
}: {
  modelForm: IModelFormState;
  setModelForm: Dispatch<SetStateAction<IModelFormState>>;
}) {
  return (
    <div className='mt-4'>
      <label className='text-muted-foreground mb-1 block text-xs'>{'自定义参数 (JSON)'}</label>
      <TextArea
        value={modelForm.chatParams.customParamsText}
        onChange={(event) =>
          setModelForm((prev) => ({
            ...prev,
            chatParams: {
              ...prev.chatParams,
              customParamsText: event.target.value,
            },
          }))
        }
        placeholder='{"max_completion_tokens": 4096, "reasoning_effort": "medium"}'
        rows={4}
        className='text-sm'
      />
      <div className='text-muted-foreground mt-1 text-[11px]'>
        {'可选 JSON 对象，会合并进 API 请求体（需符合当前协议）。'}
      </div>
    </div>
  );
}

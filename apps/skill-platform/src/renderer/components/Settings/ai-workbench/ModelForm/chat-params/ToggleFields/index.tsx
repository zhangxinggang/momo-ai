import type { Dispatch, SetStateAction } from 'react';

import type { IModelFormState } from '@renderer/types/ai-workbench';
import { Checkbox } from 'antd';

export function ToggleFields({
  modelForm,
  setModelForm,
}: {
  modelForm: IModelFormState;
  setModelForm: Dispatch<SetStateAction<IModelFormState>>;
}) {
  const streamDisabled = modelForm.apiProtocol === 'anthropic';

  return (
    <div className='mt-4 grid gap-4 md:grid-cols-2'>
      <div className='border-border bg-background flex items-center gap-3 rounded-lg border px-3 py-2 text-sm'>
        <Checkbox
          checked={modelForm.chatParams.stream}
          disabled={streamDisabled}
          onChange={(event) =>
            setModelForm((prev) => ({
              ...prev,
              chatParams: {
                ...prev.chatParams,
                stream: event.target.checked,
              },
            }))
          }>
          {streamDisabled ? '流式输出（Anthropic 协议暂不支持）' : '流式输出'}
        </Checkbox>
      </div>
      <div className='border-border bg-background flex items-center gap-3 rounded-lg border px-3 py-2 text-sm'>
        <Checkbox
          checked={modelForm.chatParams.enableThinking}
          onChange={(event) =>
            setModelForm((prev) => ({
              ...prev,
              chatParams: {
                ...prev.chatParams,
                enableThinking: event.target.checked,
              },
            }))
          }>
          {'开启思考模式'}
        </Checkbox>
      </div>
    </div>
  );
}

import type { ReactNode } from 'react';

import { ModelSelect } from '@renderer/components/ui/ModelSelect';
import type { IAIModelConfig } from '@renderer/types/settings';

export interface IModelSelectRenderProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  variant?: 'default' | 'borderless';
  className?: string;
}

/** AI 对话输入栏使用的树形模型选择器（仅模型接入配置） */
export function renderChatModelSelect(
  aiModels: IAIModelConfig[],
  props: IModelSelectRenderProps,
): ReactNode {
  return (
    <ModelSelect
      {...props}
      models={aiModels}
      modelType='both'
      placeholder='选择模型'
    />
  );
}

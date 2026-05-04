import { CLI_AGENT_OPTIONS } from '@momo/aichat';
import type { ReactNode } from 'react';

import { ModelSelect } from '@renderer/components/ui/ModelSelect';
import type { IAIModelConfig } from '@renderer/types/settings';
import type { IModelTreeSimpleGroup } from '@renderer/utils/model-tree';

export interface IModelSelectRenderProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  variant?: 'default' | 'borderless';
  className?: string;
}

/** AI 对话场景下的 CLI Agent 两级分组 */
export function buildCliAgentSimpleGroups(): IModelTreeSimpleGroup[] {
  return [
    {
      id: 'cli-agent',
      label: 'CLI Agent',
      children: CLI_AGENT_OPTIONS.map((item) => ({
        id: item.id,
        label: item.label,
      })),
    },
  ];
}

/** AI 对话输入栏使用的树形模型选择器 */
export function renderChatModelSelect(
  aiModels: IAIModelConfig[],
  props: IModelSelectRenderProps,
): ReactNode {
  return (
    <ModelSelect
      {...props}
      models={aiModels}
      modelType='both'
      simpleGroups={buildCliAgentSimpleGroups()}
      placeholder='选择模型'
    />
  );
}

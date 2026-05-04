import { useMemo } from 'react';

import { createModelConfigResolver } from '@renderer/services/aichat';
import type { IAIModelConfig } from '@renderer/types/settings';
import { useStableRef } from './useStableRef';

/** 模型配置解析器：useMemo 计算 + ref 供 stream 闭包读取最新值 */
export function useStableModelResolver(aiModels: IAIModelConfig[]) {
  const resolver = useMemo(() => createModelConfigResolver(aiModels), [aiModels]);
  return useStableRef(resolver);
}

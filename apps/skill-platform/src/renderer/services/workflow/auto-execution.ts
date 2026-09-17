import type { IMacroStepViewModel } from './step-model';

export interface IWorkflowStepCursor {
  macroIndex: number;
  parallelChildIndex: number;
  nodeId: string;
}

/** 返回当前叶子节点之后的执行位置；并行组子节点按配置顺序逐个触发。 */
export function getNextWorkflowStepCursor(
  steps: IMacroStepViewModel[],
  macroIndex: number,
  parallelChildIndex: number,
): IWorkflowStepCursor | null {
  const current = steps[macroIndex];
  if (!current) {
    return null;
  }

  if (current.kind === 'parallel' && parallelChildIndex + 1 < current.children.length) {
    const nextChildIndex = parallelChildIndex + 1;
    return {
      macroIndex,
      parallelChildIndex: nextChildIndex,
      nodeId: current.children[nextChildIndex]!.nodeId,
    };
  }

  const nextMacroIndex = macroIndex + 1;
  const next = steps[nextMacroIndex];
  if (!next) {
    return null;
  }
  if (next.kind === 'parallel') {
    const firstChild = next.children[0];
    return firstChild
      ? { macroIndex: nextMacroIndex, parallelChildIndex: 0, nodeId: firstChild.nodeId }
      : null;
  }
  return { macroIndex: nextMacroIndex, parallelChildIndex: 0, nodeId: next.nodeId };
}

export function buildWorkflowAutoPrompt(
  resourceKind: 'prompt' | 'skill',
  userPrompt: string,
): string {
  if (resourceKind === 'prompt' && userPrompt.trim()) {
    return userPrompt.trim();
  }
  return resourceKind === 'skill'
    ? '请基于上一节点的运行结果或文件，使用当前技能继续执行工作流任务。'
    : '请基于上一节点的运行结果或文件，执行当前节点任务。';
}

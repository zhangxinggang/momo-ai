import type { IMacroStepViewModel } from '@renderer/services/workflow/step-model';

export interface IParallelPreviousResultItem {
  nodeId: string;
  nodeName: string;
  content: string;
}

export function buildMergedParallelContext(items: IParallelPreviousResultItem[]): string {
  return items
    .filter((item) => item.content.trim())
    .map((item) => `--- 并行上游 · ${item.nodeName} ---\n${item.content.trim()}`)
    .join('\n\n');
}

export function getPreviousContextForActiveStep(params: {
  macroSteps: IMacroStepViewModel[];
  macroIndex: number;
  runResults: Record<string, string>;
}): {
  previousNodeRunResult: { nodeName: string; content: string } | null;
  previousParallelResults: IParallelPreviousResultItem[] | null;
} {
  const { macroSteps, macroIndex, runResults } = params;
  if (macroIndex <= 0) {
    return { previousNodeRunResult: null, previousParallelResults: null };
  }

  const prev = macroSteps[macroIndex - 1];
  if (prev.kind === 'parallel') {
    const items = prev.children.map((child) => ({
      nodeId: child.nodeId,
      nodeName: child.nodeName,
      content: runResults[child.nodeId]?.trim() ?? '',
    }));
    return { previousNodeRunResult: null, previousParallelResults: items };
  }

  const content = runResults[prev.nodeId]?.trim();
  if (!content) {
    return { previousNodeRunResult: null, previousParallelResults: null };
  }

  return {
    previousNodeRunResult: { nodeName: prev.nodeName, content },
    previousParallelResults: null,
  };
}

/** 宏观上游资源节点名（并行组内子节点共享组外上游） */
export function getMacroUpstreamNodeName(
  macroSteps: IMacroStepViewModel[],
  macroIndex: number,
): string | null {
  if (macroIndex <= 0) {
    return null;
  }
  const prev = macroSteps[macroIndex - 1];
  if (prev.kind === 'resource') {
    return prev.nodeName;
  }
  return null;
}

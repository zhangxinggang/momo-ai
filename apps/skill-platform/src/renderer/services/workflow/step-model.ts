import type {
  IWorkflowResourceNodeData,
  IWorkflowResourceStep,
  IWorkflowStep,
} from '@momo/workflow';
import type { Node } from '@xyflow/react';

export interface IResourceStepViewModel extends IWorkflowResourceStep {
  kind: 'resource';
  node: Node<IWorkflowResourceNodeData>;
}

export interface IParallelStepViewModel {
  kind: 'parallel';
  nodeId: string;
  nodeName: string;
  label?: string;
  children: Array<IWorkflowResourceStep & { node: Node<IWorkflowResourceNodeData> }>;
}

export type IMacroStepViewModel = IResourceStepViewModel | IParallelStepViewModel;

export function buildMacroStepViewModels(
  steps: IWorkflowStep[],
  nodeMap: Map<string, Node<IWorkflowResourceNodeData>>,
): IMacroStepViewModel[] {
  const result: IMacroStepViewModel[] = [];

  for (const step of steps) {
    if (step.kind === 'resource') {
      const node = nodeMap.get(step.step.nodeId);
      if (!node) {
        continue;
      }
      result.push({ kind: 'resource', ...step.step, node });
      continue;
    }

    const children = step.children
      .map((child) => {
        const node = nodeMap.get(child.nodeId);
        if (!node) {
          return null;
        }
        return { ...child, node };
      })
      .filter((item): item is IWorkflowResourceStep & { node: Node<IWorkflowResourceNodeData> } =>
        Boolean(item),
      );

    if (children.length === 0) {
      continue;
    }

    if (children.length === 1) {
      const only = children[0]!;
      result.push({ kind: 'resource', ...only, node: only.node });
      continue;
    }

    result.push({
      kind: 'parallel',
      nodeId: step.nodeId,
      nodeName: step.nodeName,
      label: step.label,
      children,
    });
  }

  return result;
}

export function resolveActiveResourceStep(
  macroSteps: IMacroStepViewModel[],
  macroIndex: number,
  parallelChildIndex: number,
): IResourceStepViewModel | null {
  const macro = macroSteps[macroIndex];
  if (!macro) {
    return null;
  }
  if (macro.kind === 'resource') {
    return macro;
  }
  const child = macro.children[parallelChildIndex];
  if (!child) {
    return null;
  }
  return { kind: 'resource', ...child, node: child.node };
}

export function flattenResourceSteps(macroSteps: IMacroStepViewModel[]): IResourceStepViewModel[] {
  return macroSteps.flatMap((macro) => {
    if (macro.kind === 'resource') {
      return [macro];
    }
    return macro.children.map((child) => ({
      kind: 'resource' as const,
      ...child,
      node: child.node,
    }));
  });
}

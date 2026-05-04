import { ECliAgent } from '../types/chat';

export const CLI_MODEL_PREFIX = 'cli:';

export function isCliModelId(modelId: string): boolean {
  return modelId.startsWith(CLI_MODEL_PREFIX);
}

export function parseCliAgent(modelId: string): ECliAgent | null {
  if (!isCliModelId(modelId)) {
    return null;
  }
  const agent = modelId.slice(CLI_MODEL_PREFIX.length);
  if (agent === ECliAgent.EClaude || agent === ECliAgent.ECodex) {
    return agent;
  }
  return null;
}

export const CLI_AGENT_OPTIONS = [
  { id: `${CLI_MODEL_PREFIX}${ECliAgent.EClaude}`, label: 'Claude' },
  { id: `${CLI_MODEL_PREFIX}${ECliAgent.ECodex}`, label: 'Codex' },
] as const;

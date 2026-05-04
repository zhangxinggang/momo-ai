import type { IAIConfig } from '@renderer/services/ai';
import { resolveScenarioAIConfig } from '@renderer/services/ai/defaults';
import type { IAIModelConfig, IScenarioModelDefaults } from '@renderer/types/settings';

interface IResolveQuickAddAnalysisConfigOptions {
  aiModels: IAIModelConfig[];
  scenarioModelDefaults: IScenarioModelDefaults;
  aiProvider: string;
  aiApiProtocol?: IAIConfig['apiProtocol'];
  aiApiKey: string;
  aiApiUrl: string;
  aiModel: string;
}

export function resolveQuickAddAnalysisConfig({
  aiModels,
  scenarioModelDefaults,
  aiProvider,
  aiApiProtocol,
  aiApiKey,
  aiApiUrl,
  aiModel,
}: IResolveQuickAddAnalysisConfigOptions): IAIConfig | null {
  return resolveScenarioAIConfig({
    aiModels,
    scenarioModelDefaults,
    scenario: 'quickAdd',
    type: 'chat',
    aiProvider,
    aiApiProtocol,
    aiApiKey,
    aiApiUrl,
    aiModel,
  });
}

export function getQuickAddFallbackTitle(
  promptText: string,
  emptyFallback = 'New IPrompt',
): string {
  const firstLine = promptText
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean);

  return firstLine?.slice(0, 30) || emptyFallback;
}

import { SCENARIO_DEFINITIONS } from '@renderer/components/Settings/ai-workbench/constants';
import { ScenarioRow } from '@renderer/components/Settings/ai-workbench/shared-ui';
import { SettingSection } from '@renderer/components/Settings/SettingPrimitives';
import { resolveScenarioModel } from '@renderer/services/ai/defaults';
import type { EAIUsageScenario, IAIModelConfig } from '@renderer/types/settings';

export function ScenarioDefaultsSection({
  chatModels,
  imageModels,
  allModels,
  scenarioModelDefaults,
  onScenarioChange,
}: {
  chatModels: IAIModelConfig[];
  imageModels: IAIModelConfig[];
  allModels: IAIModelConfig[];
  scenarioModelDefaults: Partial<Record<EAIUsageScenario, string | null>>;
  onScenarioChange: (scenario: EAIUsageScenario, value: string | null) => void;
}) {
  return (
    <SettingSection title={'场景默认模型'}>
      <div className='divide-border/50 divide-y'>
        {SCENARIO_DEFINITIONS.map((item) => {
          const models = item.type === 'chat' ? chatModels : imageModels;
          const defaultModel = resolveScenarioModel(
            allModels,
            scenarioModelDefaults,
            item.key,
            item.type,
          );
          const optionIds = new Set(models.map((model) => model.id));
          const storedValue = scenarioModelDefaults[item.key];
          const value =
            storedValue && optionIds.has(storedValue)
              ? storedValue
              : defaultModel && optionIds.has(defaultModel.id)
                ? defaultModel.id
                : (models[0]?.id ?? '');
          const emptyHint =
            item.type === 'image'
              ? '请先在下方添加「图像模型」，或配置名称含 dall-e / flux 等生图模型 ID 的对话模型'
              : '请先在下方添加对话模型';

          return (
            <ScenarioRow
              key={item.key}
              label={item.label}
              desc={item.desc}
              disabled={models.length === 0}
              emptyHint={models.length === 0 ? emptyHint : undefined}
              value={value}
              models={models}
              modelType={item.type}
              onChange={(nextValue) => onScenarioChange(item.key, nextValue || null)}
            />
          );
        })}
      </div>
    </SettingSection>
  );
}

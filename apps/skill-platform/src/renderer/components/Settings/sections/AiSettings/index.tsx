import { App } from 'antd';
import { useMemo, useState } from 'react';

import { BrainIcon, ImageIcon } from 'lucide-react';

import {
  EMPTY_FORM,
  SCENARIO_DEFINITIONS,
} from '@renderer/components/Settings/ai-workbench/constants';
import { EndpointFormModal } from '@renderer/components/Settings/ai-workbench/EndpointFormModal';
import { EndpointsSection } from '@renderer/components/Settings/ai-workbench/EndpointsSection';
import {
  formatModelTestFailureToast,
  formatModelTestSuccessToast,
  getConnectionErrorMessage,
  getFetchModelsFeedback,
} from '@renderer/components/Settings/ai-workbench/feedback';
import { HeaderSection } from '@renderer/components/Settings/ai-workbench/HeaderSection';
import {
  buildChatParams,
  buildEndpointGroupKey,
  buildImageParams,
  cloneDefaultChatParams,
  cloneDefaultImageParams,
  createFormFromModel,
  getModelDisplayName,
  getProviderInfo,
} from '@renderer/components/Settings/ai-workbench/helpers';
import { ModelFormModal } from '@renderer/components/Settings/ai-workbench/ModelFormModal';
import { ScenarioDefaultsSection } from '@renderer/components/Settings/ai-workbench/ScenarioDefaultsSection';
import { useToast } from '@renderer/components/ui/Toast';
import {
  fetchAvailableModels,
  normalizeApiUrlInput,
  testAIConnection,
  testImageGeneration,
  type IModelInfo,
} from '@renderer/services/ai';
import {
  getModelsByType,
  isConfiguredModel,
  resolveScenarioModel,
} from '@renderer/services/ai/defaults';
import { useSettingsStore } from '@renderer/store';
import type {
  IEndpointDraft,
  IEndpointGroup,
  IEndpointStatus,
  IModelFormState,
  IStatusCardData,
} from '@renderer/types/ai-workbench';
import type { EAIUsageScenario, IAIModelConfig } from '@renderer/types/settings';

export function AiSettings() {
  const settings = useSettingsStore();
  const { showToast } = useToast();
  const { modal } = App.useApp();

  const [modelForm, setModelForm] = useState<IModelFormState>(EMPTY_FORM);
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [showModelForm, setShowModelForm] = useState(false);
  const [showEndpointForm, setShowEndpointForm] = useState(false);
  const [endpointDraft, setEndpointDraft] = useState<IEndpointDraft | null>(null);
  const [testingDefault, setTestingDefault] = useState(false);
  const [testingModelId, setTestingModelId] = useState<string | null>(null);
  const [testingEndpointKey, setTestingEndpointKey] = useState<string | null>(null);
  const [savingModel, setSavingModel] = useState(false);
  const [availableModels, setAvailableModels] = useState<IModelInfo[]>([]);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [endpointStatuses, setEndpointStatuses] = useState<Record<string, IEndpointStatus>>({});

  const aiModels = settings.aiModels;
  const chatModels = useMemo(() => getModelsByType(aiModels, 'chat'), [aiModels]);
  const imageModels = useMemo(() => getModelsByType(aiModels, 'image'), [aiModels]);
  const defaultChatModel = useMemo(
    () => chatModels.find((model) => model.isDefault) ?? chatModels[0] ?? null,
    [chatModels],
  );

  const resolvedScenarioModels = useMemo(
    () => ({
      quickAdd: resolveScenarioModel(aiModels, settings.scenarioModelDefaults, 'quickAdd', 'chat'),
      promptTest: resolveScenarioModel(
        aiModels,
        settings.scenarioModelDefaults,
        'promptTest',
        'chat',
      ),
      imageTest: resolveScenarioModel(
        aiModels,
        settings.scenarioModelDefaults,
        'imageTest',
        'image',
      ),
      translation: resolveScenarioModel(
        aiModels,
        settings.scenarioModelDefaults,
        'translation',
        'chat',
      ),
      textSegment: resolveScenarioModel(
        aiModels,
        settings.scenarioModelDefaults,
        'textSegment',
        'chat',
      ),
    }),
    [aiModels, settings.scenarioModelDefaults],
  );

  const endpointGroups = useMemo(() => {
    const grouped = aiModels.reduce<Record<string, IEndpointGroup>>((acc, model) => {
      const key = buildEndpointGroupKey(model);
      if (!acc[key]) {
        acc[key] = {
          key,
          provider: model.provider,
          apiProtocol: model.apiProtocol,
          apiUrl: model.apiUrl,
          models: [],
        };
      }
      acc[key].models.push(model);
      return acc;
    }, {});

    return Object.values(grouped).sort((left, right) =>
      left.provider.localeCompare(right.provider),
    );
  }, [aiModels]);

  const hasLegacyOnlyConfig = useMemo(
    () =>
      aiModels.length === 0 &&
      Boolean(
        settings.aiProvider.trim() &&
        settings.aiApiKey.trim() &&
        settings.aiApiUrl.trim() &&
        settings.aiModel.trim(),
      ),
    [aiModels.length, settings.aiApiKey, settings.aiApiUrl, settings.aiModel, settings.aiProvider],
  );

  const statusCards = useMemo<IStatusCardData[]>(
    () => [
      {
        title: '对话模型',
        value: String(chatModels.length),
        detail: `${'默认'}: ${getModelDisplayName(defaultChatModel, '未配置')}`,
        tone: chatModels.length > 0 ? 'ready' : 'warning',
        icon: BrainIcon,
      },
      {
        title: '生图模型',
        value: String(imageModels.length),
        detail: `${'默认'}: ${getModelDisplayName(resolvedScenarioModels.imageTest, '未配置')}`,
        tone: imageModels.length > 0 ? 'ready' : 'warning',
        icon: ImageIcon,
      },
    ],
    [chatModels.length, defaultChatModel, imageModels.length, resolvedScenarioModels],
  );

  const defaultModelDisplayName = useMemo(
    () => getModelDisplayName(defaultChatModel, '未配置默认模型'),
    [defaultChatModel],
  );

  const modelScenarioBadges = useMemo(() => {
    const entries = Object.entries(resolvedScenarioModels) as Array<
      [EAIUsageScenario, IAIModelConfig | null]
    >;
    const mapping = new Map<string, string[]>();

    for (const [scenario, model] of entries) {
      if (!model) {
        continue;
      }

      const badge = SCENARIO_DEFINITIONS.find((item) => item.key === scenario)?.badge ?? null;
      if (!badge) {
        continue;
      }

      const existing = mapping.get(model.id) ?? [];
      existing.push(badge);
      mapping.set(model.id, existing);
    }

    return mapping;
  }, [resolvedScenarioModels]);

  const openAddModel = (preset?: Partial<IModelFormState>) => {
    const provider = preset?.provider || EMPTY_FORM.provider;
    const providerInfo = getProviderInfo(provider);
    const apiProtocol =
      preset?.apiProtocol ?? providerInfo?.recommendedProtocol ?? EMPTY_FORM.apiProtocol;

    setEditingModelId(null);
    setAvailableModels([]);
    setModelForm({
      ...EMPTY_FORM,
      ...preset,
      provider,
      apiProtocol,
      apiUrl: preset?.apiUrl ?? providerInfo?.defaultUrl ?? EMPTY_FORM.apiUrl,
      chatParams: preset?.chatParams
        ? { ...cloneDefaultChatParams(), ...preset.chatParams }
        : cloneDefaultChatParams(),
      imageParams: preset?.imageParams
        ? { ...cloneDefaultImageParams(), ...preset.imageParams }
        : cloneDefaultImageParams(),
    });
    setShowModelForm(true);
  };

  const openEditModel = (model: IAIModelConfig) => {
    setEditingModelId(model.id);
    setAvailableModels([]);
    setModelForm(createFormFromModel(model));
    setShowModelForm(true);
  };

  const closeModelForm = () => {
    setEditingModelId(null);
    setAvailableModels([]);
    setShowModelForm(false);
    setModelForm({
      ...EMPTY_FORM,
      chatParams: cloneDefaultChatParams(),
      imageParams: cloneDefaultImageParams(),
    });
  };

  const handleFetchModels = async () => {
    if (!modelForm.apiKey.trim() || !modelForm.apiUrl.trim()) {
      showToast('请先填写 API Key 和 API 地址', 'error');
      return;
    }

    setFetchingModels(true);
    const result = await fetchAvailableModels(
      modelForm.apiUrl,
      modelForm.apiKey,
      modelForm.apiProtocol,
    );
    setFetchingModels(false);

    if (!result.success || result.models.length === 0) {
      const feedback = getFetchModelsFeedback(result, modelForm.apiUrl);
      showToast(feedback.message, feedback.type);
      return;
    }

    setAvailableModels(result.models);
    showToast(`已加载 ${result.models.length} 个模型`, 'success');
  };

  const handleTestDraft = async () => {
    if (!modelForm.apiKey.trim() || !modelForm.apiUrl.trim() || !modelForm.model.trim()) {
      showToast('请填写完整的模型配置', 'error');
      return;
    }

    setTestingModelId(editingModelId || '__draft__');
    const modelName = modelForm.name.trim() || modelForm.model.trim() || 'AI';
    try {
      if (modelForm.type === 'image') {
        const result = await testImageGeneration(
          {
            provider: modelForm.provider,
            apiProtocol: modelForm.apiProtocol,
            apiKey: modelForm.apiKey,
            apiUrl: modelForm.apiUrl,
            model: modelForm.model,
          },
          'A minimal product illustration on a clean background',
        );
        if (!result.success) {
          throw new Error(result.error || '连接失败');
        }
        showToast(formatModelTestSuccessToast(modelName, result.latency), 'success');
      } else {
        const result = await testAIConnection({
          provider: modelForm.provider,
          apiProtocol: modelForm.apiProtocol,
          apiKey: modelForm.apiKey,
          apiUrl: modelForm.apiUrl,
          model: modelForm.model,
        });
        if (!result.success) {
          throw new Error(result.error || '连接失败');
        }
        showToast(formatModelTestSuccessToast(modelName, result.latency), 'success');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      showToast(formatModelTestFailureToast(modelName, message, modelForm.apiUrl), 'error');
    } finally {
      setTestingModelId(null);
    }
  };

  const handleSaveModel = () => {
    if (
      !modelForm.provider.trim() ||
      !modelForm.apiKey.trim() ||
      !modelForm.apiUrl.trim() ||
      !modelForm.model.trim()
    ) {
      showToast('请填写完整的模型配置', 'error');
      return;
    }

    const nextChatParams = modelForm.type === 'chat' ? buildChatParams(modelForm) : undefined;
    const nextImageParams = modelForm.type === 'image' ? buildImageParams(modelForm) : undefined;

    if (modelForm.type === 'chat' && !nextChatParams) {
      showToast('自定义参数必须是 JSON 对象，且值只能是字符串、数字或布尔值', 'error');
      return;
    }

    setSavingModel(true);
    const payload = {
      name: modelForm.name.trim(),
      provider: modelForm.provider.trim(),
      apiProtocol: modelForm.apiProtocol,
      apiKey: modelForm.apiKey.trim(),
      apiUrl: normalizeApiUrlInput(modelForm.apiUrl),
      model: modelForm.model.trim(),
      type: modelForm.type,
      chatParams: modelForm.type === 'chat' ? nextChatParams : undefined,
      imageParams: modelForm.type === 'image' ? nextImageParams : undefined,
    };

    if (editingModelId) {
      settings.updateAiModel(editingModelId, payload);
      showToast('模型已更新', 'success');
    } else {
      settings.addAiModel(payload);
      showToast('模型已添加', 'success');
    }

    setSavingModel(false);
    closeModelForm();
  };

  const handleBatchAddModels = (selectedIds: string[]) => {
    if (!modelForm.provider.trim() || !modelForm.apiKey.trim() || !modelForm.apiUrl.trim()) {
      showToast('请先填写 API Key 和 API 地址', 'error');
      return;
    }

    const nextChatParams = modelForm.type === 'chat' ? buildChatParams(modelForm) : undefined;
    const nextImageParams = modelForm.type === 'image' ? buildImageParams(modelForm) : undefined;

    if (modelForm.type === 'chat' && !nextChatParams) {
      showToast('自定义参数必须是 JSON 对象，且值只能是字符串、数字或布尔值', 'error');
      return;
    }

    setSavingModel(true);
    for (const modelId of selectedIds) {
      settings.addAiModel({
        name: '',
        provider: modelForm.provider.trim(),
        apiProtocol: modelForm.apiProtocol,
        apiKey: modelForm.apiKey.trim(),
        apiUrl: normalizeApiUrlInput(modelForm.apiUrl),
        model: modelId,
        type: modelForm.type,
        chatParams: modelForm.type === 'chat' ? nextChatParams : undefined,
        imageParams: modelForm.type === 'image' ? nextImageParams : undefined,
      });
    }
    setSavingModel(false);
    showToast('模型已添加' + ` (${selectedIds.length})`, 'success');
    closeModelForm();
  };

  const handleDeleteModel = (model: IAIModelConfig) => {
    modal.confirm({
      title: '确认删除模型？',
      content: '确定要删除这个模型配置吗？',
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        settings.deleteAiModel(model.id);
        showToast('模型已删除', 'success');
      },
    });
  };

  const handleTestModel = async (model: IAIModelConfig) => {
    if (!isConfiguredModel(model)) {
      showToast('该模型配置不完整，无法测试', 'error');
      return;
    }

    setTestingModelId(model.id);
    const modelName = getModelDisplayName(model, 'AI');
    try {
      if ((model.type ?? 'chat') === 'image') {
        const result = await testImageGeneration(
          {
            provider: model.provider,
            apiProtocol: model.apiProtocol,
            apiKey: model.apiKey,
            apiUrl: model.apiUrl,
            model: model.model,
          },
          'A minimal product illustration on a clean background',
        );
        if (!result.success) {
          throw new Error(result.error || '连接失败');
        }
        showToast(formatModelTestSuccessToast(modelName, result.latency), 'success');
      } else {
        const result = await testAIConnection({
          provider: model.provider,
          apiProtocol: model.apiProtocol,
          apiKey: model.apiKey,
          apiUrl: model.apiUrl,
          model: model.model,
        });
        if (!result.success) {
          throw new Error(result.error || '连接失败');
        }
        showToast(formatModelTestSuccessToast(modelName, result.latency), 'success');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      showToast(formatModelTestFailureToast(modelName, message, model.apiUrl), 'error');
    } finally {
      setTestingModelId(null);
    }
  };

  const handleTestEndpoint = async (group: IEndpointGroup) => {
    const targetModel = group.models.find(isConfiguredModel);
    if (!targetModel) {
      showToast('该端点下还没有可测试的完整模型', 'error');
      return;
    }

    setTestingEndpointKey(group.key);
    try {
      if ((targetModel.type ?? 'chat') === 'image') {
        const result = await testImageGeneration(
          {
            provider: targetModel.provider,
            apiProtocol: targetModel.apiProtocol,
            apiKey: targetModel.apiKey,
            apiUrl: targetModel.apiUrl,
            model: targetModel.model,
          },
          'A minimal product illustration on a clean background',
        );
        if (!result.success) {
          throw new Error(result.error || '连接失败');
        }
        setEndpointStatuses((prev) => ({
          ...prev,
          [group.key]: {
            tone: 'ready',
            label: '已连接',
            detail: `${targetModel.model} · ${result.latency}ms`,
          },
        }));
        showToast(`端点连接成功（${result.latency}ms）`, 'success');
      } else {
        const result = await testAIConnection({
          provider: targetModel.provider,
          apiProtocol: targetModel.apiProtocol,
          apiKey: targetModel.apiKey,
          apiUrl: targetModel.apiUrl,
          model: targetModel.model,
        });
        if (!result.success) {
          throw new Error(result.error || '连接失败');
        }
        setEndpointStatuses((prev) => ({
          ...prev,
          [group.key]: {
            tone: 'ready',
            label: '已连接',
            detail: `${targetModel.model} · ${result.latency}ms`,
          },
        }));
        showToast(`端点连接成功（${result.latency}ms）`, 'success');
      }
    } catch (error) {
      const message = getConnectionErrorMessage(
        error instanceof Error ? error.message : String(error),
        targetModel.apiUrl,
      );
      setEndpointStatuses((prev) => ({
        ...prev,
        [group.key]: {
          tone: 'error',
          label: '连接失败',
          detail: message,
        },
      }));
      showToast(message, 'error');
    } finally {
      setTestingEndpointKey(null);
    }
  };

  const openEditEndpoint = (group: IEndpointGroup) => {
    const firstModel = group.models[0];
    setEndpointDraft({
      key: group.key,
      provider: firstModel.provider,
      apiProtocol: firstModel.apiProtocol,
      apiKey: firstModel.apiKey,
      apiUrl: firstModel.apiUrl,
    });
    setShowEndpointForm(true);
  };

  const closeEndpointForm = () => {
    setShowEndpointForm(false);
    setEndpointDraft(null);
  };

  const handleSaveEndpoint = () => {
    if (!endpointDraft) {
      return;
    }

    const targetGroup = endpointGroups.find((group) => group.key === endpointDraft.key);
    if (!targetGroup) {
      return;
    }

    for (const model of targetGroup.models) {
      settings.updateAiModel(model.id, {
        provider: endpointDraft.provider.trim(),
        apiProtocol: endpointDraft.apiProtocol,
        apiKey: endpointDraft.apiKey.trim(),
        apiUrl: normalizeApiUrlInput(endpointDraft.apiUrl),
      });
    }

    setEndpointStatuses((prev) => {
      const next = { ...prev };
      delete next[endpointDraft.key];
      return next;
    });
    closeEndpointForm();
    showToast('端点配置已更新', 'success');
  };

  const handleTestDefaultModel = async () => {
    const model =
      resolvedScenarioModels.promptTest ||
      resolvedScenarioModels.imageTest ||
      resolvedScenarioModels.translation;

    if (!model || !isConfiguredModel(model)) {
      showToast('还没有可测试的默认模型', 'error');
      return;
    }

    setTestingDefault(true);
    await handleTestModel(model);
    setTestingDefault(false);
  };

  const importLegacyConfig = () => {
    settings.addAiModel({
      name: settings.aiModel,
      provider: settings.aiProvider,
      apiProtocol: settings.aiApiProtocol,
      apiKey: settings.aiApiKey,
      apiUrl: settings.aiApiUrl,
      model: settings.aiModel,
      type: 'chat',
    });
    showToast('已导入旧版默认模型配置', 'success');
  };

  return (
    <div className='mx-auto max-w-5xl space-y-10 pb-10'>
      <HeaderSection
        testingDefault={testingDefault}
        hasLegacyOnlyConfig={hasLegacyOnlyConfig}
        statusCards={statusCards}
        defaultModelDisplayName={defaultModelDisplayName}
        onTestDefault={() => void handleTestDefaultModel()}
        onAddModel={() => openAddModel()}
        onImportLegacy={importLegacyConfig}
      />

      <ScenarioDefaultsSection
        chatModels={chatModels}
        imageModels={imageModels}
        allModels={aiModels}
        scenarioModelDefaults={settings.scenarioModelDefaults}
        onScenarioChange={(scenario, value) => settings.setScenarioModelDefault(scenario, value)}
      />

      <EndpointsSection
        endpointGroups={endpointGroups}
        endpointStatuses={endpointStatuses}
        testingEndpointKey={testingEndpointKey}
        testingModelId={testingModelId}
        modelScenarioBadges={modelScenarioBadges}
        onTestEndpoint={(group) => void handleTestEndpoint(group)}
        onEditEndpoint={openEditEndpoint}
        onAddModel={openAddModel}
        onSetDefaultModel={(modelId) => settings.setDefaultAiModel(modelId)}
        onTestModel={(model) => void handleTestModel(model)}
        onEditModel={openEditModel}
        onDeleteModel={handleDeleteModel}
      />

      {showModelForm ? (
        <ModelFormModal
          editingModelId={editingModelId}
          modelForm={modelForm}
          setModelForm={setModelForm}
          availableModels={availableModels}
          fetchingModels={fetchingModels}
          testingModelId={testingModelId}
          savingModel={savingModel}
          onClose={closeModelForm}
          onFetchModels={() => void handleFetchModels()}
          onTestDraft={() => void handleTestDraft()}
          onSave={handleSaveModel}
          onBatchAdd={handleBatchAddModels}
        />
      ) : null}

      {showEndpointForm && endpointDraft ? (
        <EndpointFormModal
          endpointDraft={endpointDraft}
          setEndpointDraft={setEndpointDraft}
          onClose={closeEndpointForm}
          onSave={handleSaveEndpoint}
        />
      ) : null}
    </div>
  );
}

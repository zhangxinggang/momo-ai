import { useMemo, useState, type ReactNode } from 'react';

import {
  getEndpointCategory,
  getEndpointHost,
  getModelCategory,
  getProtocolLabel,
  getProviderLabel,
} from '@renderer/components/Settings/ai-workbench/helpers';
import { getCategoryIcon } from '@renderer/components/ui/ModelIcons';
import { isConfiguredModel } from '@renderer/services/ai/defaults';
import type {
  IEndpointGroup,
  IEndpointStatus,
  IModelFormState,
} from '@renderer/types/ai-workbench';
import type { IAIModelConfig } from '@renderer/types/settings';
import { Button, Collapse, Input } from 'antd';
import {
  AlertCircleIcon,
  BadgeCheckIcon,
  CheckCircle2Icon,
  Loader2Icon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  SearchIcon,
  ShieldCheckIcon,
  Trash2Icon,
} from 'lucide-react';

function matchesModelSearch(model: IAIModelConfig, query: string): boolean {
  if (!query) {
    return true;
  }
  const haystack = `${model.name ?? ''} ${model.model ?? ''}`.toLowerCase();
  return haystack.includes(query);
}

function ModelRow({
  model,
  badges,
  testingModelId,
  onTestModel,
  onSetDefaultModel,
  onEditModel,
  onDeleteModel,
}: {
  model: IAIModelConfig;
  badges: Array<{ label: string; primary: boolean }>;
  testingModelId: string | null;
  onTestModel: (model: IAIModelConfig) => void;
  onSetDefaultModel: (modelId: string) => void;
  onEditModel: (model: IAIModelConfig) => void;
  onDeleteModel: (model: IAIModelConfig) => void;
}) {
  return (
    <div
      className={`hover:bg-muted/10 group relative flex flex-col gap-3 px-4 py-2.5 transition-colors md:flex-row md:items-center md:justify-between ${
        model.isDefault ? 'bg-primary/[0.06]' : ''
      }`}>
      {model.isDefault ? (
        <span className='text-primary/80 absolute left-2 top-1 text-[10px] font-medium'>
          {'默认'}
        </span>
      ) : null}
      <div className='flex min-w-0 items-center gap-4'>
        <div className='border-border/60 bg-background text-primary rounded-lg border p-2'>
          {getCategoryIcon(getModelCategory(model), 20)}
        </div>
        <div className='min-w-0'>
          <div className='text-sm font-medium'>{model.name || model.model}</div>
          {model.name ? <div className='text-muted-foreground text-xs'>{model.model}</div> : null}
        </div>
        <div className='flex flex-wrap gap-1.5'>
          {badges.map((badge) => (
            <span
              key={`${model.id}-${badge.label}`}
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${
                badge.primary
                  ? 'bg-primary/10 text-primary'
                  : 'border-border/60 text-muted-foreground border'
              }`}>
              {badge.label}
            </span>
          ))}
        </div>
      </div>
      <div className='flex items-center gap-1.5'>
        <Button
          type='text'
          size='small'
          onClick={() => onTestModel(model)}
          disabled={testingModelId === model.id}
          aria-label={'测试'}
          title={'测试'}
          className='text-muted-foreground hover:border-border hover:bg-muted/50 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-transparent transition-all disabled:opacity-50'>
          {testingModelId === model.id ? (
            <Loader2Icon className='h-3.5 w-3.5 animate-spin' />
          ) : (
            <PlayIcon className='h-3.5 w-3.5' />
          )}
        </Button>
        {!model.isDefault ? (
          <Button
            type='text'
            size='small'
            onClick={() => onSetDefaultModel(model.id)}
            aria-label={'设为默认'}
            title={'设为默认'}
            className='text-muted-foreground hover:border-border hover:bg-muted/50 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-transparent transition-all'>
            <BadgeCheckIcon className='h-3.5 w-3.5' />
          </Button>
        ) : null}
        <Button
          type='text'
          size='small'
          onClick={() => onEditModel(model)}
          aria-label={'编辑'}
          title={'编辑'}
          className='text-muted-foreground hover:border-border hover:bg-muted/50 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-transparent transition-all'>
          <PencilIcon className='h-3.5 w-3.5' />
        </Button>
        <Button
          type='text'
          size='small'
          onClick={() => onDeleteModel(model)}
          aria-label={'删除'}
          title={'删除'}
          className='inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-transparent text-red-500 transition-all hover:border-red-500/20 hover:bg-red-500/5'>
          <Trash2Icon className='h-3.5 w-3.5' />
        </Button>
      </div>
    </div>
  );
}

function buildModelBadges(
  model: IAIModelConfig,
  modelScenarioBadges: Map<string, string[]>,
): Array<{ label: string; primary: boolean }> {
  return [
    ...(modelScenarioBadges.get(model.id) ?? []).map((badge) => ({
      label: badge,
      primary: true,
    })),
  ];
}

function EndpointModelCategories({
  models,
  modelScenarioBadges,
  testingModelId,
  onTestModel,
  onSetDefaultModel,
  onEditModel,
  onDeleteModel,
}: {
  models: IAIModelConfig[];
  modelScenarioBadges: Map<string, string[]>;
  testingModelId: string | null;
  onTestModel: (model: IAIModelConfig) => void;
  onSetDefaultModel: (modelId: string) => void;
  onEditModel: (model: IAIModelConfig) => void;
  onDeleteModel: (model: IAIModelConfig) => void;
}) {
  const chatModels = models.filter((model) => (model.type ?? 'chat') === 'chat');
  const imageModels = models.filter((model) => model.type === 'image');

  const categoryItems = [
    chatModels.length > 0
      ? {
          key: 'chat',
          label: (
            <span className='text-muted-foreground text-xs font-medium'>
              {'对话'}
              <span className='text-muted-foreground/70 ml-1.5 font-normal'>{chatModels.length}</span>
            </span>
          ),
          children: (
            <div className='divide-border/40 divide-y'>
              {chatModels.map((model) => (
                <ModelRow
                  key={model.id}
                  model={model}
                  badges={buildModelBadges(model, modelScenarioBadges)}
                  testingModelId={testingModelId}
                  onTestModel={onTestModel}
                  onSetDefaultModel={onSetDefaultModel}
                  onEditModel={onEditModel}
                  onDeleteModel={onDeleteModel}
                />
              ))}
            </div>
          ),
        }
      : null,
    imageModels.length > 0
      ? {
          key: 'image',
          label: (
            <span className='text-muted-foreground text-xs font-medium'>
              {'生图'}
              <span className='text-muted-foreground/70 ml-1.5 font-normal'>{imageModels.length}</span>
            </span>
          ),
          children: (
            <div className='divide-border/40 divide-y'>
              {imageModels.map((model) => (
                <ModelRow
                  key={model.id}
                  model={model}
                  badges={buildModelBadges(model, modelScenarioBadges)}
                  testingModelId={testingModelId}
                  onTestModel={onTestModel}
                  onSetDefaultModel={onSetDefaultModel}
                  onEditModel={onEditModel}
                  onDeleteModel={onDeleteModel}
                />
              ))}
            </div>
          ),
        }
      : null,
  ].filter(Boolean) as Array<{ key: string; label: ReactNode; children: ReactNode }>;

  if (categoryItems.length === 0) {
    return null;
  }

  return (
    <Collapse
      defaultActiveKey={categoryItems.map((item) => item.key)}
      ghost
      size='small'
      className='endpoint-model-categories'
      items={categoryItems}
    />
  );
}

export function EndpointsSection({
  endpointGroups,
  endpointStatuses,
  testingEndpointKey,
  testingModelId,
  modelScenarioBadges,
  onTestEndpoint,
  onEditEndpoint,
  onDeleteEndpoint,
  onAddModel,
  onSetDefaultModel,
  onTestModel,
  onEditModel,
  onDeleteModel,
}: {
  endpointGroups: IEndpointGroup[];
  endpointStatuses: Record<string, IEndpointStatus>;
  testingEndpointKey: string | null;
  testingModelId: string | null;
  modelScenarioBadges: Map<string, string[]>;
  onTestEndpoint: (group: IEndpointGroup) => void;
  onEditEndpoint: (group: IEndpointGroup) => void;
  onDeleteEndpoint: (group: IEndpointGroup) => void;
  onAddModel: (preset?: Partial<IModelFormState>) => void;
  onSetDefaultModel: (modelId: string) => void;
  onTestModel: (model: IAIModelConfig) => void;
  onEditModel: (model: IAIModelConfig) => void;
  onDeleteModel: (model: IAIModelConfig) => void;
}) {
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const normalizedQuery = modelSearchQuery.trim().toLowerCase();

  const filteredEndpointGroups = useMemo(() => {
    if (!normalizedQuery) {
      return endpointGroups;
    }
    return endpointGroups
      .map((group) => ({
        ...group,
        models: group.models.filter((model) => matchesModelSearch(model, normalizedQuery)),
      }))
      .filter((group) => group.models.length > 0);
  }, [endpointGroups, normalizedQuery]);

  const defaultActiveKey = useMemo(
    () => (filteredEndpointGroups[0]?.key ? [filteredEndpointGroups[0].key] : []),
    [filteredEndpointGroups],
  );

  return (
    <div>
      <div className='mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <h3 className='text-muted-foreground text-sm font-medium'>{'已配置账户 / 端点'}</h3>
        <Input
          allowClear
          prefix={<SearchIcon className='text-muted-foreground h-4 w-4' />}
          placeholder='搜索模型名称…'
          value={modelSearchQuery}
          onChange={(event) => setModelSearchQuery(event.target.value)}
          className='sm:max-w-xs'
        />
      </div>
      {endpointGroups.length === 0 ? (
        <div className='border-border bg-card text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm'>
          {'还没有添加任何模型。先添加一个对话或生图模型。'}
        </div>
      ) : filteredEndpointGroups.length === 0 ? (
        <div className='border-border bg-card text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm'>
          {'没有匹配的模型，请调整搜索关键词。'}
        </div>
      ) : (
        <Collapse
          defaultActiveKey={defaultActiveKey}
          items={filteredEndpointGroups.map((group) => {
            const endpointStatus =
              endpointStatuses[group.key] ??
              (group.models.some(isConfiguredModel)
                ? {
                    tone: 'warning' as const,
                    label: '未验证',
                    detail: `${group.models.length} 个模型`,
                  }
                : {
                    tone: 'warning' as const,
                    label: '未配置',
                    detail: '缺少完整的模型配置',
                  });

            return {
              key: group.key,
              label: (
                <div className='flex min-w-0 items-center gap-3 py-1'>
                  <div className='border-border/60 bg-background text-primary rounded-lg border p-2 shadow-sm'>
                    {getCategoryIcon(getEndpointCategory(group.provider, group.models), 18)}
                  </div>
                  <div className='min-w-0'>
                    <div className='flex flex-wrap items-center gap-2 text-sm font-semibold'>
                      {getProviderLabel(group.provider)}
                      <span className='border-border/60 text-muted-foreground inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium'>
                        {getProtocolLabel(group.apiProtocol)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                          endpointStatus.tone === 'ready'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : endpointStatus.tone === 'error'
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                        {endpointStatus.tone === 'ready' ? (
                          <CheckCircle2Icon className='h-3 w-3' />
                        ) : (
                          <AlertCircleIcon className='h-3 w-3' />
                        )}
                        {endpointStatus.label}
                      </span>
                    </div>
                    <div className='text-muted-foreground mt-0.5 text-xs'>
                      {getEndpointHost(group.apiUrl, '未配置地址')}
                    </div>
                    <div className='text-muted-foreground mt-1 text-[11px]'>
                      {endpointStatus.detail}
                    </div>
                  </div>
                </div>
              ),
              extra: (
                <div
                  className='flex flex-wrap items-center gap-2'
                  onClick={(event) => event.stopPropagation()}>
                  <Button
                    type='text'
                    size='small'
                    onClick={() => onTestEndpoint(group)}
                    disabled={testingEndpointKey === group.key}
                    className='text-muted-foreground hover:border-border hover:bg-background inline-flex h-8 items-center gap-1.5 rounded-md border border-transparent px-2.5 text-xs transition-all disabled:opacity-50'>
                    {testingEndpointKey === group.key ? (
                      <Loader2Icon className='h-3.5 w-3.5 animate-spin' />
                    ) : (
                      <ShieldCheckIcon className='h-3.5 w-3.5' />
                    )}
                    {'测试连接'}
                  </Button>
                  <Button
                    type='text'
                    size='small'
                    onClick={() => onEditEndpoint(group)}
                    className='text-muted-foreground hover:border-border hover:bg-background inline-flex h-8 items-center gap-1.5 rounded-md border border-transparent px-2.5 text-xs transition-all'>
                    <PencilIcon className='h-3.5 w-3.5' />
                    {'编辑'}
                  </Button>
                  <Button
                    type='text'
                    size='small'
                    onClick={() => onDeleteEndpoint(group)}
                    className='inline-flex h-8 items-center gap-1.5 rounded-md border border-transparent px-2.5 text-xs text-red-500 transition-all hover:border-red-500/20 hover:bg-red-500/5'>
                    <Trash2Icon className='h-3.5 w-3.5' />
                    {'删除'}
                  </Button>
                  <Button
                    type='text'
                    size='small'
                    onClick={() =>
                      onAddModel({
                        provider: group.provider,
                        apiProtocol: group.apiProtocol,
                        apiKey: group.models[0]?.apiKey || '',
                        apiUrl: group.apiUrl,
                        type: group.models[0]?.type ?? 'chat',
                      })
                    }
                    className='bg-primary/10 text-primary hover:bg-primary/20 inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors'>
                    <PlusIcon className='h-3.5 w-3.5' />
                    {'添加模型'}
                  </Button>
                </div>
              ),
              children: (
                <div className='bg-card'>
                  <EndpointModelCategories
                    models={group.models}
                    modelScenarioBadges={modelScenarioBadges}
                    testingModelId={testingModelId}
                    onTestModel={onTestModel}
                    onSetDefaultModel={onSetDefaultModel}
                    onEditModel={onEditModel}
                    onDeleteModel={onDeleteModel}
                  />
                </div>
              ),
            };
          })}
        />
      )}
    </div>
  );
}

import {
  getEndpointCategory,
  getEndpointHost,
  getModelCategory,
  getProtocolLabel,
  getProviderLabel,
} from '@renderer/components/Settings/AiWorkbench/helpers';
import { getCategoryIcon } from '@renderer/components/ui/ModelIcons';
import { isConfiguredModel } from '@renderer/services/ai/defaults';
import type {
  IEndpointGroup,
  IEndpointStatus,
  IModelFormState,
} from '@renderer/types/ai-workbench';
import type { IAIModelConfig } from '@renderer/types/settings';
import { Button } from 'antd';
import {
  AlertCircleIcon,
  BadgeCheckIcon,
  CheckCircle2Icon,
  Loader2Icon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  ShieldCheckIcon,
  Trash2Icon,
} from 'lucide-react';

export function EndpointsSection({
  endpointGroups,
  endpointStatuses,
  testingEndpointKey,
  testingModelId,
  modelScenarioBadges,
  onTestEndpoint,
  onEditEndpoint,
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
  onAddModel: (preset?: Partial<IModelFormState>) => void;
  onSetDefaultModel: (modelId: string) => void;
  onTestModel: (model: IAIModelConfig) => void;
  onEditModel: (model: IAIModelConfig) => void;
  onDeleteModel: (model: IAIModelConfig) => void;
}) {
  return (
    <div>
      <h3 className='text-muted-foreground mb-3 text-sm font-medium'>{'已配置账户 / 端点'}</h3>
      {endpointGroups.length === 0 ? (
        <div className='border-border bg-card text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm'>
          {'还没有添加任何模型。先添加一个对话或生图模型。'}
        </div>
      ) : (
        <div className='space-y-6'>
          {endpointGroups.map((group) => {
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

            return (
              <div
                key={group.key}
                className='border-border bg-card overflow-hidden rounded-xl border shadow-sm'>
                <div className='border-border/60 bg-muted/40 flex flex-col gap-3 border-b px-4 py-3 md:flex-row md:items-center md:justify-between'>
                  <div className='flex min-w-0 items-center gap-3'>
                    <div className='border-border/60 bg-background text-primary rounded-lg border p-2 shadow-sm'>
                      {getCategoryIcon(getEndpointCategory(group.provider, group.models), 18)}
                    </div>
                    <div className='min-w-0'>
                      <div className='flex items-center gap-2 text-sm font-semibold'>
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
                  <div className='flex flex-wrap items-center gap-2'>
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
                </div>

                <div className='divide-border/40 bg-card divide-y'>
                  {group.models.map((model) => {
                    const badges = [
                      {
                        label: (model.type ?? 'chat') === 'image' ? '图像模型' : '对话模型',
                        primary: false,
                      },
                      ...(modelScenarioBadges.get(model.id) ?? []).map((badge) => ({
                        label: badge,
                        primary: true,
                      })),
                    ];

                    return (
                      <div
                        key={model.id}
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
                            {model.name ? (
                              <div className='text-muted-foreground text-xs'>{model.model}</div>
                            ) : null}
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
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

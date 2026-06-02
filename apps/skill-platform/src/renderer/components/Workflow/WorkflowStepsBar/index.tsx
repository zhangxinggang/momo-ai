import type { IWorkflowResourceNodeData } from '@momo/workflow';
import { isParallelGroupOutputReady } from '@momo/workflow';
import { Popover, Tooltip } from 'antd';
import { clsx } from 'clsx';
import { ChevronRightIcon, CommandIcon, CuboidIcon, GitBranchIcon } from 'lucide-react';
import { Fragment, useCallback } from 'react';

import { SkillIcon } from '@renderer/components/Skill/SkillIcon';
import {
  WORKFLOW_PARALLEL_TAG_COLOR,
  WORKFLOW_RESOURCE_TAG_COLORS,
} from '@renderer/components/Workflow/constants';
import type {
  IMacroStepViewModel,
  IParallelStepViewModel,
  IResourceStepViewModel,
} from '@renderer/services/workflow/step-model';
import { usePromptStore, useSkillStore } from '@renderer/store';
import styles from './index.module.less';

/** @deprecated 使用 IMacroStepViewModel / IResourceStepViewModel */
export type IStepViewModel = IMacroStepViewModel;

interface IProps {
  steps: IMacroStepViewModel[];
  mode: 'readonly' | 'interactive';
  activeMacroIndex?: number;
  activeParallelChildIndex?: number;
  runResults?: Record<string, string>;
  nodeHasFiles?: Record<string, boolean>;
  onStepClick?: (macroIndex: number) => void;
  onParallelChildClick?: (macroIndex: number, childIndex: number) => void;
}

function isResourceOutputReady(
  nodeId: string,
  runResults: Record<string, string>,
  nodeHasFiles: Record<string, boolean>,
): boolean {
  const hasRunResult = !!runResults[nodeId]?.trim();
  const hasFiles = nodeHasFiles[nodeId] ?? false;
  return hasRunResult && hasFiles;
}

function isMacroStepOutputReady(
  step: IMacroStepViewModel,
  runResults: Record<string, string>,
  nodeHasFiles: Record<string, boolean>,
): boolean {
  if (step.kind === 'resource') {
    return isResourceOutputReady(step.nodeId, runResults, nodeHasFiles);
  }
  return isParallelGroupOutputReady(step.children, runResults, nodeHasFiles);
}

function isMacroStepAccessible(
  macroIndex: number,
  steps: IMacroStepViewModel[],
  runResults: Record<string, string>,
  nodeHasFiles: Record<string, boolean>,
): boolean {
  if (macroIndex === 0) {
    return true;
  }
  const previousStep = steps[macroIndex - 1];
  if (!previousStep) {
    return false;
  }
  return isMacroStepOutputReady(previousStep, runResults, nodeHasFiles);
}

function buildStepHoverContent(
  d: IWorkflowResourceNodeData,
  isPrompt: boolean,
  prompt: { title?: string; systemPrompt?: string; userPrompt?: string } | undefined,
  skill: { name?: string; description?: string } | undefined,
): React.ReactNode {
  if (isPrompt) {
    const systemText = d.systemPrompt?.trim() || prompt?.systemPrompt?.trim() || '';
    const userText = d.userPrompt?.trim() || prompt?.userPrompt?.trim() || '';
    return (
      <div className={styles['workflow-step-tooltip']}>
        <div className={styles['workflow-step-tooltip-title']}>
          {'提示词'}
          {prompt?.title ? ` · ${prompt.title}` : ''}
        </div>
        {systemText ? (
          <div className={styles['workflow-step-tooltip-block']}>
            <div className={styles['workflow-step-tooltip-label']}>{'系统提示词'}</div>
            <div className={styles['workflow-step-tooltip-text']}>{systemText}</div>
          </div>
        ) : null}
        {userText ? (
          <div className={styles['workflow-step-tooltip-block']}>
            <div className={styles['workflow-step-tooltip-label']}>{'用户提示词'}</div>
            <div className={styles['workflow-step-tooltip-text']}>{userText}</div>
          </div>
        ) : null}
        {!systemText && !userText ? (
          <div className={styles['workflow-step-tooltip-text']}>{'暂无提示词内容'}</div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={styles['workflow-step-tooltip']}>
      <div className={styles['workflow-step-tooltip-title']}>
        {'技能'}
        {skill?.name ? ` · ${skill.name}` : ''}
      </div>
      {skill?.description?.trim() ? (
        <div className={styles['workflow-step-tooltip-text']}>{skill.description.trim()}</div>
      ) : (
        <div className={styles['workflow-step-tooltip-text']}>{'暂无技能描述'}</div>
      )}
    </div>
  );
}

/** 工作流步骤条：只读预览或交互式切换节点 */
export function WorkflowStepsBar({
  steps,
  mode,
  activeMacroIndex = 0,
  activeParallelChildIndex = 0,
  runResults = {},
  nodeHasFiles = {},
  onStepClick,
  onParallelChildClick,
}: IProps) {
  const prompts = usePromptStore((s) => s.prompts);
  const skills = useSkillStore((s) => s.skills);
  const isInteractive = mode === 'interactive';

  const handleMacroClick = useCallback(
    (index: number) => {
      if (!isInteractive || !onStepClick) {
        return;
      }
      onStepClick(index);
    },
    [isInteractive, onStepClick],
  );

  const renderResourceStepCard = (step: IResourceStepViewModel, index: number) => {
    const d = step.node.data;
    const isPrompt = d.resourceKind === 'prompt';
    const skill = !isPrompt ? skills.find((s) => s.id === d.resourceId) : undefined;
    const prompt = isPrompt ? prompts.find((p) => p.id === d.resourceId) : undefined;
    const tagColor = WORKFLOW_RESOURCE_TAG_COLORS[isPrompt ? 'prompt' : 'skill'];
    const displayTitle = isPrompt ? prompt?.title || d.label : skill?.name || d.label;
    const displayRemark = d.remark?.trim() || '暂无备注';
    const hoverContent = buildStepHoverContent(d, isPrompt, prompt, skill);
    const isAccessible = isInteractive
      ? isMacroStepAccessible(index, steps, runResults, nodeHasFiles)
      : true;
    const isLocked = isInteractive && !isAccessible;
    const isActive = isInteractive && index === activeMacroIndex;

    const card = (
      <button
        aria-disabled={isLocked}
        className={clsx(styles['workflow-step'], {
          [styles['workflow-step--interactive']]: isInteractive,
          [styles['workflow-step--active']]: isActive,
          [styles['workflow-step--disabled']]: isLocked,
        })}
        disabled={isLocked}
        onClick={isInteractive ? () => handleMacroClick(index) : undefined}
        style={{ background: tagColor }}
        title={isLocked ? '请先完成上一节点的运行结果与文件产出' : undefined}
        type='button'>
        <span aria-hidden className={styles['workflow-step-index']}>
          {index + 1}
        </span>
        <span className={styles['workflow-step-icon']}>
          {isPrompt ? (
            <CommandIcon className='h-3.5 w-3.5' />
          ) : skill ? (
            <SkillIcon name={skill.name} size='sm' />
          ) : (
            <CuboidIcon className='h-3.5 w-3.5' />
          )}
        </span>
        <span className={styles['workflow-step-body']}>
          <span className={styles['workflow-step-title']}>{displayTitle}</span>
          <span className={styles['workflow-step-name']}>{displayRemark}</span>
        </span>
      </button>
    );

    return (
      <Tooltip
        key={step.nodeId}
        mouseEnterDelay={0.35}
        classNames={{ root: styles['workflow-step-tooltip-overlay'] }}
        placement='bottom'
        title={hoverContent}>
        {card}
      </Tooltip>
    );
  };

  const renderParallelStepCard = (step: IParallelStepViewModel, index: number) => {
    const readyCount = step.children.filter((child) =>
      isResourceOutputReady(child.nodeId, runResults, nodeHasFiles),
    ).length;
    const isAccessible = isInteractive
      ? isMacroStepAccessible(index, steps, runResults, nodeHasFiles)
      : true;
    const isLocked = isInteractive && !isAccessible;
    const isActive = isInteractive && index === activeMacroIndex;

    const popoverContent = (
      <ul className={styles['workflow-step-parallel-popover']}>
        {step.children.map((child, childIndex) => {
          const d = child.node.data;
          const isPrompt = d.resourceKind === 'prompt';
          const isChildReady = isResourceOutputReady(child.nodeId, runResults, nodeHasFiles);
          const isChildActive =
            isActive && isInteractive && childIndex === activeParallelChildIndex;

          return (
            <li key={child.nodeId}>
              <button
                className={clsx(styles['workflow-step-parallel-popover-item'], {
                  [styles['workflow-step-parallel-popover-item--active']]: isChildActive,
                })}
                disabled={!isInteractive}
                onClick={
                  isInteractive ? () => onParallelChildClick?.(index, childIndex) : undefined
                }
                type='button'>
                <span
                  aria-hidden
                  className={clsx(styles['workflow-step-parallel-popover-dot'], {
                    [styles['workflow-step-parallel-popover-dot--ready']]: isChildReady,
                  })}
                />
                <span className={styles['workflow-step-parallel-popover-icon']}>
                  {isPrompt ? (
                    <CommandIcon className='h-3.5 w-3.5' />
                  ) : (
                    <CuboidIcon className='h-3.5 w-3.5' />
                  )}
                </span>
                <span className={styles['workflow-step-parallel-popover-name']}>
                  {child.nodeName}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    );

    const card = (
      <button
        aria-disabled={isLocked}
        className={clsx(styles['workflow-step'], styles['workflow-step--parallel'], {
          [styles['workflow-step--interactive']]: isInteractive,
          [styles['workflow-step--active']]: isActive,
          [styles['workflow-step--disabled']]: isLocked,
        })}
        disabled={isLocked}
        onClick={isInteractive ? () => handleMacroClick(index) : undefined}
        style={{ background: WORKFLOW_PARALLEL_TAG_COLOR }}
        title={isLocked ? '请先完成上一节点的运行结果与文件产出' : undefined}
        type='button'>
        <span aria-hidden className={styles['workflow-step-index']}>
          {index + 1}
        </span>
        <span className={styles['workflow-step-icon']}>
          <GitBranchIcon className='h-3.5 w-3.5' />
        </span>
        <span className={styles['workflow-step-body']}>
          <span className={styles['workflow-step-title']}>
            {'并行'}
            <span
              className={styles['workflow-step-parallel-badge']}>{`×${step.children.length}`}</span>
          </span>
          <span
            className={
              styles['workflow-step-name']
            }>{`${readyCount}/${step.children.length} 已完成`}</span>
        </span>
      </button>
    );

    return (
      <Popover
        key={step.nodeId}
        content={popoverContent}
        mouseEnterDelay={0.25}
        placement='bottom'
        trigger='hover'>
        {card}
      </Popover>
    );
  };

  const renderMacroStepCard = (step: IMacroStepViewModel, index: number) => {
    if (step.kind === 'parallel') {
      return renderParallelStepCard(step, index);
    }
    return renderResourceStepCard(step, index);
  };

  if (steps.length === 0) {
    return null;
  }

  return (
    <div className={styles['workflow-steps-bar']}>
      <div className={styles['workflow-steps-track']}>
        {steps.map((step, index) => (
          <Fragment key={step.kind === 'parallel' ? step.nodeId : step.nodeId}>
            {index > 0 ? (
              <span
                aria-hidden
                className={clsx(styles['workflow-step-arrow'], {
                  [styles['workflow-step-arrow--disabled']]:
                    isInteractive && !isMacroStepAccessible(index, steps, runResults, nodeHasFiles),
                })}>
                <ChevronRightIcon className='h-4 w-4' />
              </span>
            ) : null}
            {renderMacroStepCard(step, index)}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

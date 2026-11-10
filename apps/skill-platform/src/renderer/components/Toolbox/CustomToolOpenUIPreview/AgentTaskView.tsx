import { emptyProjection, RunTimeline, useChatContext } from '@momo/aichat';
import type { ComponentRenderProps } from '@openuidev/react-lang';
import { ThemeProvider } from '@openuidev/react-ui';
import { useTrackAiChatGeneration } from '@renderer/hooks/useAiChatGenerationActivity';
import {
  harnessPort,
  resourceContext,
  uploadHarnessAttachments,
} from '@renderer/services/agent-runtime/client';
import { projectRuntimeView } from '@renderer/services/aichat/runtime-view';
import {
  executeToolTask,
  newToolTask,
  taskSources,
} from '@renderer/services/custom-tool/tool-task';
import { useToolTaskStore } from '@renderer/store/tool-task';
import { useSettingsStore } from '@renderer/store/settings';
import { Alert, Button } from 'antd';
import { CheckIcon, LoaderCircleIcon } from 'lucide-react';
import { lazy, Suspense, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { TaskBridge } from './TaskBridge';
import {
  FilePreviewView,
  ViewSourcesContext,
  ViewFileSelectionContext,
  ViewFileSelectionFeedbackContext,
} from './WorkspaceComponents';
import styles from './tool-task.module.less';

const ResultPreview = lazy(() =>
  import('./index').then((module) => ({ default: module.CustomToolOpenUIPreview })),
);
const controllers = new Map<string, AbortController>();

/** Generic task boundary: the generated input tree owns its fields and business vocabulary. */
export function AgentTaskView({
  props,
  renderNode,
  statementId,
}: ComponentRenderProps<Record<string, unknown>>) {
  const bridge = useContext(TaskBridge);
  const key = `${bridge.key}:${statementId || 'agent-task'}`;
  const snapshot = useToolTaskStore((state) => state.tasks[key]);
  const setTask = useToolTaskStore((state) => state.setTask);
  const { currentModel, currentProjectId } = useChatContext();
  const models = useSettingsStore((state) => state.aiModels);
  const [error, setError] = useState('');
  const [inputVisible, setInputVisible] = useState(false);
  const lock = useRef(false);
  const busy = controllers.has(key);
  useTrackAiChatGeneration('toolbox', busy);

  const attachFiles = useCallback(
    async (files: File[]) => {
      if (lock.current || controllers.has(key) || bridge.disabled) return false;
      lock.current = true;
      setError('');
      try {
        const current = useToolTaskStore.getState().tasks[key];
        if ((current?.sources?.length || 0) + files.length > 10)
          throw new Error('单次任务最多 10 个附件');
        const uploaded = await uploadHarnessAttachments(files);
        const previous = useToolTaskStore.getState().tasks[key] || newToolTask();
        const sources = [
          ...(previous.sources || []),
          ...uploaded.flatMap((file) => (file.sourceRef ? [file.sourceRef] : [])),
        ];
        if (sources.length > 10) throw new Error('单次任务最多 10 个附件');
        setTask(key, { ...previous, sources });
        return true;
      } catch (error) {
        setError((error as Error).message);
        return false;
      } finally {
        lock.current = false;
      }
    },
    [bridge.disabled, key, setTask],
  );

  const submit = useCallback(
    async (submission: { message: string; formState?: Record<string, unknown> }) => {
      if (lock.current || controllers.has(key) || bridge.disabled) return false;
      const model =
        models.find((model) => model.type === 'chat' && model.id === currentModel) ||
        models.find((model) => model.type === 'chat' && model.isDefault) ||
        models.find((model) => model.type === 'chat');
      if (!model) {
        setError('请先配置对话模型');
        return false;
      }
      lock.current = true;
      setError('');
      setInputVisible(false);
      const controller = new AbortController();
      controllers.set(key, controller);
      const previous = useToolTaskStore.getState().tasks[key] || newToolTask();
      const projectId =
        previous.projectId || resourceContext(currentProjectId ?? undefined).projectId;
      const initial = { ...previous, projectId, error: undefined, projection: emptyProjection() };
      setTask(key, initial);
      try {
        const projection = await executeToolTask({
          sessionId: previous.sessionId,
          projectId,
          modelId: model.id,
          sources: previous.sources || [],
          instruction: String(props.instruction || ''),
          submission,
          skill: typeof props.skill === 'string' ? props.skill : undefined,
          signal: controller.signal,
          onUpdate: (projection) => setTask(key, { ...initial, projection }),
        });
        setTask(key, { ...initial, projection });
        return projection.status === 'completed';
      } catch (error) {
        const latest = useToolTaskStore.getState().tasks[key] || initial;
        setTask(key, {
          ...latest,
          error: controller.signal.aborted ? '任务已停止，可以重试' : (error as Error).message,
          projection: {
            ...latest.projection,
            status: controller.signal.aborted ? 'cancelled' : 'failed',
          },
        });
        return false;
      } finally {
        lock.current = false;
        controllers.delete(key);
        setTask(key, { ...useToolTaskStore.getState().tasks[key] });
      }
    },
    [
      bridge.disabled,
      key,
      models,
      currentModel,
      currentProjectId,
      props.instruction,
      props.skill,
      setTask,
    ],
  );

  useEffect(() => {
    bridge.register(key, { submit, attachFiles });
    return () => bridge.register(key);
  }, [bridge.register, key, submit, attachFiles]);
  const projection = snapshot?.projection;
  const view = projection && projectRuntimeView(projection.content, busy);
  const finished = projection?.status === 'completed' && !snapshot?.error && Boolean(view);
  const labels =
    Array.isArray(props.steps) && props.steps.length === 3
      ? props.steps.map(String)
      : ['填写信息', '执行任务', '查看结果'];
  const step = finished && !inputVisible ? 2 : busy ? 1 : 0;
  return (
    <ThemeProvider mode='light' cssSelector={`.${styles.task}`}>
      <section className={styles.task} aria-label={String(props.title || '工具任务')}>
        <div className={styles.steps} aria-label='任务步骤'>
          {labels.map((label, index) => (
            <div
              key={index}
              className={`${styles.step} ${index <= step ? styles.active : ''}`}
              aria-current={index === step ? 'step' : undefined}>
              <span>{index < step ? <CheckIcon size={15} /> : index + 1}</span>
              {label}
            </div>
          ))}
        </div>
        <h2>{String(props.title || '')}</h2>
        {error || snapshot?.error ? (
          <Alert showIcon type='error' message={error || snapshot?.error} />
        ) : null}
        <div hidden={Boolean((finished && !inputVisible) || busy)} className={styles.uploadCard}>
          <ViewFileSelectionContext.Provider value={attachFiles}>
            <ViewFileSelectionFeedbackContext.Provider value='文件已添加，提交后继续处理。'>
              {renderNode(props.children)}
            </ViewFileSelectionFeedbackContext.Provider>
          </ViewFileSelectionContext.Provider>
          {snapshot?.sources?.map((source) => (
            <div className={styles.file} key={source.sourceId}>
              <strong>{source.name}</strong>
              <Button
                disabled={busy}
                onClick={() =>
                  setTask(key, {
                    ...snapshot,
                    sources: snapshot.sources?.filter((item) => item.sourceId !== source.sourceId),
                  })
                }>
                移除
              </Button>
            </div>
          ))}
        </div>
        {busy ? (
          <div className={styles.progress} role='status'>
            <LoaderCircleIcon className={styles.spinning} size={19} />
            正在处理…<Button onClick={() => controllers.get(key)?.abort()}>停止任务</Button>
          </div>
        ) : null}
        {view && !snapshot?.error && !inputVisible ? (
          <>
            <div className={styles.resultHeader}>
              <strong>{labels[2]}</strong>
              <Button disabled={busy} onClick={() => setInputVisible(true)}>
                修改输入
              </Button>
            </div>
            <div
              className={styles.resultLayout}
              data-original={Boolean(props.previewOriginal && snapshot?.sources?.length)}>
              <div className={styles.analysis}>
                <Suspense fallback={<p>正在显示结果…</p>}>
                  <ResultPreview
                    runtimeKey={`${key}:result`}
                    content={view.content}
                    title={String(props.title || '任务结果')}
                    presentation='chat'
                    components={{}}
                    sourceRefs={snapshot ? taskSources(snapshot) : []}
                    streaming={busy}
                    onSubmit={submit}
                    onSelectFiles={attachFiles}
                  />
                </Suspense>
              </div>
              {props.previewOriginal && snapshot?.sources?.[0] ? (
                <ViewSourcesContext.Provider value={snapshot.sources}>
                  <FilePreviewView props={{ sourceId: snapshot.sources[0].sourceId }} />
                </ViewSourcesContext.Provider>
              ) : null}
            </div>
          </>
        ) : null}
        {projection?.events.length ? (
          <div className={styles.timeline}>
            <RunTimeline
              events={projection.events}
              status={projection.status}
              respond={(answer) => harnessPort.respond(answer)}
              uploadFiles={async (files) =>
                (await uploadHarnessAttachments(files)).flatMap((file) =>
                  file.sourceRef ? [file.sourceRef] : [],
                )
              }
            />
          </div>
        ) : null}
      </section>
    </ThemeProvider>
  );
}

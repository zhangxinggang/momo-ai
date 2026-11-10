import { emptyProjection, RunTimeline, useChatContext, type RunProjection } from '@momo/aichat';
import { useIsStreaming, type ComponentRenderProps } from '@openuidev/react-lang';
import {
  harnessPort,
  resourceContext,
  uploadHarnessAttachments,
} from '@renderer/services/agent-runtime/client';
import { projectRuntimeView } from '@renderer/services/aichat/runtime-view';
import {
  executeFileTask,
  newToolTask,
  taskSources,
} from '@renderer/services/custom-tool/tool-task';
import { useToolTaskStore } from '@renderer/store/tool-task';
import { useSettingsStore } from '@renderer/store/settings';
import { useTrackAiChatGeneration } from '@renderer/hooks/useAiChatGenerationActivity';
import { Alert, Button } from 'antd';
import { CheckIcon, FileTextIcon, LoaderCircleIcon, UploadCloudIcon, XIcon } from 'lucide-react';
import { createContext, lazy, Suspense, useContext, useRef, useState } from 'react';
import { FilePreviewView, ViewSourcesContext } from './WorkspaceComponents';
import styles from './tool-task.module.less';

export const FileTaskScope = createContext({ key: '', disabled: false });
const ResultPreview = lazy(() =>
  import('./index').then((module) => ({ default: module.CustomToolOpenUIPreview })),
);
const controllers = new Map<string, AbortController>();

export function FileTaskView({
  props,
  statementId,
}: ComponentRenderProps<Record<string, unknown>>) {
  const scope = useContext(FileTaskScope);
  const streaming = useIsStreaming();
  const key = `${scope.key}:${statementId || 'file-task'}`;
  const snapshot = useToolTaskStore((state) => state.tasks[key]);
  const setTask = useToolTaskStore((state) => state.setTask);
  const { currentModel, currentProjectId } = useChatContext();
  const models = useSettingsStore((state) => state.aiModels);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState('');
  const [showResult, setShowResult] = useState(true);
  const fileInput = useRef<HTMLInputElement>(null);
  const lock = useRef(false);
  const busy = controllers.has(key);
  useTrackAiChatGeneration('toolbox', busy);
  const disabled = scope.disabled || streaming || busy || uploading;
  const source = snapshot?.source;
  const projection = snapshot?.projection;
  const view =
    projection && projectRuntimeView(projection.content, projection.status === 'running' && busy);
  const finished =
    !snapshot?.error &&
    projection?.status === 'completed' &&
    Boolean(view && view.status === 'complete');
  const resultVisible = showResult && (finished || (busy && Boolean(view)));
  const accept = String(props.accept || '.pdf,.docx');
  const title = String(props.title || '上传文件，开始分析');
  const labels =
    Array.isArray(props.steps) && props.steps.length === 3
      ? props.steps.map(String)
      : ['上传文件', '处理文件', '查看结果'];

  const select = async (files: File[]) => {
    if (disabled || lock.current || !files.length) return;
    setLocalError('');
    if (files.length !== 1) {
      setLocalError('每次仅支持上传一个文件');
      return;
    }
    const file = files[0];
    const extensions = accept.split(',').map((item) => item.trim().toLowerCase());
    if (
      !extensions.some((ext) =>
        ext.startsWith('.') ? file.name.toLowerCase().endsWith(ext) : file.type === ext,
      )
    ) {
      setLocalError(`请选择 ${accept} 文件`);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setLocalError('文件大小不能超过 10 MB');
      return;
    }
    lock.current = true;
    setUploading(true);
    try {
      const [attachment] = await uploadHarnessAttachments([file]);
      if (!attachment.sourceRef) throw new Error('原文件上传失败，请重试');
      setTask(key, { ...newToolTask(), source: attachment.sourceRef });
      setShowResult(false);
    } catch (error) {
      setLocalError((error as Error).message);
    } finally {
      lock.current = false;
      setUploading(false);
    }
  };
  const run = async (submission?: { message: string; formState?: Record<string, unknown> }) => {
    if (disabled || lock.current || !snapshot?.source) return false;
    const model =
      models.find((model) => model.id === currentModel && model.type === 'chat') ||
      models.find((model) => model.type === 'chat' && model.isDefault) ||
      models.find((model) => model.type === 'chat');
    if (!model) {
      setLocalError('请先在设置中配置对话模型');
      return false;
    }
    lock.current = true;
    const controller = new AbortController();
    controllers.set(key, controller);
    const projectId =
      snapshot.projectId || resourceContext(currentProjectId ?? undefined).projectId;
    const initial = { ...snapshot, projectId, projection: emptyProjection(), error: undefined };
    setTask(key, initial);
    setLocalError('');
    setShowResult(true);
    const update = (projection: RunProjection) => setTask(key, { ...initial, projection });
    try {
      const projection = await executeFileTask({
        sessionId: snapshot.sessionId,
        projectId,
        modelId: model.id,
        source: snapshot.source,
        instruction: String(props.instruction || '完整分析上传文件并生成结果界面'),
        skill: typeof props.skill === 'string' ? props.skill : undefined,
        submission,
        signal: controller.signal,
        onUpdate: update,
      });
      update(projection);
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
      controllers.delete(key);
      lock.current = false;
      setTask(key, { ...useToolTaskStore.getState().tasks[key] });
    }
  };

  return (
    <section className={styles.task} aria-label={title}>
      <div className={styles.steps} aria-label='任务步骤'>
        {labels.map((label, index) => {
          const step = finished && showResult ? 2 : busy ? 1 : 0;
          return (
            <div
              key={label}
              className={`${styles.step} ${index <= step ? styles.active : ''}`}
              aria-current={index === step ? 'step' : undefined}>
              <span>{index < step ? <CheckIcon size={15} /> : index + 1}</span>
              {label}
            </div>
          );
        })}
      </div>
      {localError || snapshot?.error ? (
        <Alert showIcon type='error' message={localError || snapshot?.error} />
      ) : null}
      {!resultVisible ? (
        <div className={styles.uploadCard}>
          <h2>{title}</h2>
          <p>{String(props.description || '上传原始文件，自动提取关键信息并生成分析结果')}</p>
          <div
            className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
            role='button'
            tabIndex={disabled ? -1 : 0}
            aria-label='选择或拖拽上传文件'
            aria-disabled={disabled}
            onClick={() => !disabled && fileInput.current?.click()}
            onKeyDown={(event) => {
              if (!disabled && ['Enter', ' '].includes(event.key)) {
                event.preventDefault();
                fileInput.current?.click();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              if (!disabled) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              void select(Array.from(event.dataTransfer.files));
            }}>
            {uploading ? (
              <LoaderCircleIcon className={styles.spinning} size={38} />
            ) : (
              <UploadCloudIcon size={40} strokeWidth={1.4} />
            )}
            <strong>{uploading ? '正在上传原文件…' : '点击或拖拽上传文件'}</strong>
            <div className={styles.formats}>
              {accept.split(',').map((format) => (
                <span key={format}>
                  <FileTextIcon size={20} />
                  <small>{format.replace('.', '').toUpperCase()}</small>
                </span>
              ))}
            </div>
            <small>支持 {accept.replaceAll('.', '').toUpperCase()}，单个文件不超过 10 MB</small>
          </div>
          <input
            ref={fileInput}
            hidden
            type='file'
            accept={accept}
            aria-label='上传原文件'
            disabled={disabled}
            onChange={(event) => {
              void select(Array.from(event.target.files || []));
              event.target.value = '';
            }}
          />
          {source ? (
            <div className={styles.file}>
              <FileTextIcon size={18} />
              <strong>{source.name}</strong>
              <span>{Math.ceil(source.size / 1024)} KB</span>
              <Button
                type='text'
                aria-label='移除文件'
                disabled={disabled}
                icon={<XIcon size={15} />}
                onClick={() => setTask(key, newToolTask())}
              />
            </div>
          ) : null}
          <div className={styles.actions}>
            <Button type='primary' disabled={disabled || !source} onClick={() => void run()}>
              {snapshot?.error ? '重新处理' : labels[1]}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.resultHeader}>
            <strong>{source?.name}</strong>
            <Button disabled={busy} onClick={() => setShowResult(false)}>
              重新上传
            </Button>
          </div>
          <div className={styles.resultLayout} data-original={props.previewOriginal !== false}>
            <div className={styles.analysis}>
              <Suspense fallback={<p>正在显示结果…</p>}>
                <ResultPreview
                  content={view?.content || ''}
                  title={labels[2]}
                  components={{}}
                  presentation='chat'
                  sourceRefs={snapshot ? taskSources(snapshot) : []}
                  streaming={busy}
                  runtimeKey={`${key}:result`}
                  onSubmit={run}
                />
              </Suspense>
            </div>
            {source && props.previewOriginal !== false ? (
              <ViewSourcesContext.Provider value={[source]}>
                <FilePreviewView props={{ sourceId: source.sourceId, height: 640 }} />
              </ViewSourcesContext.Provider>
            ) : null}
          </div>
        </>
      )}
      {busy && !resultVisible ? (
        <div className={styles.progress} role='status'>
          <LoaderCircleIcon className={styles.spinning} size={19} />
          正在读取文件并分析，请稍候…
        </div>
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
      {busy ? <Button onClick={() => controllers.get(key)?.abort()}>停止任务</Button> : null}
    </section>
  );
}

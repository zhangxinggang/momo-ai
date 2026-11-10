import type { ToolPageActions } from '@/shared/tool-page';
import { reportSchema } from '@/shared/tool-page';
import { useChatContext } from '@momo/aichat';
import { useTrackAiChatGeneration } from '@renderer/hooks/useAiChatGenerationActivity';
import { isPageRequest, toolPageSource } from '@renderer/services/custom-tool/page-bridge';
import {
  isPageTaskRunning,
  pageTaskKey,
  runPageTask,
  stopPageTask,
} from '@renderer/services/custom-tool/page-runtime';
import { taskSources } from '@renderer/services/custom-tool/tool-task';
import { useSettingsStore } from '@renderer/store/settings';
import { useToolTaskStore } from '@renderer/store/tool-task';
import { ArrowLeftIcon, DownloadIcon, LoaderCircleIcon, SquareIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ViewSourcesContext } from '../CustomToolOpenUIPreview/WorkspaceComponents';
import { ReportView } from './ReportView';
import styles from './index.module.less';
import { exportToolReport } from './report-export';

export function CustomToolPagePreview({
  toolId,
  title,
  content,
  actions = {},
  disabled = false,
}: {
  toolId: string;
  title: string;
  content: string;
  actions?: ToolPageActions;
  disabled?: boolean;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const { currentModel, currentProjectId } = useChatContext();
  const models = useSettingsStore((state) => state.aiModels);
  const key = pageTaskKey(toolId, currentProjectId ?? undefined, actions);
  const snapshot = useToolTaskStore((state) => state.tasks[key]);
  const busy = isPageTaskRunning(key);
  useTrackAiChatGeneration('toolbox', busy);
  const token = useMemo(() => crypto.randomUUID(), [content, key]);
  const srcDoc = useMemo(() => toolPageSource(content, token), [content, token]);
  const [inputVisible, setInputVisible] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [frameHeight, setFrameHeight] = useState(600);
  const parsed = reportSchema.safeParse(snapshot?.result);
  const report = parsed.success ? parsed.data : undefined;
  const publicState = () => {
    const state = useToolTaskStore.getState().tasks[key];
    return {
      status: isPageTaskRunning(key) ? 'running' : state?.projection.status || 'idle',
      result: state?.result,
      error: state?.error,
      files: state?.sources?.map((source) => ({ name: source.name, size: source.size })) || [],
    };
  };
  const exportReport = async () => {
    if (exporting || busy) return;
    setExporting(true);
    setError('');
    try {
      await exportToolReport(useToolTaskStore.getState().tasks[key]?.result);
    } catch {
      setError('报告导出失败，请重试');
      throw new Error('报告导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };
  useEffect(() => {
    const receive = async (event: MessageEvent) => {
      if (!isPageRequest(event, frame.current?.contentWindow || null, token)) return;
      const { id, method, payload } = event.data;
      if (method === 'resize') {
        if (typeof payload?.height === 'number' && Number.isFinite(payload.height))
          setFrameHeight(Math.max(480, Math.min(10000, payload.height)));
        return;
      }
      const reply = (result?: unknown, error?: string) =>
        (event.source as Window).postMessage(
          { channel: 'momo-host', token, id, result, error },
          '*',
        );
      try {
        if (method === 'status') {
          reply(publicState());
          return;
        }
        if (disabled) throw new Error('请保存页面后再运行');
        if (method === 'stop') {
          stopPageTask(key);
          reply(true);
          return;
        }
        if (method === 'export') {
          await exportReport();
          reply(true);
          return;
        }
        if (
          method !== 'run' ||
          typeof payload?.action !== 'string' ||
          !Object.hasOwn(actions, payload.action)
        )
          throw new Error('此页面操作未配置');
        const model =
          models.find((model) => model.id === currentModel && model.type === 'chat') ||
          models.find((model) => model.type === 'chat' && model.isDefault) ||
          models.find((model) => model.type === 'chat');
        if (!model) throw new Error('请先在设置中配置对话模型');
        if (payload.files !== undefined && !Array.isArray(payload.files))
          throw new Error('上传文件格式无效');
        if (
          payload.fields !== undefined &&
          (!payload.fields || typeof payload.fields !== 'object' || Array.isArray(payload.fields))
        )
          throw new Error('输入内容格式无效');
        setInputVisible(false);
        setError('');
        reply(
          await runPageTask({
            key,
            action: actions[payload.action],
            modelId: model.id,
            projectId: currentProjectId ?? undefined,
            fields: payload.fields,
            files: payload.files,
          }),
        );
      } catch (error) {
        reply(undefined, error instanceof Error ? error.message : '处理失败，请重试');
      }
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [key, token, actions, models, currentModel, currentProjectId, disabled, exporting, busy]);
  useEffect(() => {
    frame.current?.contentWindow?.postMessage(
      { channel: 'momo-host', token, state: publicState() },
      '*',
    );
  }, [snapshot, busy, token]);
  return (
    <div className={styles.page}>
      {(snapshot?.error || error) && (
        <div role='alert' className={styles.error}>
          {error || snapshot?.error}
        </div>
      )}
      <iframe
        ref={frame}
        title={title}
        srcDoc={srcDoc}
        sandbox='allow-scripts allow-forms allow-downloads'
        referrerPolicy='no-referrer'
        className={styles.frame}
        style={{ height: frameHeight }}
        hidden={busy || Boolean(report && !inputVisible)}
      />
      {busy && (
        <section className={styles.progress} aria-label='正在处理文件'>
          <span className={styles.kicker}>文件分析</span>
          <h2>正在整理内容与原文依据</h2>
          <p>可切换到其他菜单，返回后继续查看最新进度。</p>
          <ul>
            {snapshot?.sources?.map((source) => (
              <li key={source.sourceId}>{source.name}</li>
            ))}
          </ul>
          <div role='status'>
            <LoaderCircleIcon size={18} className={styles.spinner} />
            {snapshot?.projection.events.some((event) => event.type.startsWith('tool.'))
              ? '正在读取、分析并核对结果…'
              : '正在准备任务…'}
          </div>
          <button type='button' className={styles.secondary} onClick={() => stopPageTask(key)}>
            <SquareIcon size={14} />
            停止处理
          </button>
        </section>
      )}
      {report && !busy && !inputVisible && (
        <ViewSourcesContext.Provider value={snapshot ? taskSources(snapshot) : []}>
          <div className={styles.toolbar}>
            <button
              type='button'
              className={styles.secondary}
              onClick={() => setInputVisible(true)}>
              <ArrowLeftIcon size={16} />
              返回上传
            </button>
            <button
              type='button'
              className={styles.primary}
              disabled={exporting}
              onClick={() => void exportReport().catch(() => {})}>
              <DownloadIcon size={16} />
              {exporting ? '正在导出…' : '导出完整报告'}
            </button>
          </div>
          <ReportView report={report} />
        </ViewSourcesContext.Provider>
      )}
    </div>
  );
}

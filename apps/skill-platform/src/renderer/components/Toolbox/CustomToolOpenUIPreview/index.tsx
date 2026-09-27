import type { ICustomToolComponentConfig } from '@/types/modules';
import { isFileQuestion } from '@momo/agent-contracts';
import type { IChatSourceRef } from '@momo/aichat';
import { parseApiResponseBody } from '@momo/api-request/core';
import {
  BuiltinActionType,
  createLibrary,
  Renderer,
  type ActionEvent,
  type ComponentRenderProps,
  type OpenUIError,
} from '@openuidev/react-lang';
import { createTheme, ThemeProvider } from '@openuidev/react-ui';
import '@openuidev/react-ui/components.css';
import '@openuidev/react-ui/defaults.css';
import { GeneratedMarkdown } from './GeneratedMarkdown';
import { executeConfiguredApiRequest } from '@renderer/services/custom-tool/api';
import { momoOpenuiLibrary } from '@renderer/services/custom-tool/openui-library';
import { Alert, Empty } from 'antd';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from 'react';

import styles from './index.module.less';
import { MeasuredChart } from './MeasuredChart';
import {
  FileInputView,
  FilePreviewView,
  PlainTextView,
  SplitPaneView,
  TabsView,
  ViewFileSelectionContext,
  ViewSourcesContext,
} from './WorkspaceComponents';

interface ISelection {
  id: string;
  componentType: string;
  props: Record<string, unknown>;
}

interface IProps {
  content: string;
  title: string;
  components: Record<string, ICustomToolComponentConfig>;
  editing?: boolean;
  selectedId?: string | null;
  streaming?: boolean;
  onSelect?: (selection: ISelection) => void;
  presentation?: 'chat' | 'toolbox';
  sourceRefs?: IChatSourceRef[];
  onSelectFiles?: (files: File[]) => Promise<boolean>;
  onSubmit?: (input: { message: string; formState?: Record<string, unknown> }) => Promise<boolean>;
  busy?: boolean;
}

interface IEditorRuntime {
  components: Record<string, ICustomToolComponentConfig>;
  editing: boolean;
  selectedId: string | null;
  onSelect?: (selection: ISelection) => void;
  presentation?: 'chat' | 'toolbox';
}

const EditorRuntimeContext = createContext<IEditorRuntime>({
  components: {},
  editing: false,
  selectedId: null,
});

const TECH_DARK_THEME = createTheme({
  background: '#031426',
  foreground: '#071e36',
  popoverBackground: '#0c2b4a',
  sunkLight: 'rgba(25, 211, 255, 0.035)',
  sunk: 'rgba(25, 211, 255, 0.06)',
  sunkDeep: 'rgba(25, 211, 255, 0.1)',
  elevatedLight: 'rgba(25, 211, 255, 0.055)',
  elevated: 'rgba(25, 211, 255, 0.09)',
  elevatedStrong: 'rgba(25, 211, 255, 0.16)',
  highlight: 'rgba(25, 211, 255, 0.08)',
  highlightStrong: 'rgba(25, 211, 255, 0.14)',
  textNeutralPrimary: '#e8f8ff',
  textNeutralSecondary: 'rgba(184, 220, 234, 0.72)',
  textNeutralTertiary: 'rgba(184, 220, 234, 0.42)',
  textNeutralLink: '#69f0ff',
  textBrand: '#19d3ff',
  textInfoPrimary: '#69f0ff',
  interactiveAccentDefault: '#19d3ff',
  interactiveAccentHover: '#69f0ff',
  interactiveAccentPressed: '#12aee0',
  interactiveAccentDisabled: 'rgba(25, 211, 255, 0.38)',
  borderDefault: 'rgba(105, 240, 255, 0.13)',
  borderInteractive: 'rgba(105, 240, 255, 0.24)',
  borderInteractiveEmphasis: 'rgba(105, 240, 255, 0.48)',
  borderInteractiveSelected: '#69f0ff',
  borderAccent: 'rgba(25, 211, 255, 0.2)',
  borderAccentEmphasis: 'rgba(25, 211, 255, 0.62)',
  defaultChartPalette: ['#19d3ff', '#3182ff', '#2de2b7', '#a78bfa', '#fbbf24', '#fb7185'],
  barChartPalette: ['#19d3ff', '#3182ff', '#2de2b7', '#a78bfa', '#fbbf24'],
  lineChartPalette: ['#19d3ff', '#69f0ff', '#7c5cff', '#2de2b7', '#fbbf24'],
  areaChartPalette: ['#19d3ff', '#3182ff', '#7c5cff', '#2de2b7'],
  pieChartPalette: ['#19d3ff', '#3182ff', '#2de2b7', '#a78bfa', '#fbbf24', '#fb7185'],
  horizontalBarChartPalette: ['#19d3ff', '#3182ff', '#2de2b7', '#a78bfa', '#fbbf24'],
  fontBody: 'Inter, "PingFang SC", "Microsoft YaHei", sans-serif',
  fontHeading: 'Bahnschrift, Inter, "PingFang SC", "Microsoft YaHei", sans-serif',
  fontLabel: 'Inter, "PingFang SC", "Microsoft YaHei", sans-serif',
  fontNumbers: 'Bahnschrift, "DIN Alternate", Inter, sans-serif',
  radius3xl: '12px',
  shadowM: '0 12px 36px rgba(0, 7, 20, 0.28)',
  shadowXl: '0 20px 60px rgba(0, 7, 20, 0.42)',
});

function readResponsePath(value: unknown, responsePath: string): unknown {
  const segments = responsePath
    .trim()
    .replace(/^\$\.?/, '')
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean);
  return segments.reduce<unknown>((current, segment) => {
    if (current == null || typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[segment];
  }, value);
}

function useConfiguredData(config: ICustomToolComponentConfig | undefined): {
  value: unknown;
  error: string;
} {
  const [remoteValue, setRemoteValue] = useState<unknown>();
  const [error, setError] = useState('');
  const requestSignature = JSON.stringify(config?.data.request ?? null);
  const responsePath = config?.data.responsePath ?? '';
  const pollingEnabled = Boolean(config?.data.polling.enabled);
  const pollingInterval = Math.max(1_000, config?.data.polling.intervalMs ?? 30_000);

  useEffect(() => {
    if (config?.data.mode !== 'api' || !config.data.request.url.trim()) {
      setRemoteValue(undefined);
      setError('');
      return;
    }
    let active = true;
    let timer: ReturnType<typeof setInterval> | undefined;
    const run = async () => {
      try {
        const response = await executeConfiguredApiRequest(config.data.request);
        if (!active) return;
        const parsed = parseApiResponseBody(response);
        setRemoteValue(responsePath ? readResponsePath(parsed, responsePath) : parsed);
        setError(response.ok ? '' : `接口返回 ${response.status}`);
      } catch (requestError) {
        if (active)
          setError(requestError instanceof Error ? requestError.message : String(requestError));
      }
    };
    const start = setTimeout(() => {
      void run();
      if (pollingEnabled) timer = setInterval(() => void run(), pollingInterval);
    }, 250);
    return () => {
      active = false;
      clearTimeout(start);
      if (timer) clearInterval(timer);
    };
  }, [config?.data.mode, pollingEnabled, pollingInterval, requestSignature, responsePath]);

  return {
    value: config?.data.mode === 'static' ? config.data.staticValue : remoteValue,
    error,
  };
}

function EditableComponent({
  definition,
  renderProps,
}: {
  definition: (typeof momoOpenuiLibrary.components)[string];
  renderProps: ComponentRenderProps<Record<string, unknown>>;
}) {
  const runtime = useContext(EditorRuntimeContext);
  const id = renderProps.statementId;
  const config = id ? runtime.components[id] : undefined;
  const data = useConfiguredData(config);
  const resolvedProps = { ...renderProps.props, ...(config?.props ?? {}) };
  if (config?.data.targetProp) resolvedProps[config.data.targetProp] = data.value;
  const Original =
    definition.name === 'FileInput' ||
    (['Input', 'TextArea'].includes(definition.name) &&
      isFileQuestion({
        id: String(resolvedProps.name ?? ''),
        question: String(resolvedProps.placeholder ?? ''),
      }))
      ? FileInputView
      : definition.name === 'SplitPane'
        ? SplitPaneView
        : definition.name === 'FilePreview'
          ? FilePreviewView
          : definition.name === 'Tabs'
            ? TabsView
            : definition.name === 'PlainText'
              ? PlainTextView
              : definition.component;
  const original = <Original {...renderProps} props={resolvedProps} />;
  const rendered =
    definition.name === 'MarkDownRenderer' ? (
      <div
        className={styles.markdown}
        data-variant={
          resolvedProps.variant === 'card' || resolvedProps.variant === 'sunk'
            ? resolvedProps.variant
            : undefined
        }>
        <GeneratedMarkdown
          value={String(resolvedProps.textMarkdown ?? '')}
          theme={runtime.presentation === 'chat' ? 'light' : 'dark'}
        />
      </div>
    ) : definition.name.endsWith('Chart') ? (
      <MeasuredChart height={resolvedProps.height}>{original}</MeasuredChart>
    ) : (
      original
    );
  if (!id) return rendered;

  const select = (event: MouseEvent<HTMLDivElement>) => {
    if (!runtime.editing) return;
    event.preventDefault();
    event.stopPropagation();
    runtime.onSelect?.({ id, componentType: definition.name, props: renderProps.props });
  };
  return (
    <div
      className={styles.selectable}
      data-editing={runtime.editing || undefined}
      data-selected={runtime.selectedId === id || undefined}
      data-component-label={`${definition.name} · ${id}`}
      onClick={select}>
      {data.error ? <div className={styles.dataError}>{data.error}</div> : null}
      {rendered}
    </div>
  );
}

const editableOpenuiLibrary = createLibrary({
  components: Object.values(momoOpenuiLibrary.components).map((definition) => ({
    ...definition,
    component: (renderProps: ComponentRenderProps<Record<string, unknown>>) => (
      <EditableComponent definition={definition} renderProps={renderProps} />
    ),
  })),
  componentGroups: momoOpenuiLibrary.componentGroups,
  root: momoOpenuiLibrary.root,
  id: 'momo-custom-tool-editor',
});

export function CustomToolOpenUIPreview({
  content,
  title,
  components,
  editing,
  selectedId,
  streaming,
  onSelect,
  presentation = 'toolbox',
  sourceRefs = [],
  onSelectFiles,
  onSubmit,
  busy,
}: IProps) {
  const [errors, setErrors] = useState<OpenUIError[]>([]);
  const [actionError, setActionError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const submitAction = async (event: ActionEvent) => {
    if (submittingRef.current || busy || streaming || editing) return;
    setActionError('');
    if (!onSubmit) {
      setActionError('当前界面没有连接到 AI 对话，无法提交处理。');
      return;
    }
    if (event.type === BuiltinActionType.OpenUrl) {
      setActionError('此按钮是链接操作，无法作为解析请求提交。');
      return;
    }
    const message = event.humanFriendlyMessage?.trim();
    if (!message) {
      setActionError('按钮缺少操作说明，请在对话框输入处理要求。');
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const sent = await onSubmit({ message, formState: event.formState });
      if (!sent) setActionError('暂未提交，请等待文件上传完成或当前对话结束后重试。');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '提交失败，请重试。');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };
  const runtime = useMemo<IEditorRuntime>(
    () => ({
      components,
      editing: Boolean(editing),
      selectedId: selectedId ?? null,
      onSelect,
      presentation,
    }),
    [components, editing, onSelect, selectedId, presentation],
  );
  return (
    <EditorRuntimeContext.Provider value={runtime}>
      <ViewSourcesContext.Provider value={sourceRefs}>
        <ViewFileSelectionContext.Provider value={onSelectFiles}>
          <div
            className={`${styles.preview} ${presentation === 'chat' ? styles.chat : ''}`}
            aria-label={title}>
            {actionError && <Alert type='error' message={actionError} showIcon />}
            {submitting && <div role='status'>正在提交并处理…</div>}
            {errors.length && !streaming ? (
              <Alert
                type='error'
                showIcon
                message='界面无法完整渲染'
                description={errors
                  .map((error) => error.message.replace(/openui/gi, '界面源码'))
                  .join('；')}
              />
            ) : null}
            <ThemeProvider
              mode={presentation === 'chat' ? 'light' : 'dark'}
              darkTheme={TECH_DARK_THEME}
              cssSelector={`.${styles.surface}`}>
              <div className={styles.surface}>
                {content.trim() ? (
                  <Renderer
                    response={content}
                    library={editableOpenuiLibrary}
                    isStreaming={Boolean(streaming || busy || submitting)}
                    onAction={(event) => void submitAction(event)}
                    onError={setErrors}
                  />
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={streaming ? '正在生成工具界面…' : '描述需求后生成工具界面'}
                  />
                )}
              </div>
            </ThemeProvider>
          </div>
        </ViewFileSelectionContext.Provider>
      </ViewSourcesContext.Provider>
    </EditorRuntimeContext.Provider>
  );
}

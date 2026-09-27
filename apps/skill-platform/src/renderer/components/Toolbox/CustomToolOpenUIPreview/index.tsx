import type { ICustomToolComponentConfig } from '@/types/modules';
import { parseApiResponseBody } from '@momo/api-request/core';
import {
  createLibrary,
  Renderer,
  type ComponentRenderProps,
  type OpenUIError,
} from '@openuidev/react-lang';
import '@openuidev/react-ui/components.css';
import '@openuidev/react-ui/defaults.css';
import { openuiLibrary } from '@openuidev/react-ui/genui-lib';
import { executeConfiguredApiRequest } from '@renderer/services/custom-tool/api';
import { Alert, Empty } from 'antd';
import { createContext, useContext, useEffect, useMemo, useState, type MouseEvent } from 'react';

import styles from './index.module.less';

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
}

interface IEditorRuntime {
  components: Record<string, ICustomToolComponentConfig>;
  editing: boolean;
  selectedId: string | null;
  onSelect?: (selection: ISelection) => void;
}

const EditorRuntimeContext = createContext<IEditorRuntime>({
  components: {},
  editing: false,
  selectedId: null,
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
  definition: (typeof openuiLibrary.components)[string];
  renderProps: ComponentRenderProps<Record<string, unknown>>;
}) {
  const runtime = useContext(EditorRuntimeContext);
  const id = renderProps.statementId;
  const config = id ? runtime.components[id] : undefined;
  const data = useConfiguredData(config);
  const resolvedProps = { ...renderProps.props, ...(config?.props ?? {}) };
  if (config?.data.targetProp) resolvedProps[config.data.targetProp] = data.value;
  const Original = definition.component;
  if (!id) return <Original {...renderProps} props={resolvedProps} />;

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
      <Original {...renderProps} props={resolvedProps} />
    </div>
  );
}

const editableOpenuiLibrary = createLibrary({
  components: Object.values(openuiLibrary.components).map((definition) => ({
    ...definition,
    component: (renderProps: ComponentRenderProps<Record<string, unknown>>) => (
      <EditableComponent definition={definition} renderProps={renderProps} />
    ),
  })),
  componentGroups: openuiLibrary.componentGroups,
  root: openuiLibrary.root,
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
}: IProps) {
  const [errors, setErrors] = useState<OpenUIError[]>([]);
  const runtime = useMemo<IEditorRuntime>(
    () => ({ components, editing: Boolean(editing), selectedId: selectedId ?? null, onSelect }),
    [components, editing, onSelect, selectedId],
  );
  return (
    <EditorRuntimeContext.Provider value={runtime}>
      <div className={styles.preview} aria-label={title}>
        {errors.length && !streaming ? (
          <Alert
            type='error'
            showIcon
            message='OpenUI 无法完整渲染'
            description={errors.map((error) => error.message).join('；')}
          />
        ) : null}
        <div className={styles.surface}>
          {content.trim() ? (
            <Renderer
              response={content}
              library={editableOpenuiLibrary}
              isStreaming={Boolean(streaming)}
              onError={setErrors}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={streaming ? '正在生成 OpenUI…' : '描述需求后生成工具界面'}
            />
          )}
        </div>
      </div>
    </EditorRuntimeContext.Provider>
  );
}

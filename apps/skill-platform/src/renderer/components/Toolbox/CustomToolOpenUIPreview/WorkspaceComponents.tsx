import type { IChatSourceRef } from '@momo/aichat';
import { BinaryFilePreview } from '@momo/file-editor';
import { useIsStreaming, useStateField, type ComponentRenderProps } from '@openuidev/react-lang';
import { harnessSourceStore } from '@renderer/services/agent-runtime/client';
import { fetchFilePreviewBaseUrl } from '@renderer/services/system';
import { Alert } from 'antd';
import { createContext, useContext, useEffect, useId, useState } from 'react';
import styles from './index.module.less';

export const ViewSourcesContext = createContext<IChatSourceRef[]>([]);
export const ViewFileSelectionContext = createContext<
  ((files: File[]) => Promise<boolean>) | undefined
>(undefined);

export function FileInputView({ props }: ComponentRenderProps<Record<string, unknown>>) {
  const attachFiles = useContext(ViewFileSelectionContext);
  const streaming = useIsStreaming();
  const field = useStateField(String(props.name ?? 'files'), []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [names, setNames] = useState<string[]>([]);
  return (
    <div>
      <label>
        <span>{String(props.label ?? '选择文件')}</span>
        <input
          type='file'
          aria-label={String(props.label ?? '选择文件')}
          accept={typeof props.accept === 'string' ? props.accept : undefined}
          multiple={props.multiple === true}
          disabled={streaming || busy}
          onChange={async (event) => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = '';
            if (!files.length) return;
            setBusy(true);
            setError('');
            try {
              if (attachFiles && !(await attachFiles(files)))
                throw new Error('文件未全部添加，请检查对话输入框中的附件后重试。');
              setNames(files.map((file) => file.name));
              field.setValue(
                files.map((file) => ({ name: file.name, size: file.size, type: file.type })),
              );
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
      {busy && <p role='status'>正在添加文件…</p>}
      {names.map((name, index) => (
        <div key={`${index}:${name}`}>{name}</div>
      ))}
      {names.length > 0 && attachFiles && <p>文件已添加到对话输入框，发送消息即可继续。</p>}
      {names.length > 0 && !attachFiles && <p>已选择文件，仅保留在当前界面。</p>}
      {error && <p role='alert'>{error}</p>}
    </div>
  );
}

export function PlainTextView({ props }: ComponentRenderProps<Record<string, unknown>>) {
  return (
    <div className={styles.plainText} data-emphasis={props.emphasis}>
      {String(props.text ?? '')}
    </div>
  );
}

export function TabsView({ props, renderNode }: ComponentRenderProps<Record<string, unknown>>) {
  const items = (Array.isArray(props.items) ? props.items : []).filter(
    (item) => item?.props?.value != null,
  );
  const [selected, setSelected] = useState<string>();
  const active = items.find((item) => item.props.value === selected) ?? items[0];
  const id = useId();
  if (!active) return null;
  return (
    <div className={styles.tabs} data-variant={props.variant ?? 'line'}>
      <div
        className={styles.tabList}
        role='tablist'
        onKeyDown={(event) => {
          const index = items.indexOf(active);
          const next =
            event.key === 'ArrowRight'
              ? (index + 1) % items.length
              : event.key === 'ArrowLeft'
                ? (index - 1 + items.length) % items.length
                : event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                    ? items.length - 1
                    : -1;
          if (next < 0) return;
          event.preventDefault();
          setSelected(items[next].props.value);
          (event.currentTarget.children[next] as HTMLElement).focus();
        }}>
        {items.map((item, index) => (
          <button
            type='button'
            role='tab'
            className={styles.tabButton}
            key={item.props.value}
            id={`${id}-tab-${index}`}
            aria-controls={`${id}-panel`}
            aria-selected={item === active}
            tabIndex={item === active ? 0 : -1}
            onClick={() => setSelected(item.props.value)}>
            {item.props.trigger}
          </button>
        ))}
      </div>
      <div
        className={styles.tabContent}
        id={`${id}-panel`}
        role='tabpanel'
        aria-labelledby={`${id}-tab-${items.indexOf(active)}`}>
        {renderNode(active.props.content)}
      </div>
    </div>
  );
}

export function SplitPaneView({
  props,
  renderNode,
}: ComponentRenderProps<Record<string, unknown>>) {
  const ratio = Number(props.leftPercent ?? 50);
  return (
    <div
      className={styles.splitPane}
      style={{ gridTemplateColumns: `minmax(0, ${ratio}fr) minmax(0, ${100 - ratio}fr)` }}>
      <div className={styles.pane}>{renderNode(props.left)}</div>
      <div className={styles.pane}>{renderNode(props.right)}</div>
    </div>
  );
}

export function FilePreviewView({ props }: ComponentRenderProps<Record<string, unknown>>) {
  const refs = useContext(ViewSourcesContext);
  const ref = refs.find((source) => source.sourceId === props.sourceId);
  const [loaded, setLoaded] = useState<{ key: string; buffer: ArrayBuffer; baseUrl: string }>();
  const [failure, setFailure] = useState<{ key: string; message: string }>();
  const key = `${ref?.sourceId ?? ''}:${ref?.revision ?? ''}`;
  useEffect(() => {
    if (!ref) return;
    let active = true;
    void Promise.all([harnessSourceStore.load([ref]), fetchFilePreviewBaseUrl()])
      .then(([sources, baseUrl]) => {
        const source = sources[0];
        if (!source || source.originalAvailable === false) throw new Error('原文件不可用');
        const bytes =
          source.encoding === 'base64'
            ? Uint8Array.from(atob(source.content), (character) => character.charCodeAt(0))
            : new TextEncoder().encode(source.content);
        if (active) {
          setFailure(undefined);
          setLoaded({ key, buffer: bytes.buffer as ArrayBuffer, baseUrl: baseUrl || '' });
        }
      })
      .catch((error) => {
        if (active)
          setFailure({ key, message: error instanceof Error ? error.message : String(error) });
      });
    return () => {
      active = false;
    };
  }, [key]);

  if (!ref) return <Alert type='warning' title='未找到本轮界面可预览的附件或生成文件' />;
  if (failure?.key === key)
    return <Alert type='error' title={`文件预览失败：${failure.message}`} />;
  return (
    <section
      className={styles.filePreview}
      aria-label={`文件：${ref.name}`}
      style={{ height: Number(props.height ?? 640) }}>
      <div className={styles.fileName}>{ref.name}</div>
      <BinaryFilePreview
        relativePath={ref.name}
        buffer={loaded?.key === key ? loaded.buffer : null}
        isLoading={loaded?.key !== key}
        filePreviewBaseUrl={loaded?.key === key ? loaded.baseUrl : undefined}
      />
    </section>
  );
}

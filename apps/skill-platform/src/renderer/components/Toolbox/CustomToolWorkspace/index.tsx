import type { ICustomToolComponentConfig } from '@/types/modules';
import { createApiRequestConfig } from '@momo/api-request/core';
import { CodeFileEditor } from '@momo/file-editor';
import { ViewportPortal } from '@momo/markdown';
import {
  SnapEditFrame,
  type ISnapEditFrameHandle,
} from '@renderer/components/CustomTool/SnapEditFrame';
import { ModuleEmptyState } from '@renderer/components/ui/ModuleEmptyState';
import {
  isWindowFullscreen,
  setWindowFullscreen,
  subscribeFullscreenChanged,
} from '@renderer/services/desktop';
import {
  getCustomToolDisplayName,
  isCustomToolDirty,
  useCustomToolStore,
} from '@renderer/store/custom-tool';
import { App, Button, Tabs, Tooltip } from 'antd';
import {
  BracesIcon,
  Maximize2Icon,
  Minimize2Icon,
  MousePointerClickIcon,
  WrenchIcon,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { CustomToolAiComposer } from '../CustomToolAiComposer';
import { CustomToolDataPanel } from '../CustomToolDataPanel';
import { CustomToolOpenUIPreview } from '../CustomToolOpenUIPreview';
import { CustomToolPluginWorkspace } from '../CustomToolPluginWorkspace';
import { ToolWebview } from '../ToolWebview';
import styles from './index.module.less';

const DATA_PROP_CANDIDATES = ['data', 'items', 'rows', 'series', 'values', 'content', 'value'];

function inferDataProp(props: Record<string, unknown>): string {
  return DATA_PROP_CANDIDATES.find((key) => key in props) ?? 'data';
}

function createComponentConfig(
  componentType: string,
  props: Record<string, unknown>,
): ICustomToolComponentConfig {
  const targetProp = inferDataProp(props);
  return {
    componentType,
    sourceProps: props,
    props: {},
    data: {
      mode: 'static',
      targetProp,
      staticValue: props[targetProp] ?? null,
      request: createApiRequestConfig(),
      responsePath: '',
      polling: { enabled: false, intervalMs: 30_000 },
    },
  };
}

function HtmlView({ content, title }: { content: string; title: string }) {
  return (
    <iframe
      className={styles.iframe}
      title={title}
      srcDoc={content}
      sandbox='allow-scripts allow-forms allow-modals allow-popups'
      referrerPolicy='no-referrer'
    />
  );
}

export function CustomToolWorkspace() {
  const { message } = App.useApp();
  const snapEditRef = useRef<ISnapEditFrameHandle>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pluginDefinitionValid, setPluginDefinitionValid] = useState(true);
  const selectedId = useCustomToolStore((state) => state.selectedId);
  const document = useCustomToolStore((state) => state.document);
  const isEditing = useCustomToolStore((state) => state.isEditing);
  const isLoadingFile = useCustomToolStore((state) => state.isLoadingFile);
  const loadError = useCustomToolStore((state) => state.loadError);
  const isSaving = useCustomToolStore((state) => state.isSaving);
  const selectedComponentId = useCustomToolStore((state) => state.selectedComponentId);
  const generationTask = useCustomToolStore((state) =>
    selectedId ? state.generationTasks[selectedId] : undefined,
  );
  const enterEditMode = useCustomToolStore((state) => state.enterEditMode);
  const exitEditMode = useCustomToolStore((state) => state.exitEditMode);
  const setDocumentContent = useCustomToolStore((state) => state.setDocumentContent);
  const setComponentConfig = useCustomToolStore((state) => state.setComponentConfig);
  const selectComponent = useCustomToolStore((state) => state.selectComponent);
  const saveCurrent = useCustomToolStore((state) => state.saveCurrent);
  const isGenerating = generationTask?.status === 'generating';
  const displayName = document?.name || getCustomToolDisplayName(selectedId);
  const dirty = isCustomToolDirty();

  useEffect(() => {
    let active = true;
    let revision = 0;
    const update = (value: boolean) => {
      revision += 1;
      if (active) setIsFullscreen(value);
    };
    const unsubscribe = subscribeFullscreenChanged(update);
    const onBrowserChange = () => update(Boolean(window.document.fullscreenElement));
    window.document.addEventListener('fullscreenchange', onBrowserChange);
    const initialRevision = revision;
    void isWindowFullscreen()
      .then((value) => {
        if (active && revision === initialRevision) setIsFullscreen(value);
      })
      .catch(() => {});
    return () => {
      active = false;
      unsubscribe();
      window.document.removeEventListener('fullscreenchange', onBrowserChange);
    };
  }, []);

  useEffect(() => {
    if (!isFullscreen) return;
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        void setWindowFullscreen(false).catch((error) => message.error(String(error)));
      }
    };
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [isFullscreen, message]);

  const toggleFullscreen = useCallback(async () => {
    try {
      await setWindowFullscreen(!isFullscreen);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '无法切换系统全屏');
    }
  }, [isFullscreen, message]);

  const save = useCallback(async () => {
    if (!pluginDefinitionValid) {
      message.error('请先修正插件定义 JSON');
      return;
    }
    try {
      if (document?.kind === 'html') {
        const html = await snapEditRef.current?.pullHtml();
        if (typeof html === 'string') setDocumentContent(html);
      }
      await saveCurrent();
      exitEditMode();
      message.success('已保存');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存失败');
    }
  }, [
    document?.kind,
    exitEditMode,
    message,
    saveCurrent,
    setDocumentContent,
    pluginDefinitionValid,
  ]);

  if (!selectedId) return null;
  if (isLoadingFile || !document) {
    return (
      <div className={styles.workspace}>
        <ModuleEmptyState
          centered
          icon={WrenchIcon}
          title={loadError ? '无法加载工具' : '加载中'}
          description={loadError || '正在读取自定义工具'}
        />
      </div>
    );
  }

  if (document.kind === 'web') {
    return (
      <div className={styles['web-workspace']}>
        <ToolWebview href={document.content} title={displayName} />
      </div>
    );
  }

  const selectedConfig = selectedComponentId ? document.components[selectedComponentId] : undefined;
  const preview =
    document.kind === 'openui' ? (
      <CustomToolOpenUIPreview
        title={displayName}
        content={document.content}
        components={document.components}
        editing={isEditing && !isGenerating && !isFullscreen}
        streaming={isGenerating}
        selectedId={selectedComponentId}
        onSelect={({ id, componentType, props }) => {
          if (!document.components[id]) {
            setComponentConfig(id, createComponentConfig(componentType, props));
          } else if (!document.components[id].sourceProps) {
            setComponentConfig(id, { ...document.components[id], sourceProps: props });
          }
          selectComponent(id);
        }}
      />
    ) : (
      <HtmlView content={document.content} title={displayName} />
    );
  const canvas =
    document.kind === 'html' && isEditing ? (
      <SnapEditFrame
        ref={snapEditRef}
        html={document.content}
        fileName='index.html'
        onChange={(html) => setDocumentContent(html)}
      />
    ) : (
      preview
    );

  return (
    <ViewportPortal active={isFullscreen}>
      <div
        ref={workspaceRef}
        className={`${styles.workspace} ${isFullscreen ? styles.fullscreen : ''}`}>
        {!isFullscreen && (
          <header className={styles.header}>
            <div className={styles.heading}>
              <span className={styles.title}>{displayName}</span>
              {dirty ? <span className={styles.dirty}>未保存</span> : null}
            </div>
            <div className={styles.actions}>
              {isEditing ? (
                <>
                  <Button disabled={isGenerating} onClick={exitEditMode}>
                    退出编辑
                  </Button>
                  <Button
                    type='primary'
                    loading={isSaving}
                    disabled={isGenerating || !dirty || !pluginDefinitionValid}
                    onClick={() => void save()}>
                    保存
                  </Button>
                </>
              ) : (
                <>
                  <Button type='primary' onClick={enterEditMode}>
                    编辑
                  </Button>
                </>
              )}
            </div>
          </header>
        )}

        <div className={styles.body}>
          <div className={styles.fullscreenAction}>
            <Tooltip title={isFullscreen ? '退出系统全屏（Esc）' : '系统全屏展示（F11）'}>
              <Button
                aria-label={isFullscreen ? '退出系统全屏' : '系统全屏展示'}
                aria-pressed={isFullscreen}
                icon={isFullscreen ? <Minimize2Icon size={16} /> : <Maximize2Icon size={16} />}
                onClick={() => void toggleFullscreen()}
              />
            </Tooltip>
          </div>
          {document.kind === 'plugin' ? (
            <CustomToolPluginWorkspace
              key={selectedId}
              document={document}
              editing={isEditing && !isFullscreen}
              busy={isGenerating || isSaving}
              onValidityChange={setPluginDefinitionValid}
            />
          ) : !document.content.trim() && !isEditing ? (
            <ModuleEmptyState
              centered
              icon={WrenchIcon}
              title='暂无工具界面'
              description='点击编辑，用自然语言生成工具界面'
              action={<Button onClick={enterEditMode}>开始编辑</Button>}
            />
          ) : isEditing && !isFullscreen ? (
            <div className={styles.editor}>
              {document.content.trim() || isGenerating ? (
                <Tabs
                  className={styles.editorTabs}
                  destroyOnHidden={document.kind === 'openui'}
                  items={[
                    { key: 'preview', label: '画布', children: canvas },
                    {
                      key: 'source',
                      label: '源码',
                      children: (
                        <div className={styles.source}>
                          <CodeFileEditor
                            value={document.content}
                            relativePath={document.kind === 'openui' ? 'view.openui' : 'index.html'}
                            onChange={(content) => setDocumentContent(content)}
                            onSave={() => void save()}
                          />
                        </div>
                      ),
                    },
                  ]}
                />
              ) : (
                <div className={styles.guide}>
                  <BracesIcon size={32} />
                  <h3>描述你想创建的工具</h3>
                  <p>生成后点击画布中的组件，可设置静态数据或接口数据。</p>
                </div>
              )}
              {document.kind === 'openui' && document.content.trim() && !selectedConfig ? (
                <div className={styles.selectionHint}>
                  <MousePointerClickIcon size={15} /> 点击组件设置数据
                </div>
              ) : null}
              {selectedComponentId && selectedConfig && !isGenerating ? (
                <CustomToolDataPanel
                  componentId={selectedComponentId}
                  value={selectedConfig}
                  onChange={(config) => setComponentConfig(selectedComponentId, config)}
                  onClose={() => selectComponent(null)}
                />
              ) : null}
            </div>
          ) : (
            <div className={styles.preview}>{preview}</div>
          )}
        </div>

        {isEditing && !isFullscreen ? (
          <CustomToolAiComposer
            key={selectedId}
            toolKey={selectedId}
            hasContent={Boolean(document.content.trim())}
          />
        ) : null}
      </div>
    </ViewportPortal>
  );
}

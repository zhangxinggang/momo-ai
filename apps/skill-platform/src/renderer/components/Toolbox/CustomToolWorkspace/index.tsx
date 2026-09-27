import type { ICustomToolComponentConfig } from '@/types/modules';
import { createApiRequestConfig } from '@momo/api-request/core';
import { CodeFileEditor } from '@momo/file-editor';
import { ModuleEmptyState } from '@renderer/components/ui/ModuleEmptyState';
import {
  getCustomToolDisplayName,
  isCustomToolDirty,
  useCustomToolStore,
} from '@renderer/store/custom-tool';
import { App, Button, Tabs, Tag } from 'antd';
import { BracesIcon, MousePointerClickIcon, WrenchIcon } from 'lucide-react';
import { useCallback } from 'react';

import { CustomToolAiComposer } from '../CustomToolAiComposer';
import { CustomToolDataPanel } from '../CustomToolDataPanel';
import { CustomToolOpenUIPreview } from '../CustomToolOpenUIPreview';
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
  const selectedId = useCustomToolStore((state) => state.selectedId);
  const document = useCustomToolStore((state) => state.document);
  const isEditing = useCustomToolStore((state) => state.isEditing);
  const isLoadingFile = useCustomToolStore((state) => state.isLoadingFile);
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

  const save = useCallback(async () => {
    try {
      await saveCurrent();
      message.success('已保存');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存失败');
    }
  }, [message, saveCurrent]);

  if (!selectedId) return null;
  if (isLoadingFile || !document) {
    return (
      <div className={styles.workspace}>
        <ModuleEmptyState
          centered
          icon={WrenchIcon}
          title='加载中'
          description='正在读取自定义工具'
        />
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
        editing={isEditing && !isGenerating}
        streaming={isGenerating}
        selectedId={selectedComponentId}
        onSelect={({ id, componentType, props }) => {
          if (!document.components[id]) {
            setComponentConfig(id, createComponentConfig(componentType, props));
          }
          selectComponent(id);
        }}
      />
    ) : (
      <HtmlView content={document.content} title={displayName} />
    );

  return (
    <div className={styles.workspace}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.title}>{displayName}</span>
          <Tag color={document.kind === 'openui' ? 'blue' : 'default'}>
            {document.kind === 'openui' ? 'OpenUI' : 'HTML'}
          </Tag>
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
                disabled={isGenerating || !dirty}
                onClick={() => void save()}>
                保存
              </Button>
            </>
          ) : (
            <Button type='primary' onClick={enterEditMode}>
              编辑
            </Button>
          )}
        </div>
      </header>

      <div className={styles.body}>
        {!document.content.trim() && !isEditing ? (
          <ModuleEmptyState
            centered
            icon={WrenchIcon}
            title='暂无工具界面'
            description='点击编辑，用自然语言生成 OpenUI 工具'
            action={<Button onClick={enterEditMode}>开始编辑</Button>}
          />
        ) : isEditing ? (
          <div className={styles.editor}>
            {document.content.trim() || isGenerating ? (
              <Tabs
                className={styles.editorTabs}
                destroyOnHidden={false}
                items={[
                  { key: 'preview', label: '画布', children: preview },
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
                <p>默认生成 OpenUI。生成后点击画布中的组件，可设置静态数据或接口数据。</p>
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

      {isEditing ? (
        <CustomToolAiComposer
          key={selectedId}
          toolKey={selectedId}
          hasContent={Boolean(document.content.trim())}
        />
      ) : null}
    </div>
  );
}

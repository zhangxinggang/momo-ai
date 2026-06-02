import '@momo/file-editor';
import { MdEditor, useMdPreviewTheme, type IExposeParam } from '@momo/markdown';
import '@momo/markdown-styles';
import { Tabs } from 'antd';
import { FileIcon, FileTextIcon } from 'lucide-react';
import { useId, useRef, useState, type ComponentType } from 'react';

import { WorkflowNodeFileEditor } from '@renderer/components/Workflow/WorkflowNodeFileEditor';
import {
  SKILL_MD_TOOLBARS,
  useMarkdownEditorTheme,
  useMdEditorImageUpload,
  useSkillMdEditorToolbars,
} from '@renderer/utils/markdown/editor-config';
import styles from './index.module.less';

const WorkflowMdEditor = MdEditor as ComponentType<Record<string, unknown>>;

interface IProps {
  nodeId: string;
  workflowName: string;
  businessId: string;
  nodeName: string;
  runResult: string;
  onRunResultChange: (value: string) => void;
  filesRefreshToken: number;
  onFilesChange: () => void;
}

/**
 * 工作页右侧面板：节点运行结果 + 文件编辑
 */
export function WorkflowRunPanel({
  nodeId,
  workflowName,
  businessId,
  nodeName,
  runResult,
  onRunResultChange,
  filesRefreshToken,
  onFilesChange,
}: IProps) {
  const mdTheme = useMarkdownEditorTheme();
  const editorDomId = useId();
  const workflowMdEditorRef = useRef<IExposeParam>(null);
  const { handleDrop, handleUploadImg } = useMdEditorImageUpload(workflowMdEditorRef);
  const [activeTab, setActiveTab] = useState('result');
  const [mdPreviewTheme, setMdPreviewTheme] = useMdPreviewTheme();
  const defToolbars = useSkillMdEditorToolbars({
    content: runResult,
    exportTitle: `${workflowName}-${nodeName}-result`,
    previewTheme: mdPreviewTheme,
    onPreviewThemeChange: setMdPreviewTheme,
  });

  return (
    <div className={styles['workflow-run-panel']}>
      <Tabs
        activeKey={activeTab}
        className={styles['workflow-run-panel-tabs']}
        items={[
          {
            key: 'result',
            label: (
              <span className={styles['workflow-run-panel-tab-label']}>
                <FileTextIcon className='h-3.5 w-3.5' />
                {'运行结果'}
              </span>
            ),
            children: (
              <div className={styles['workflow-run-panel-result']}>
                <div className='momo-file-editor__md-editor-root'>
                  <WorkflowMdEditor
                    ref={workflowMdEditorRef}
                    id={`${editorDomId}-${nodeId}`}
                    key={nodeId}
                    value={runResult}
                    onChange={(value: string) => onRunResultChange(value)}
                    theme={mdTheme}
                    preview
                    previewTheme={mdPreviewTheme}
                    onPreviewThemeChange={setMdPreviewTheme}
                    noPrettier
                    inputBoxWidth='50%'
                    footers={[]}
                    toolbars={SKILL_MD_TOOLBARS}
                    defToolbars={defToolbars}
                    placeholder={'采纳的对话内容将追加到此，支持 Markdown 编辑与预览…'}
                    onDrop={handleDrop}
                    onUploadImg={handleUploadImg}
                    style={{ height: '100%' }}
                  />
                </div>
              </div>
            ),
          },
          {
            key: 'files',
            label: (
              <span className={styles['workflow-run-panel-tab-label']}>
                <FileIcon className='h-3.5 w-3.5' />
                {'文件'}
              </span>
            ),
            children: (
              <div className={styles['workflow-run-panel-files']}>
                <WorkflowNodeFileEditor
                  businessId={businessId}
                  key={`${workflowName}-${businessId}-${nodeName}`}
                  nodeName={nodeName}
                  onFilesChange={onFilesChange}
                  refreshToken={filesRefreshToken}
                  workflowName={workflowName}
                />
              </div>
            ),
          },
        ]}
        onChange={setActiveTab}
        size='small'
      />
    </div>
  );
}

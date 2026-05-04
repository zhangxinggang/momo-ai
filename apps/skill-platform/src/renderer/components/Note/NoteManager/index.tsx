import { allToolbar, MdEditor } from '@momo/markdown';
import '@momo/markdown-styles';
import { NoteAiWritingModal } from '@renderer/components/Note/NoteAiWritingModal';
import { NoteExportMenu } from '@renderer/components/Note/NoteExportMenu';
import { ModuleEmptyState } from '@renderer/components/ui/ModuleEmptyState';
import { useNoteStore, useSettingsStore } from '@renderer/store';
import { Button } from 'antd';
import { FileTextIcon, SparklesIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './index.module.less';

const NoteMdEditor = MdEditor as any;

const AUTO_SAVE_DELAY_MS = 2000;

function sanitizeNoteEditorDomId(path: string): string {
  return path.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function buildNoteMarkdownToolbars() {
  const skip = new Set(['prettier', 'github', 'save']);
  return allToolbar.filter((item) => !skip.has(String(item)));
}

const NOTE_MD_TOOLBARS = buildNoteMarkdownToolbars() as typeof allToolbar;

export function NoteManager() {
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  const selectedId = useNoteStore((state) => state.selectedId);
  const editorContent = useNoteStore((state) => state.editorContent);
  const savedContent = useNoteStore((state) => state.savedContent);
  const isLoadingFile = useNoteStore((state) => state.isLoadingFile);
  const isSaving = useNoteStore((state) => state.isSaving);
  const setEditorContent = useNoteStore((state) => state.setEditorContent);
  const saveCurrentFile = useNoteStore((state) => state.saveCurrentFile);
  const loadTree = useNoteStore((state) => state.loadTree);

  const saveRef = useRef(saveCurrentFile);
  saveRef.current = saveCurrentFile;

  const mdTheme = isDarkMode ? 'dark' : 'light';
  const mdPreviewTheme = isDarkMode ? 'cyanosis' : 'default';

  const markdownEditorDomId = useMemo(
    () => `note-md-${sanitizeNoteEditorDomId(selectedId ?? 'none')}`,
    [selectedId],
  );

  useEffect(() => {
    void loadTree();
  }, [loadTree]);

  useEffect(() => {
    if (!selectedId || isLoadingFile) {
      return;
    }
    if (editorContent === savedContent) {
      return;
    }

    const timer = window.setTimeout(() => {
      void saveRef.current();
    }, AUTO_SAVE_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [editorContent, isLoadingFile, savedContent, selectedId]);

  const [aiWritingOpen, setAiWritingOpen] = useState(false);

  return (
    <div className={styles.note}>
      <div className={styles['note-editor']}>
        {selectedId ? (
          <div className={styles['note-editor-shell']}>
            <div className={styles['note-editor-toolbar']}>
              <span className={styles['note-editor-path']} title={selectedId}>
                {selectedId}
              </span>
              <div className={styles['note-editor-toolbar-actions']}>
                {isSaving ? (
                  <span className={styles['note-editor-save-hint']}>{'保存中...'}</span>
                ) : editorContent !== savedContent ? (
                  <span className={styles['note-editor-save-hint']}>{'未保存'}</span>
                ) : null}
                <NoteExportMenu filePath={selectedId} content={editorContent} />
                <Button
                  type='primary'
                  size='small'
                  icon={<SparklesIcon className='h-3.5 w-3.5' />}
                  onClick={() => setAiWritingOpen(true)}>
                  {'AI 写作'}
                </Button>
              </div>
            </div>
            <div className={styles['note-editor-body']}>
              {isLoadingFile ? (
                <div className={styles['note-editor-loading']}>{'加载中…'}</div>
              ) : (
                <div className={styles['note-editor-md']}>
                  <NoteMdEditor
                    key={selectedId}
                    id={markdownEditorDomId}
                    value={editorContent}
                    onChange={(value) => setEditorContent(value)}
                    theme={mdTheme}
                    preview
                    previewTheme={mdPreviewTheme}
                    noPrettier
                    inputBoxWidth='50%'
                    footers={[]}
                    noUploadImg
                    toolbars={NOTE_MD_TOOLBARS}
                    toolbarsExclude={[]}
                    defToolbars={[]}
                    style={{ height: '100%' }}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <ModuleEmptyState
            centered
            icon={FileTextIcon}
            title='在左侧选择或新建笔记'
            description='从侧栏目录选择已有笔记，或新建目录与笔记开始写作'
          />
        )}
      </div>
      {selectedId ? (
        <NoteAiWritingModal
          open={aiWritingOpen}
          filePath={selectedId}
          onClose={() => setAiWritingOpen(false)}
        />
      ) : null}
    </div>
  );
}

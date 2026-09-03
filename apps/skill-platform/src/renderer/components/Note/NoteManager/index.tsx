import {
  allToolbar,
  buildExtendedMarkdownToolbars,
  type IExposeParam,
  MdEditor,
} from '@momo/markdown';
import '@momo/markdown-styles';
import { NoteAiComposer } from '@renderer/components/Note/NoteAiComposer';
import { ModuleEmptyState } from '@renderer/components/ui/ModuleEmptyState';
import { useNoteStore, useSettingsStore } from '@renderer/store';
import {
  useMdEditorImageUpload,
  useMdPreviewTheme,
  useSkillMdEditorToolbars,
} from '@renderer/utils/markdown/editor-config';
import { clsx } from 'clsx';
import { FileTextIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './index.module.less';

const NoteMdEditor = MdEditor as any;

const AUTO_SAVE_DELAY_MS = 2000;

function sanitizeNoteEditorDomId(path: string): string {
  return path.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function buildNoteMarkdownToolbars() {
  return buildExtendedMarkdownToolbars();
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
  const [isAiRewriting, setIsAiRewriting] = useState(false);

  const saveRef = useRef(saveCurrentFile);
  saveRef.current = saveCurrentFile;

  const noteMdEditorRef = useRef<IExposeParam>(null);
  const { handleDrop, handleUploadImg } = useMdEditorImageUpload(noteMdEditorRef);

  const mdTheme = isDarkMode ? 'dark' : 'light';
  const [mdPreviewTheme, setMdPreviewTheme] = useMdPreviewTheme('cyanosis');
  const defToolbars = useSkillMdEditorToolbars({
    content: editorContent,
    exportTitle: selectedId ?? 'note',
    previewTheme: mdPreviewTheme,
    onPreviewThemeChange: setMdPreviewTheme,
  });

  const markdownEditorDomId = useMemo(
    () => `note-md-${sanitizeNoteEditorDomId(selectedId ?? 'none')}`,
    [selectedId],
  );

  useEffect(() => {
    void loadTree();
  }, [loadTree]);

  useEffect(() => {
    if (!selectedId || isLoadingFile || isAiRewriting) {
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
  }, [editorContent, isAiRewriting, isLoadingFile, savedContent, selectedId]);

  const handleEditorChange = useCallback(
    (value: string) => {
      if (isAiRewriting) {
        return;
      }
      setEditorContent(value);
    },
    [isAiRewriting, setEditorContent],
  );

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
              </div>
            </div>
            <div className={styles['note-editor-body']}>
              {isLoadingFile ? (
                <div className={styles['note-editor-loading']}>{'加载中…'}</div>
              ) : (
                <div
                  className={clsx(
                    styles['note-editor-md'],
                    isAiRewriting && styles['note-editor-md--locked'],
                  )}>
                  <NoteMdEditor
                    key={selectedId}
                    ref={noteMdEditorRef}
                    id={markdownEditorDomId}
                    value={editorContent}
                    onChange={handleEditorChange}
                    theme={mdTheme}
                    preview
                    previewTheme={mdPreviewTheme}
                    onPreviewThemeChange={setMdPreviewTheme}
                    noPrettier
                    inputBoxWidth='50%'
                    footers={[]}
                    toolbars={NOTE_MD_TOOLBARS}
                    toolbarsExclude={[]}
                    defToolbars={defToolbars}
                    onDrop={handleDrop}
                    onUploadImg={handleUploadImg}
                    readOnly={isAiRewriting}
                    style={{ height: '100%' }}
                  />
                </div>
              )}
            </div>
            <NoteAiComposer
              key={selectedId}
              noteKey={selectedId}
              onRewritingChange={setIsAiRewriting}
            />
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
    </div>
  );
}

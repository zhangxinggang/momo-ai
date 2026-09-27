import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { languages } from '@codemirror/language-data';
import { Compartment, EditorState, type Extension } from '@codemirror/state';
import { Decoration, EditorView, keymap, lineNumbers } from '@codemirror/view';
import { useEffect, useRef } from 'react';

import {
  DEFAULT_CODE_EDITOR_THEME,
  getCodeEditorThemeExtension,
  type ECodeEditorTheme,
} from '../../utils/code-editor-theme';

export interface IProps {
  value: string;
  relativePath: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  readOnly?: boolean;
  themeId?: ECodeEditorTheme;
  highlightedLines?: { lines: number[]; kind: 'add' | 'remove' };
}

function getFileExtension(relativePath: string): string {
  const baseName = relativePath.split(/[/\\]/).pop() ?? '';
  const dotIndex = baseName.lastIndexOf('.');
  if (dotIndex <= 0) {
    return '';
  }
  return baseName.slice(dotIndex + 1).toLowerCase();
}

async function loadLanguageExtension(relativePath: string): Promise<Extension[]> {
  const extension = getFileExtension(relativePath);
  if (!extension) {
    return [];
  }
  const description = languages.find((item) => item.extensions.includes(extension));
  if (!description) {
    return [];
  }
  try {
    const support = await description.load();
    return [support];
  } catch {
    return [];
  }
}

const editorTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '0.8rem',
  },
  '.cm-scroller': {
    overflow: 'auto',
    fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
    lineHeight: '1.625',
  },
  '&.cm-focused': {
    outline: 'none',
  },
});

export function CodeFileEditor({
  value,
  relativePath,
  onChange,
  onSave,
  readOnly = false,
  themeId = DEFAULT_CODE_EDITOR_THEME,
  highlightedLines,
}: IProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const lineEndingRef = useRef(value.includes('\r\n') ? '\r\n' : '\n');
  lineEndingRef.current = value.includes('\r\n') ? '\r\n' : '\n';
  const onChangeRef = useRef(onChange);
  const onSaveRef = useRef(onSave);
  const highlightsRef = useRef(highlightedLines);
  const highlightsCompartment = useRef(new Compartment());
  onChangeRef.current = onChange;
  onSaveRef.current = onSave;
  highlightsRef.current = highlightedLines;
  const highlightExtension = (_doc: EditorState['doc']) =>
    EditorView.decorations.compute(['doc'], (state) =>
      Decoration.set(
        [...new Set(highlightsRef.current?.lines ?? [])]
          .filter((line) => line > 0 && line <= state.doc.lines)
          .sort((a, b) => a - b)
          .map((line) =>
            Decoration.line({ class: `cm-change-${highlightsRef.current?.kind}` }).range(
              state.doc.line(line).from,
            ),
          ),
      ),
    );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let cancelled = false;

    const init = async () => {
      viewRef.current?.destroy();
      viewRef.current = null;

      const languageExtensions = await loadLanguageExtension(relativePath);
      if (cancelled || !containerRef.current) {
        return;
      }

      const state = EditorState.create({
        doc: valueRef.current,
        extensions: [
          editorTheme,
          highlightsCompartment.current.of([]),
          lineNumbers(),
          history(),
          keymap.of([
            ...defaultKeymap,
            ...historyKeymap,
            {
              key: 'Mod-s',
              run: () => {
                onSaveRef.current?.();
                return true;
              },
              preventDefault: true,
            },
          ]),
          EditorView.lineWrapping,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(
                update.state.doc.toString().replace(/\n/g, lineEndingRef.current),
              );
            }
          }),
          EditorState.readOnly.of(readOnly),
          ...getCodeEditorThemeExtension(themeId),
          ...languageExtensions,
        ],
      });

      viewRef.current = new EditorView({
        state,
        parent: containerRef.current,
      });
      viewRef.current.dispatch({
        effects: highlightsCompartment.current.reconfigure(
          highlightExtension(viewRef.current.state.doc),
        ),
      });
    };

    void init();

    return () => {
      cancelled = true;
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, [readOnly, relativePath, themeId]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) {
      return;
    }
    const currentValue = view.state.doc.toString().replace(/\n/g, lineEndingRef.current);
    if (currentValue === value) {
      return;
    }
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: value,
      },
    });
  }, [value]);

  useEffect(() => {
    const view = viewRef.current;
    if (view)
      view.dispatch({
        effects: highlightsCompartment.current.reconfigure(highlightExtension(view.state.doc)),
      });
  }, [highlightedLines, value]);

  return <div className='momo-file-editor__code-editor' ref={containerRef} />;
}

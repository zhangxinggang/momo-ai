import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import type { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';
import { useEffect, useState } from 'react';

/** CodeMirror 代码编辑器主题 */
export enum ECodeEditorTheme {
  ELight = 'light',
  EOneDark = 'one-dark',
}

export const DEFAULT_CODE_EDITOR_THEME = ECodeEditorTheme.ELight;

export const CODE_EDITOR_THEME_OPTIONS: Array<{ label: string; value: ECodeEditorTheme }> = [
  { label: '浅色', value: ECodeEditorTheme.ELight },
  { label: 'One Dark', value: ECodeEditorTheme.EOneDark },
];

export function isCodeEditorTheme(value: string): value is ECodeEditorTheme {
  return CODE_EDITOR_THEME_OPTIONS.some((item) => item.value === value);
}

const lightEditorTheme = EditorView.theme(
  {
    '&': {
      color: '#383a42',
      backgroundColor: '#fafafa',
    },
    '.cm-content': { caretColor: '#383a42' },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#383a42' },
    '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: '#bad5fa',
    },
    '.cm-gutters': {
      backgroundColor: '#f0f0f0',
      color: '#9da5b4',
      borderRight: '1px solid #e5e7eb',
    },
  },
  { dark: false },
);

const darkEditorTheme = EditorView.theme(
  {
    '&': {
      color: '#abb2bf',
      backgroundColor: '#282c34',
    },
    '.cm-content': { caretColor: '#528bff' },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#528bff' },
    '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: '#3e4451',
    },
    '.cm-gutters': {
      backgroundColor: '#21252b',
      color: '#636d83',
      borderRight: '1px solid #181a1f',
    },
  },
  { dark: true },
);

const lightHighlight = HighlightStyle.define([
  { tag: [t.keyword, t.modifier], color: '#a626a4' },
  { tag: [t.string, t.special(t.string)], color: '#50a14f' },
  { tag: [t.comment], color: '#a0a1a7', fontStyle: 'italic' },
  { tag: [t.function(t.variableName), t.propertyName], color: '#4078f2' },
  { tag: [t.number, t.bool, t.atom], color: '#986801' },
  { tag: [t.typeName, t.className], color: '#c18401' },
  { tag: [t.tagName], color: '#e45649' },
  { tag: [t.attributeName], color: '#986801' },
]);

const darkHighlight = HighlightStyle.define([
  { tag: [t.keyword, t.modifier], color: '#c678dd' },
  { tag: [t.string, t.special(t.string)], color: '#98c379' },
  { tag: [t.comment], color: '#5c6370', fontStyle: 'italic' },
  { tag: [t.function(t.variableName), t.propertyName], color: '#61afef' },
  { tag: [t.number, t.bool, t.atom], color: '#d19a66' },
  { tag: [t.typeName, t.className], color: '#e5c07b' },
  { tag: [t.tagName], color: '#e06c75' },
  { tag: [t.attributeName], color: '#d19a66' },
]);

/** 获取 CodeMirror 主题扩展 */
export function getCodeEditorThemeExtension(themeId: ECodeEditorTheme): Extension[] {
  if (themeId === ECodeEditorTheme.EOneDark) {
    return [darkEditorTheme, syntaxHighlighting(darkHighlight)];
  }
  return [lightEditorTheme, syntaxHighlighting(lightHighlight)];
}

/** 根据 document 根节点 dark class 解析代码编辑器主题 */
export function resolveCodeEditorThemeFromDocument(): ECodeEditorTheme {
  if (typeof document === 'undefined') {
    return DEFAULT_CODE_EDITOR_THEME;
  }
  return document.documentElement.classList.contains('dark')
    ? ECodeEditorTheme.EOneDark
    : DEFAULT_CODE_EDITOR_THEME;
}

/** 跟随应用亮暗主题（document 根节点 class）同步代码编辑器主题 */
export function useSyncedCodeEditorTheme(): ECodeEditorTheme {
  const [theme, setTheme] = useState<ECodeEditorTheme>(resolveCodeEditorThemeFromDocument);

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setTheme(resolveCodeEditorThemeFromDocument());
    });
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return theme;
}

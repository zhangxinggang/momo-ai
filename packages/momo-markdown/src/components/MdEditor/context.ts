import { createContext } from 'react';
import { staticTextDefault } from './config';
import { IContextType } from './type';

export const defaultContextValue: IContextType = {
  editorId: '',
  tabWidth: 2,
  theme: 'light',
  language: 'zh-CN',
  highlight: {
    css: '',
    js: '',
  },
  showCodeRowNumber: false,
  usedLanguageText: staticTextDefault['zh-CN'],
  previewTheme: 'default',
  customIcon: {},
  rootRef: null,
  disabled: undefined,
  showToolbarName: false,
  setting: {
    preview: false,
    htmlPreview: false,
    previewOnly: false,
    pageFullscreen: false,
    fullscreen: false,
  },
  updateSetting: () => {},
  tableShape: [6, 4],
  catalogVisible: false,
  noUploadImg: false,
  noPrettier: false,
  codeTheme: 'default',
  defToolbars: [],
  floatingToolbars: [],
};

export const EditorContext = createContext<IContextType>(defaultContextValue);

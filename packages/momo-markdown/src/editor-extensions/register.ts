import markdownItMark from 'markdown-it-mark';

import { config } from '../components/MdEditor/config';

let isRegistered = false;

/** 注册 @vavt/v3-extension 兼容的 Markdown 解析插件（如 mark 高亮） */
export function registerMdEditorExtensions(): void {
  if (isRegistered) {
    return;
  }
  isRegistered = true;
  config({
    markdownItConfig(md) {
      md.use(markdownItMark);
    },
  });
}

declare module '*.module.less' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.less';

declare module '*.css';

/** MdPreview 样式入口，宿主可 alias 到 @momo/aichat/markdown-styles */
declare module '@momo/markdown-styles';

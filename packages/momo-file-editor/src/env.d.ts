declare module '*.less' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.less?inline' {
  const css: string;
  export default css;
}

declare module '@momo/markdown-styles';

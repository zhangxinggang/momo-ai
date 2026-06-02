/** 注册 Mermaid 可选外部图表插件 */
export const registerMermaidPlugins = async (mermaidInst: {
  registerExternalDiagrams: (
    diagrams: unknown[],
    options?: { lazyLoad?: boolean },
  ) => Promise<void>;
}) => {
  try {
    const zenumlModule = await import('@mermaid-js/mermaid-zenuml');
    const zenumlPlugin = zenumlModule.default ?? zenumlModule;
    await mermaidInst.registerExternalDiagrams([zenumlPlugin]);
  } catch {
    // ZenUML 为可选插件，加载失败时忽略
  }
};

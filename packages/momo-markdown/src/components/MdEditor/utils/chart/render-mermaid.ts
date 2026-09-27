/** Isolate Mermaid's temporary SVG, including error diagrams, from the document UI. */
export async function renderMermaidSvg(
  mermaid: {
    render: (id: string, text: string, container: HTMLElement) => Promise<{ svg: string }>;
  },
  id: string,
  text: string,
) {
  const container = document.createElement('div');
  container.style.cssText =
    'position:fixed;left:-10000px;top:-10000px;visibility:hidden;width:1366px;';
  document.body.appendChild(container);
  try {
    return await mermaid.render(id, text, container);
  } finally {
    container.remove();
  }
}

export type TDrawioSourceFormat = 'mermaid' | 'plantuml';

export interface IDrawioSource {
  format: TDrawioSourceFormat;
  data: string;
}

export type TDrawioLoadAction =
  | { action: 'load'; xml: string; title: string; noSaveBtn: true; saveAndExit: true }
  | {
      action: 'load';
      descriptor: { format: TDrawioSourceFormat; data: string; wrap: true };
      title: string;
      noSaveBtn: true;
      saveAndExit: true;
    };

const DRAWIO_ASSET_RE = /(?:^|\/)(drawio-[0-9a-f-]{36})\.png$/i;

export const EMPTY_DRAWIO_XML =
  '<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel>';

export const DEFAULT_DRAWIO_EDITOR_URL =
  'https://embed.diagrams.net/?embed=1&proto=json&spin=1&libraries=1&noSaveBtn=1&saveAndExit=1&suppressNewWindows=1';

/** 从图片地址提取旁路 .drawio 文件的稳定标识。 */
export function getDrawioAssetId(src: string | null | undefined): string | null {
  if (!src) return null;

  try {
    const path = new URL(src, 'https://momo.local').pathname;
    return path.match(DRAWIO_ASSET_RE)?.[1] ?? null;
  } catch {
    return src.split(/[?#]/, 1)[0].match(DRAWIO_ASSET_RE)?.[1] ?? null;
  }
}

export function createDrawioLoadAction(input: {
  xml?: string | null;
  source?: IDrawioSource;
  title?: string;
}): TDrawioLoadAction {
  const common = {
    action: 'load' as const,
    title: input.title || '图形编辑',
    noSaveBtn: true as const,
    saveAndExit: true as const,
  };

  if (input.xml) {
    return { ...common, xml: input.xml };
  }

  if (!input.source) {
    throw new Error('缺少可编辑的图形数据');
  }

  return {
    ...common,
    descriptor: {
      format: input.source.format,
      data: input.source.data,
      // 保留原始 Mermaid / PlantUML 文本在 draw.io XML 内，后续可在 draw.io 中继续编辑。
      wrap: true,
    },
  };
}

/** 仅影响当前 DOM 的缓存刷新，不改变 Markdown 中持久化的图片地址。 */
export function withDrawioImageVersion(src: string, version: number): string {
  if (!version) return src;
  const hashIndex = src.indexOf('#');
  const url = hashIndex < 0 ? src : src.slice(0, hashIndex);
  const hash = hashIndex < 0 ? '' : src.slice(hashIndex);
  const queryIndex = url.indexOf('?');
  const base = queryIndex < 0 ? url : url.slice(0, queryIndex);
  const params = new URLSearchParams(queryIndex < 0 ? '' : url.slice(queryIndex + 1));
  params.set('drawio-version', String(version));
  return `${base}?${params}${hash}`;
}

/** Locate a complete diagram fence, so preview edits replace exactly that source block. */
export function findMarkdownDiagram(markdown: string, line: number) {
  const lines = markdown.split('\n');
  const opening = lines[line]?.match(
    /^ {0,3}(`{3,}|~{3,})\s*(mermaid|flowchart|plantuml|puml)\s*$/i,
  );
  if (!opening) return null;
  const closing = new RegExp(`^ {0,3}${opening[1][0]}{${opening[1].length},}\\s*$`);
  const end = lines.findIndex((text, index) => index > line && closing.test(text));
  if (end < 0) return null;
  const from = lines.slice(0, line).reduce((offset, text) => offset + text.length + 1, 0);
  const to = from + lines.slice(line, end + 1).join('\n').length;
  return {
    from,
    to,
    raw: markdown.slice(from, to),
    source: {
      format: /^(plantuml|puml)$/i.test(opening[2]) ? 'plantuml' : 'mermaid',
      data: lines
        .slice(line + 1, end)
        .join('\n')
        .replace(/\r\n/g, '\n'),
    } as IDrawioSource,
  };
}

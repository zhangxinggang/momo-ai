const PLANTUML_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';

function encode6bit(bytes: Uint8Array): string {
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i] ?? 0;
    const b2 = bytes[i + 1] ?? 0;
    const b3 = bytes[i + 2] ?? 0;

    result += PLANTUML_ALPHABET[(b1 >> 2) & 0x3f];
    result += PLANTUML_ALPHABET[((b1 & 0x3) << 4) | ((b2 >> 4) & 0xf)];
    result += PLANTUML_ALPHABET[((b2 & 0xf) << 2) | ((b3 >> 6) & 0x3)];
    result += PLANTUML_ALPHABET[b3 & 0x3f];
  }
  return result;
}

async function deflatePlantumlSource(source: string): Promise<Uint8Array> {
  if (typeof CompressionStream === 'undefined') {
    return new Uint8Array();
  }

  const input = new TextEncoder().encode(source);

  try {
    const stream = new Blob([input]).stream().pipeThrough(new CompressionStream('deflate-raw'));
    const buffer = await new Response(stream).arrayBuffer();
    return new Uint8Array(buffer);
  } catch {
    const stream = new Blob([input]).stream().pipeThrough(new CompressionStream('deflate'));
    const buffer = await new Response(stream).arrayBuffer();
    // deflate 包含两字节 zlib 头和四字节校验值；PlantUML 接收 raw DEFLATE。
    return new Uint8Array(buffer).slice(2, -4);
  }
}

/** 将 PlantUML 源码编码为官方 SVG 服务可用的路径片段 */
export async function encodePlantuml(source: string): Promise<string> {
  const text = source.trim();
  try {
    const compressed = await deflatePlantumlSource(text);
    if (compressed.length) return encode6bit(compressed);
  } catch {
    // 无压缩流环境仍可使用 PlantUML 官方支持的 UTF-8 HEX 格式。
  }
  return `~h${Array.from(new TextEncoder().encode(text), (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
}

export function buildPlantumlSvgUrl(_source: string, encoded: string): string {
  return `https://www.plantuml.com/plantuml/svg/${encoded}`;
}

export function buildPlantumlPngUrl(encoded: string): string {
  return `https://www.plantuml.com/plantuml/png/${encoded}`;
}

export function normalizePlantumlSource(source: string): string {
  const trimmed = source.trim();
  if (!trimmed) {
    return '@startuml\n@enduml';
  }

  if (trimmed.startsWith('@start')) {
    return trimmed;
  }

  return `@startuml\n${trimmed}\n@enduml`;
}

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
    throw new Error('当前环境不支持 PlantUML 压缩编码');
  }

  const input = new TextEncoder().encode(source);

  try {
    const stream = new Blob([input]).stream().pipeThrough(new CompressionStream('deflate-raw'));
    const buffer = await new Response(stream).arrayBuffer();
    return new Uint8Array(buffer);
  } catch {
    const stream = new Blob([input]).stream().pipeThrough(new CompressionStream('deflate'));
    const buffer = await new Response(stream).arrayBuffer();
    return new Uint8Array(buffer);
  }
}

/** 将 PlantUML 源码编码为官方 SVG 服务可用的路径片段 */
export async function encodePlantuml(source: string): Promise<string> {
  const compressed = await deflatePlantumlSource(source.trim());
  return encode6bit(compressed);
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

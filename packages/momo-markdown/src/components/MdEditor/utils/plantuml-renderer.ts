import emojiUrl from '@plantuml/core/emoji.js?url';
import openiconicUrl from '@plantuml/core/openiconic.js?url';
import themesUrl from '@plantuml/core/themes.js?url';
import vizUrl from '@plantuml/core/viz-global.js?url';
import { normalizePlantumlSource } from './plantuml-encoder';

const scripts = new Map<string, Promise<void>>();
const cache = new Map<string, Promise<string>>();
let engine: Promise<typeof import('@plantuml/core')> | undefined;
let renderQueue: Promise<unknown> = Promise.resolve();

function loadScript(url: string): Promise<void> {
  const existing = scripts.get(url);
  if (existing) return existing;
  const pending = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    const timer = setTimeout(() => fail(), 15_000);
    const fail = () => {
      clearTimeout(timer);
      script.remove();
      scripts.delete(url);
      reject(new Error('PlantUML 本地资源加载失败'));
    };
    script.src = url;
    script.onload = () => {
      clearTimeout(timer);
      resolve();
    };
    script.onerror = fail;
    document.head.appendChild(script);
  });
  scripts.set(url, pending);
  return pending;
}

function loadEngine() {
  engine ??= (async () => {
    const bundled: Record<string, string> = {
      'emoji.js': emojiUrl,
      'openiconic.js': openiconicUrl,
      'themes.js': themesUrl,
    };
    // Resolve optional libraries to bundled assets; never fall back to a remote script.
    globalThis.PLANTUML_STDLIB_LOADER = (name, onLoad, onError) => {
      const url = bundled[name];
      if (!url) {
        onError(`PlantUML 本地引擎未包含图形库：${name}`);
      } else {
        void loadScript(url).then(onLoad, (error: Error) => onError(error.message));
      }
      return true;
    };
    await loadScript(vizUrl);
    return import('@plantuml/core');
  })().catch((error) => {
    engine = undefined;
    throw error;
  });
  return engine;
}

/** The TeaVM engine shares state, so previews and rich-text views use one serial queue. */
export function renderPlantumlImage(source: string): Promise<string> {
  const normalized = normalizePlantumlSource(source);
  const existing = cache.get(normalized);
  if (existing) return existing;

  const result = renderQueue.then(async () => {
    const { renderToString } = await loadEngine();
    const svg = await new Promise<string>((resolve, reject) => {
      renderToString(normalized.split(/\r\n|\r|\n/), resolve, (message) =>
        reject(new Error(message)),
      );
    });
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
  // A failed diagram must not prevent the next diagram from rendering.
  renderQueue = result.catch(() => {});
  cache.set(normalized, result);
  if (cache.size > 64) cache.delete(cache.keys().next().value!);
  void result.catch(() => {
    if (cache.get(normalized) === result) cache.delete(normalized);
  });
  return result;
}

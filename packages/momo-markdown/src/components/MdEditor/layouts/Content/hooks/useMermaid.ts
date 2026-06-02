import { randomId } from '@vavt/util';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { globalConfig, prefix } from '~/config';
import { EditorContext } from '~/context';
import { CDN_IDS } from '~/static';
import { ERROR_CATCHER } from '~/static/event-name';
import { mermaidCache } from '~/utils/cache';
import {
  hasNativeCynefinSupport,
  isCynefinBetaSource,
  renderCynefinPolyfill,
} from '~/utils/chart/cynefin-polyfill';
import { registerMermaidPlugins } from '~/utils/chart/mermaid-plugins';
import { normalizeMermaidSource } from '~/utils/chart/mermaid-source';
import { appendHandler } from '~/utils/dom';
import eventBus from '~/utils/event-bus';

import { IContentPreviewProps } from '../props';

/**
 * 注册katex扩展到页面
 *
 */
const useMermaid = (props: IContentPreviewProps) => {
  const { editorId, theme, rootRef } = useContext(EditorContext);
  const { noMermaid, sanitizeMermaid } = props;

  const mermaidRef = useRef(globalConfig.editorExtensions.mermaid!.instance);
  const [reRender, setReRender] = useState(-1);

  const configMermaid = useCallback(async () => {
    mermaidCache.clear();
    const mermaid = mermaidRef.current;

    if (!noMermaid && mermaid) {
      const mermaidBaseConfig =
        theme === 'dark'
          ? {
              startOnLoad: false,
              theme: 'dark',
            }
          : {
              startOnLoad: false,
              theme: 'base',
              themeVariables: {
                background: '#ffffff',
                primaryColor: '#ffffff',
                primaryTextColor: '#1f2329',
                primaryBorderColor: '#b7c0cc',
                secondaryColor: '#f7f8fa',
                tertiaryColor: '#f7f8fa',
                lineColor: '#596273',
                edgeLabelBackground: '#ffffff',
                clusterBkg: '#ffffff',
                clusterBorder: '#b7c0cc',
              },
            };

      await registerMermaidPlugins(mermaid);
      mermaid.initialize(globalConfig.mermaidConfig(mermaidBaseConfig));

      // 严格模式下，如果reRender是boolean型，会执行两次，这是reRender将不会effect
      setReRender((_r) => _r + 1);
    }
  }, [noMermaid, theme]);

  useEffect(() => {
    void configMermaid();
  }, [configMermaid]);

  useEffect(() => {
    const { editorExtensions, editorExtensionsAttrs } = globalConfig;

    if (noMermaid || mermaidRef.current) {
      return;
    }

    const loadBundledMermaid = async () => {
      try {
        const module = await import('mermaid');
        mermaidRef.current = module.default;
        void configMermaid();
        return true;
      } catch {
        return false;
      }
    };

    void loadBundledMermaid().then((loaded) => {
      if (loaded || mermaidRef.current) {
        return;
      }

      // 未打包 mermaid 时回退到 CDN
      const jsSrc = editorExtensions.mermaid!.js as string;

      if (/\.mjs/.test(jsSrc)) {
        appendHandler('link', {
          ...editorExtensionsAttrs.mermaid?.js,
          rel: 'modulepreload',
          href: jsSrc,
          id: CDN_IDS.mermaidM,
        });

        import(
          /* @vite-ignore */
          /* webpackIgnore: true */
          jsSrc
        )
          .then((module) => {
            mermaidRef.current = module.default;
            void configMermaid();
          })
          .catch((error) => {
            eventBus.emit(editorId, ERROR_CATCHER, {
              name: 'mermaid',
              message: `Failed to load mermaid module: ${error.message}`,
              error,
            });
          });
      } else {
        appendHandler(
          'script',
          {
            ...editorExtensionsAttrs.mermaid?.js,
            src: jsSrc,
            id: CDN_IDS.mermaid,
            onload() {
              mermaidRef.current = window.mermaid;
              void configMermaid();
            },
          },
          'mermaid',
        );
      }
    });
  }, [configMermaid, editorId, noMermaid]);

  const replaceMermaid = useCallback(async () => {
    if (!noMermaid && mermaidRef.current) {
      const mermaidSourceEles =
        rootRef!.current?.querySelectorAll<HTMLElement>(`div.${prefix}-mermaid`) || [];

      const svgContainingElement = document.createElement('div');
      const sceWidth = document.body.offsetWidth > 1366 ? document.body.offsetWidth : 1366;
      const sceHeight = document.body.offsetHeight > 768 ? document.body.offsetHeight : 768;

      svgContainingElement.style.width = sceWidth + 'px';
      svgContainingElement.style.height = sceHeight + 'px';
      svgContainingElement.style.position = 'fixed';
      svgContainingElement.style.zIndex = '-10000';
      svgContainingElement.style.top = '-10000';

      let count = mermaidSourceEles.length;

      if (count > 0) {
        document.body.appendChild(svgContainingElement);
      }

      await Promise.allSettled(
        Array.from(mermaidSourceEles).map((ele) => {
          const handler = async (item: HTMLElement) => {
            if (item.dataset.closed === 'false') {
              return false;
            }

            const rawCode = item.innerText;
            const code = normalizeMermaidSource(rawCode);
            let mermaidHtml = mermaidCache.get(code) as string;

            if (!mermaidHtml) {
              const idRand = randomId();
              let result: { svg: string } = { svg: '' };
              try {
                if (isCynefinBetaSource(code) && !hasNativeCynefinSupport(mermaidRef.current)) {
                  result = { svg: renderCynefinPolyfill(code, idRand) };
                } else {
                  result = await mermaidRef.current.render(idRand, code, svgContainingElement);
                }

                mermaidHtml = await sanitizeMermaid(result.svg);

                const p = document.createElement('p');
                p.className = `${prefix}-mermaid`;
                p.setAttribute('data-processed', '');
                p.setAttribute('data-content', rawCode);
                p.innerHTML = mermaidHtml;
                p.children[0]?.removeAttribute('height');

                mermaidCache.set(code, p.innerHTML);

                if (item.dataset.line !== undefined) {
                  p.dataset.line = item.dataset.line;
                }

                item.replaceWith(p);
              } catch (error: any) {
                eventBus.emit(editorId, ERROR_CATCHER, {
                  name: 'mermaid',
                  message: error.message,
                  error,
                });
              }

              if (--count === 0) {
                svgContainingElement.remove();
              }
            }
          };

          return handler(ele);
        }),
      );
    }
  }, [editorId, noMermaid, rootRef, sanitizeMermaid]);

  return { reRender, replaceMermaid };
};

export default useMermaid;

// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import {
  codeCss,
  globalConfig,
} from '../../../../../../packages/momo-markdown/src/components/MdEditor/config';
import {
  EditorContext,
  defaultContextValue,
} from '../../../../../../packages/momo-markdown/src/components/MdEditor/context';
import useHighlight from '../../../../../../packages/momo-markdown/src/components/MdEditor/layouts/Content/hooks/useHighlight';
import { CDN_IDS } from '../../../../../../packages/momo-markdown/src/components/MdEditor/static';

it('highlights locally and switches CSS without loading a CDN script or reloading unchanged CSS', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const container = document.createElement('div');
  const root = createRoot(container);
  function Preview() {
    const { hljsRef, hljsInited } = useHighlight({} as any);
    return createElement('code', {
      'data-ready': hljsInited,
      dangerouslySetInnerHTML: {
        __html: hljsRef.current.highlight('const n = 1;', { language: 'javascript' }).value,
      },
    });
  }
  const render = (theme: 'light' | 'dark') =>
    act(async () =>
      root.render(
        createElement(EditorContext.Provider, {
          value: {
            ...defaultContextValue,
            highlight: { js: {}, css: { href: codeCss.atom[theme] } },
          },
          children: createElement(Preview),
        }),
      ),
    );
  try {
    expect(globalConfig.editorExtensions.highlight?.instance).toBeDefined();
    await render('light');
    expect(container.querySelector('.hljs-keyword')?.textContent).toBe('const');
    const light = document.getElementById(CDN_IDS.hlcss)!;
    expect(light.getAttribute('href')).not.toMatch(/https?:\/\//);
    await render('light');
    expect(document.getElementById(CDN_IDS.hlcss)).toBe(light);
    await render('dark');
    expect(document.getElementById(CDN_IDS.hlcss)?.getAttribute('href')).toBe(codeCss.atom.dark);
    expect(document.getElementById(CDN_IDS.hljs)).toBeNull();
  } finally {
    await act(async () => root.unmount());
    document.getElementById(CDN_IDS.hlcss)?.remove();
    vi.unstubAllGlobals();
  }
});

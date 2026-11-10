// @vitest-environment jsdom
import { expect, it } from 'vitest';
import { isPageRequest, toolPageSource } from './page-bridge';
it('accepts only the current frame and channel token', () => {
  const iframe = document.createElement('iframe');
  document.body.append(iframe);
  const data = { channel: 'momo-page', token: 'token', id: '1', method: 'run' };
  expect(
    isPageRequest(
      new MessageEvent('message', { data, source: iframe.contentWindow }),
      iframe.contentWindow,
      'token',
    ),
  ).toBe(true);
  expect(
    isPageRequest(
      new MessageEvent('message', { data, source: window }),
      iframe.contentWindow,
      'token',
    ),
  ).toBe(false);
  expect(
    isPageRequest(
      new MessageEvent('message', { data, source: iframe.contentWindow }),
      iframe.contentWindow,
      'other',
    ),
  ).toBe(false);
  expect(toolPageSource('<html><head></head><body>页面</body></html>', 'token')).toContain(
    'window.momo=',
  );
  iframe.remove();
});

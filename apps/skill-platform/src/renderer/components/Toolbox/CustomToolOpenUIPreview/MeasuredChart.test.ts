// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MeasuredChart } from './MeasuredChart';

afterEach(() => vi.restoreAllMocks());

describe('MeasuredChart', () => {
  it('defers chart rendering at zero size and resumes after the container becomes visible', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    let resize: () => void = () => {};
    const disconnect = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          resize = callback;
        }
        observe() {}
        disconnect = disconnect;
      },
    );
    let width = 0;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      () => ({ width, height: 300 }) as DOMRect,
    );
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    await act(async () =>
      root.render(createElement(MeasuredChart, { children: createElement('span', null, 'chart') })),
    );
    expect(host.textContent).toBe('');
    width = 420;
    await act(async () => resize());
    expect(host.textContent).toBe('chart');
    width = 0;
    await act(async () => resize());
    expect(host.textContent).toBe('');
    await act(async () => root.unmount());
    expect(disconnect).toHaveBeenCalledOnce();
    host.remove();
    vi.unstubAllGlobals();
  });
});

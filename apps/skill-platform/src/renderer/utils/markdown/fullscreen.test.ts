// @vitest-environment jsdom
import { act, createElement, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { ViewportPortal } from '../../../../../../packages/momo-markdown/src/components/ViewportPortal';

it('moves fullscreen content out of clipping parents while retaining draft and component identity', async () => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const mount = vi.fn();
  const unmount = vi.fn();
  function Editor() {
    const [value, setValue] = useState('Draft');
    useEffect(() => {
      mount();
      return unmount;
    }, []);
    return createElement('button', { onClick: () => setValue('Updated draft') }, value);
  }
  const render = (active: boolean) =>
    act(async () =>
      root.render(
        createElement(
          'section',
          { style: { overflow: 'hidden', backdropFilter: 'blur(8px)' } },
          createElement(ViewportPortal, { active, children: createElement(Editor) }),
        ),
      ),
    );
  try {
    await render(false);
    const button = container.querySelector('button')!;
    await act(async () => button.click());
    await render(true);
    expect(container.querySelector('button')).toBeNull();
    expect(document.body.querySelector('button')).toBe(button);
    expect(button.textContent).toBe('Updated draft');
    await render(false);
    expect(container.querySelector('button')).toBe(button);
    expect(mount).toHaveBeenCalledTimes(1);
    expect(unmount).not.toHaveBeenCalled();
  } finally {
    await act(async () => root.unmount());
    container.remove();
  }
  expect(unmount).toHaveBeenCalledTimes(1);
  expect(document.body.querySelector('button')).toBeNull();
});

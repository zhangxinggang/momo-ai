// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { useConfirmLeaveAiChat } from './useConfirmLeaveAiChat';

it('allows menu and session navigation during generation without opening a dialog', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const host = document.createElement('div');
  const root = createRoot(host);
  let confirm!: ReturnType<typeof useConfirmLeaveAiChat>;
  function Probe() {
    confirm = useConfirmLeaveAiChat();
    return null;
  }
  try {
    await act(async () => root.render(createElement(Probe)));
    await expect(confirm({ scope: 'chat', isGenerating: true })).resolves.toBe(true);
    await expect(confirm({ isGenerating: false })).resolves.toBe(true);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  } finally {
    await act(async () => root.unmount());
    vi.unstubAllGlobals();
  }
});

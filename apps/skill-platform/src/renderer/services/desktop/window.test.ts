// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { isWindowFullscreen, setWindowFullscreen } from './window';

vi.mock('../electron/api', () => ({ getElectronApi: () => window.electron }));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete window.electron;
});

describe('system fullscreen', () => {
  it('uses the native window API on desktop', async () => {
    const enterFullscreen = vi.fn();
    const exitFullscreen = vi.fn();
    window.electron = {
      enterFullscreen,
      exitFullscreen,
      isFullscreen: async () => true,
    } as unknown as Window['electron'];
    await setWindowFullscreen(true);
    await setWindowFullscreen(false);
    expect(enterFullscreen).toHaveBeenCalledOnce();
    expect(exitFullscreen).toHaveBeenCalledOnce();
    expect(await isWindowFullscreen()).toBe(true);
  });

  it('uses the browser fullscreen API when desktop capabilities are unavailable', async () => {
    const enter = vi.fn().mockResolvedValue(undefined);
    const exit = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      configurable: true,
      value: enter,
    });
    Object.defineProperty(document, 'exitFullscreen', { configurable: true, value: exit });
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => null });
    await setWindowFullscreen(true);
    expect(enter).toHaveBeenCalledOnce();
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => document.documentElement,
    });
    expect(await isWindowFullscreen()).toBe(true);
    await setWindowFullscreen(false);
    expect(exit).toHaveBeenCalledOnce();
  });
});

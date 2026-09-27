import { afterEach, describe, expect, it, vi } from 'vitest';
import { readEmbeddedWebPage } from './webpage';

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

function eventFor(frame: object) {
  const mainFrame = { frames: [frame] };
  return { senderFrame: mainFrame, sender: { mainFrame } } as never;
}

describe('embedded page IPC boundary', () => {
  it('reads the matching loaded frame in the caller window, including its current navigated URL', async () => {
    const page = {
      url: 'https://example.com/next',
      title: 'Next',
      content: '真实正文',
      truncated: false,
    };
    const frame = {
      name: 'momo-tool-web-test',
      detached: false,
      url: page.url,
      executeJavaScript: vi.fn().mockResolvedValue(page),
    };
    expect(await readEmbeddedWebPage(eventFor(frame), frame.name)).toEqual(page);
    expect(frame.executeJavaScript).toHaveBeenCalledOnce();
    await expect(readEmbeddedWebPage(eventFor(frame), 'momo-tool-web-other')).rejects.toThrow(
      '尚未加载',
    );
    await expect(
      readEmbeddedWebPage(eventFor({ ...frame, url: 'file:///private' }), frame.name),
    ).rejects.toThrow('HTTP');
    await expect(
      readEmbeddedWebPage({ ...(eventFor(frame) as object), senderFrame: {} } as never, frame.name),
    ).rejects.toThrow('无效');
    await expect(readEmbeddedWebPage(eventFor(frame), 'arbitrary-frame')).rejects.toThrow('无效');
    expect(frame.executeJavaScript).toHaveBeenCalledOnce();
  });

  it('rejects empty content and bounds extraction time', async () => {
    const frame = {
      name: 'momo-tool-web-test',
      detached: false,
      url: 'https://example.com',
      executeJavaScript: vi.fn().mockResolvedValue({ content: '' }),
    };
    await expect(readEmbeddedWebPage(eventFor(frame), frame.name)).rejects.toThrow(
      '没有可读取的正文',
    );
    vi.useFakeTimers();
    frame.executeJavaScript.mockReturnValue(new Promise(() => {}));
    const result = expect(readEmbeddedWebPage(eventFor(frame), frame.name)).rejects.toThrow(
      '读取网页超时',
    );
    await vi.advanceTimersByTimeAsync(10000);
    await result;
  });
});

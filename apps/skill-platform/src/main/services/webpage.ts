import type { IWebPageContext } from '@/types/modules/webpage';
import type { IpcMainInvokeEvent } from 'electron';
import { getHttpUrl, READ_WEB_PAGE_SCRIPT } from './webpage-content';

export async function readEmbeddedWebPage(
  event: IpcMainInvokeEvent,
  frameName: string,
): Promise<IWebPageContext> {
  if (
    event.senderFrame !== event.sender.mainFrame ||
    typeof frameName !== 'string' ||
    !/^momo-tool-web-[a-z0-9-]+$/.test(frameName)
  )
    throw new Error('无效的网页读取请求');
  const frame = event.sender.mainFrame.frames.find(
    (child) => child.name === frameName && !child.detached,
  );
  if (!frame) throw new Error('网页尚未加载完成，请稍后重试');
  getHttpUrl(frame.url);
  let timer: ReturnType<typeof setTimeout>;
  let result: IWebPageContext;
  try {
    result = await Promise.race([
      frame.executeJavaScript(READ_WEB_PAGE_SCRIPT) as Promise<IWebPageContext>,
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(
          () => reject(new Error('读取网页超时，请等待页面加载完成后重试')),
          10000,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer!);
  }
  if (!result?.content?.trim())
    throw new Error('当前网页没有可读取的正文，请等待页面加载或切换页面');
  getHttpUrl(result.url);
  return result;
}

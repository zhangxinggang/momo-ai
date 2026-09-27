import { config, type IDrawioDiagramAsset, type ISaveDrawioDiagramInput } from '@momo/markdown';
import { getUploadUrl } from '@renderer/services/system';

/** 将 momo-markdown 的 draw.io 能力绑定到桌面主进程的 getUploadDir 持久化实现。 */
export async function configureMarkdownDrawio(): Promise<void> {
  const baseUrl = window.electron
    ? `${new URL(await getUploadUrl()).origin}/drawio/index.html`
    : undefined;
  config({
    editorExtensions: {
      drawio: {
        editorUrl: baseUrl
          ? `${baseUrl}?embed=1&proto=json&spin=1&libraries=1&noSaveBtn=1&saveAndExit=1&suppressNewWindows=1&stealth=1&local=1&lang=zh`
          : undefined,
        saveDiagram: async (input: ISaveDrawioDiagramInput): Promise<IDrawioDiagramAsset> => {
          const api = window.electron?.saveDrawioDiagram;
          if (!api) throw new Error('当前环境不支持保存 draw.io 图形');
          return api(input);
        },
        loadDiagram: async (assetId: string): Promise<string | null> => {
          const api = window.electron?.loadDrawioDiagram;
          if (!api) throw new Error('当前环境不支持读取 draw.io 图形');
          return api(assetId);
        },
      },
    },
  });
}

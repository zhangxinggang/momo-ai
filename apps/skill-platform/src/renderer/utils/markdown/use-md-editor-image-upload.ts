import type { IExposeParam } from '@momo/markdown';
import { useCallback, type RefObject } from 'react';

import { uploadMarkdownImage } from './image-upload';

/**
 * Markdown 编辑器图片上传：拖拽与工具栏/粘贴上传
 */
export function useMdEditorImageUpload(editorRef: RefObject<IExposeParam | null>) {
  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.stopPropagation();

      void (async () => {
        const file = e.dataTransfer?.files[0];
        if (!file) {
          return;
        }
        try {
          const data = await uploadMarkdownImage(file);

          editorRef.current?.insert(() => ({
            targetValue: `![](${data.url})`,
          }));
        } catch (error) {
          console.error('图片上传失败:', error);
        }
      })();
    },
    [editorRef],
  );

  const handleUploadImg = useCallback(
    (
      files: File[],
      callback: (arr: Array<{ url: string; alt: string; title: string }>) => void,
    ) => {
      void (async () => {
        try {
          const uploadedList = await Promise.all(files.map((file) => uploadMarkdownImage(file)));

          callback(
            uploadedList.map((item) => ({
              url: item.url,
              alt: 'alt',
              title: 'title',
            })),
          );
        } catch (error) {
          console.error('图片上传失败:', error);
        }
      })();
    },
    [],
  );

  return { handleDrop, handleUploadImg };
}

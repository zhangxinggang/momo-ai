import { Image } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { prefix } from '~/config';
import { EditorContext } from '~/context';

import { IContentPreviewProps } from '../props';

interface IPreviewState {
  isOpen: boolean;
  current: number;
  srcList: string[];
}

const INITIAL_PREVIEW_STATE: IPreviewState = {
  isOpen: false,
  current: 0,
  srcList: [],
};

/**
 * 使用 antd Image 预览 Markdown 中的图片，支持同文档多图切换
 */
const useAntdImagePreview = (props: IContentPreviewProps, html: string) => {
  const { editorId, setting } = useContext(EditorContext);
  const [previewState, setPreviewState] = useState<IPreviewState>(INITIAL_PREVIEW_STATE);

  useEffect(() => {
    if (props.noImgZoomIn || !setting.preview) {
      return;
    }

    const previewRoot = document.getElementById(`${editorId}-preview`);
    if (!previewRoot) {
      return;
    }

    const imageNodeList = Array.from(
      previewRoot.querySelectorAll<HTMLImageElement>('img:not(.not-zoom)'),
    );
    const srcList = imageNodeList.map((img) => img.src).filter(Boolean);

    const clickHandlerList = imageNodeList.map((img, index) => (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      setPreviewState({
        isOpen: true,
        current: index,
        srcList,
      });
    });

    imageNodeList.forEach((img, index) => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', clickHandlerList[index]);
    });

    return () => {
      imageNodeList.forEach((img, index) => {
        img.removeEventListener('click', clickHandlerList[index]);
      });
    };
  }, [editorId, html, props.noImgZoomIn, setting.preview]);

  if (props.noImgZoomIn || !setting.preview || previewState.srcList.length === 0) {
    return null;
  }

  return (
    <Image.PreviewGroup
      preview={{
        rootClassName: `${prefix}-image-preview-root`,
        visible: previewState.isOpen,
        current: previewState.current,
        onVisibleChange: (isOpen) => {
          setPreviewState((prev) => ({ ...prev, isOpen }));
        },
        onChange: (current) => {
          setPreviewState((prev) => ({ ...prev, current }));
        },
      }}>
      {previewState.srcList.map((src) => (
        <Image key={src} src={src} style={{ display: 'none' }} />
      ))}
    </Image.PreviewGroup>
  );
};

export default useAntdImagePreview;

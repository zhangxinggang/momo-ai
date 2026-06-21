import { Image } from 'antd';
import {
  useCallback,
  useContext,
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';
import { prefix } from '~/config';
import { EditorContext } from '~/context';
import { downloadImageFromUrl } from '~/utils/download-image';

import { IContentPreviewProps } from '../props';

interface IImagePreviewActionsNodeProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

interface IImagePreviewActionsInfo {
  image?: {
    url?: string;
  };
}

const IMAGE_PREVIEW_ACTION_CLASS = 'ant-image-preview-actions-action';

const ImagePreviewDownloadButton = ({ url }: { url: string }) => (
  <button
    type='button'
    className={`${IMAGE_PREVIEW_ACTION_CLASS} ${IMAGE_PREVIEW_ACTION_CLASS}-download`}
    aria-label='download'
    title='下载'
    onClick={() => {
      void downloadImageFromUrl(url);
    }}>
    <svg
      viewBox='64 64 896 896'
      focusable='false'
      width='1em'
      height='1em'
      fill='currentColor'
      aria-hidden='true'>
      <path d='M505.7 661a8 8 0 0012.6 0l112-141.7c4.1-5.2.4-12.9-6.3-12.9h-74.1V168c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v338.3H400c-6.7 0-10.4 7.7-6.3 12.9l112 141.8zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z' />
    </svg>
  </button>
);

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

  const renderPreviewActions = useCallback(
    (originalNode: ReactElement, info: IImagePreviewActionsInfo) => {
      const { className, style, children } = originalNode.props as IImagePreviewActionsNodeProps;

      return (
        <div className={className} style={style}>
          {children}
          <ImagePreviewDownloadButton url={info.image?.url || ''} />
        </div>
      );
    },
    [],
  );

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
        actionsRender: renderPreviewActions,
      }}>
      {previewState.srcList.map((src) => (
        <Image key={src} src={src} style={{ display: 'none' }} />
      ))}
    </Image.PreviewGroup>
  );
};

export default useAntdImagePreview;

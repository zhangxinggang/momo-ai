import type CropperInstance from 'cropperjs';
import { memo, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Icon from '~/components/Icon';
import Modal from '~/components/Modal';
import { globalConfig, prefix } from '~/config';
import { EditorContext } from '~/context';
import { ERROR_CATCHER, UPLOAD_IMAGE } from '~/static/event-name';
import { base642File } from '~/utils';
import bus from '~/utils/event-bus';

interface IProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (data?: any) => void;
}

const ClipModal = (props: IProps) => {
  const { editorId, usedLanguageText } = useContext(EditorContext);
  const Cropper = globalConfig.editorExtensions.cropper?.instance || window.Cropper;
  const uploadRef = useRef<HTMLInputElement>(null);
  const uploadImgRef = useRef<HTMLImageElement>(null);
  const previewTargetRef = useRef<HTMLDivElement>(null);
  const cropperRef = useRef<CropperInstance | null>(null);
  const readerRef = useRef<FileReader | null>(null);
  const [imgSrc, setImgSrc] = useState('');
  const [ready, setReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const reportError = useCallback(
    (cause: unknown) => {
      bus.emit(editorId, ERROR_CATCHER, {
        name: 'Cropper',
        message: cause instanceof Error ? cause.message : String(cause),
      });
    },
    [editorId],
  );

  const reset = useCallback(() => {
    readerRef.current?.abort();
    readerRef.current = null;
    cropperRef.current?.destroy();
    cropperRef.current = null;
    if (uploadRef.current) uploadRef.current.value = '';
    setImgSrc('');
    setReady(false);
  }, []);

  useEffect(() => {
    if (!props.visible) {
      reset();
      setIsFullscreen(false);
    }
    return () => {
      readerRef.current?.abort();
      readerRef.current = null;
    };
  }, [props.visible, reset]);

  useEffect(() => {
    setReady(false);
    if (!props.visible || !imgSrc || !uploadImgRef.current) return;
    let cancelled = false;
    try {
      if (!Cropper) throw new Error('图片裁切组件不可用');
      cropperRef.current = new Cropper(uploadImgRef.current, {
        viewMode: 2,
        preview: previewTargetRef.current,
        ready: () => {
          if (!cancelled) setReady(true);
        },
      });
    } catch (cause) {
      reportError(cause);
    }
    return () => {
      cancelled = true;
      cropperRef.current?.destroy();
      cropperRef.current = null;
      previewTargetRef.current?.replaceChildren();
    };
  }, [props.visible, imgSrc, isFullscreen, Cropper, reportError]);

  return (
    <Modal
      className={`${prefix}-modal-clip`}
      title={usedLanguageText.clipModalTips?.title}
      visible={props.visible}
      onClose={props.onCancel}
      showAdjust
      isFullscreen={isFullscreen}
      onAdjust={setIsFullscreen}
      width='668px'
      height='392px'>
      <div className={`${prefix}-form-item ${prefix}-clip`}>
        <div className={`${prefix}-clip-main`}>
          {imgSrc ? (
            <div className={`${prefix}-clip-cropper`}>
              <img src={imgSrc} ref={uploadImgRef} style={{ maxWidth: '100%' }} alt='' />
              <button
                type='button'
                className={`${prefix}-clip-delete`}
                aria-label='移除图片'
                onClick={reset}>
                <Icon name='delete' />
              </button>
            </div>
          ) : (
            <div
              className={`${prefix}-clip-upload`}
              onClick={() => uploadRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  uploadRef.current?.click();
                }
              }}
              role='button'
              tabIndex={0}
              aria-label={usedLanguageText.imgTitleItem?.upload}>
              <Icon name='upload' />
            </div>
          )}
        </div>
        <div className={`${prefix}-clip-preview`}>
          <div className={`${prefix}-clip-preview-target`} ref={previewTargetRef} />
        </div>
      </div>
      <div className={`${prefix}-form-item`}>
        <button
          className={`${prefix}-btn`}
          type='button'
          disabled={!ready}
          onClick={() => {
            if (!ready || !cropperRef.current) return;
            try {
              const canvas = cropperRef.current.getCroppedCanvas();
              if (!canvas) throw new Error('图片尚未准备好，请重新选择图片');
              const file = base642File(canvas.toDataURL('image/png'));
              if (!file) throw new Error('无法生成裁切图片');
              bus.emit(editorId, UPLOAD_IMAGE, [file], () => {
                reset();
                props.onOk();
              });
            } catch (cause) {
              reportError(cause);
            }
          }}>
          {usedLanguageText.linkModalTips?.buttonOK}
        </button>
      </div>
      <input
        ref={uploadRef}
        accept='image/*'
        type='file'
        style={{ display: 'none' }}
        aria-label={usedLanguageText.imgTitleItem?.upload}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = '';
          if (!file) return;
          readerRef.current?.abort();
          const reader = new FileReader();
          readerRef.current = reader;
          setReady(false);
          reader.onload = () => {
            if (readerRef.current !== reader) return;
            readerRef.current = null;
            setImgSrc(String(reader.result || ''));
          };
          reader.onerror = () => reportError(reader.error || new Error('无法读取图片'));
          reader.readAsDataURL(file);
        }}
      />
    </Modal>
  );
};

export default memo(ClipModal);

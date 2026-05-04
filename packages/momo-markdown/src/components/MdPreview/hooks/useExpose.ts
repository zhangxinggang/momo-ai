import { ForwardedRef, useImperativeHandle } from 'react';
import { RERENDER } from '~/static/event-name';
import { IExposePreviewParam, IMdPreviewStaticProps } from '~/type';
import eventBus from '~/utils/event-bus';

export const useExpose = (props: IMdPreviewStaticProps, ref: ForwardedRef<unknown>) => {
  const { editorId } = props;

  useImperativeHandle(ref, () => {
    const exposeParam: IExposePreviewParam = {
      rerender() {
        eventBus.emit(editorId, RERENDER);
      },
    };

    return exposeParam;
  }, [editorId]);
};

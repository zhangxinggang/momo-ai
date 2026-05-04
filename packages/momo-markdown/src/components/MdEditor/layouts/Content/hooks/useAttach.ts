import { RefObject, useContext } from 'react';
import { EditorContext } from '~/context';
import { TEXTAREA_FOCUS } from '~/static/event-name';
import { TFocusOption } from '~/type';
import eventBus from '~/utils/event-bus';
import CodeMirrorUt from '../codemirror';
/** 一些附带的设置 */
const useAttach = (codeMirrorUt: RefObject<CodeMirrorUt | undefined>) => {
  const { editorId } = useContext(EditorContext);

  eventBus.on(editorId, {
    name: TEXTAREA_FOCUS,
    callback(options: TFocusOption) {
      codeMirrorUt.current?.focus(options);
    },
  });
};

export default useAttach;

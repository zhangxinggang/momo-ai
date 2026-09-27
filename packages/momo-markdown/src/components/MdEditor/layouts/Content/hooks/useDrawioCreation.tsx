import { useContext, useEffect, useRef, useState } from 'react';
import DrawioEditor from '~/components/DrawioEditor';
import { globalConfig } from '~/config';
import { EditorContext } from '~/context';
import { DRAWIO_CREATE } from '~/static/event-name';
import { EMPTY_DRAWIO_XML } from '~/utils/drawio';
import bus from '~/utils/event-bus';

/** Capture the insertion point, then insert a PNG only after XML + PNG persistence succeeds. */
export default function useDrawioCreation(
  readOnly: boolean | undefined,
  captureInsert: () => ((imageUrl: string) => void) | undefined,
) {
  const { editorId, disabled } = useContext(EditorContext);
  const latest = useRef({ readOnly, disabled, captureInsert });
  latest.current = { readOnly, disabled, captureInsert };
  const insert = useRef<((imageUrl: string) => void) | undefined>(undefined);
  const sessionId = useRef(0);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const create = () => {
      if (latest.current.readOnly || latest.current.disabled) return;
      insert.current = latest.current.captureInsert();
      if (insert.current) {
        ++sessionId.current;
        setOpen(true);
      }
    };
    bus.on(editorId, { name: DRAWIO_CREATE, callback: create });
    return () => {
      bus.remove(editorId, DRAWIO_CREATE, create);
      ++sessionId.current;
      insert.current = undefined;
    };
  }, [editorId]);
  if (!open) return null;
  const currentSession = sessionId.current;
  const insertImage = insert.current;
  return (
    <DrawioEditor
      xml={EMPTY_DRAWIO_XML}
      title='自定义图形'
      onClose={() => {
        if (currentSession !== sessionId.current) return;
        ++sessionId.current;
        insert.current = undefined;
        setOpen(false);
      }}
      onSave={async (xml, pngDataUri) => {
        if (currentSession !== sessionId.current) return;
        if (latest.current.readOnly || latest.current.disabled)
          throw new Error('当前文档无法插入图形');
        const save = globalConfig.editorExtensions.drawio?.saveDiagram;
        if (!save) throw new Error('图形保存服务不可用');
        const saved = await save({ xml, pngDataUri });
        if (currentSession !== sessionId.current) return;
        if (latest.current.readOnly || latest.current.disabled)
          throw new Error('当前文档无法插入图形');
        insertImage?.(saved.imageUrl);
      }}
    />
  );
}

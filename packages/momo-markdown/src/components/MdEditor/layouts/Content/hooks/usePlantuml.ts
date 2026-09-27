import { useCallback, useContext } from 'react';
import { globalConfig, prefix } from '~/config';
import { EditorContext } from '~/context';
import { ERROR_CATCHER } from '~/static/event-name';
import eventBus from '~/utils/event-bus';
import { renderPlantumlImage } from '~/utils/plantuml-renderer';

import { IContentPreviewProps } from '../props';

const usePlantuml = (props: IContentPreviewProps) => {
  const { editorId, rootRef } = useContext(EditorContext);
  const { noPlantuml = globalConfig.editorConfig.noPlantuml ?? false } = props;

  const replacePlantuml = useCallback(async () => {
    if (noPlantuml) {
      return;
    }

    const sourceEles =
      rootRef!.current?.querySelectorAll<HTMLElement>(
        `div.${prefix}-plantuml[data-plantuml-pending="true"]`,
      ) || [];

    await Promise.allSettled(
      Array.from(sourceEles).map(async (ele) => {
        if (ele.dataset.closed === 'false' || ele.dataset.plantumlRendering === 'true') {
          return;
        }

        const code = ele.textContent?.trim() || '';
        if (!code) {
          return;
        }

        ele.dataset.plantumlRendering = 'true';
        try {
          const url = await renderPlantumlImage(code);
          if (!ele.isConnected) return;

          const wrapper = document.createElement('div');
          wrapper.className = `${prefix}-plantuml-rendered`;
          wrapper.dataset.content = code;

          const img = document.createElement('img');
          img.className = `${prefix}-plantuml-image`;
          img.src = url;
          img.alt = 'PlantUML';
          img.loading = 'lazy';
          wrapper.appendChild(img);

          if (ele.dataset.line !== undefined) {
            wrapper.dataset.line = ele.dataset.line;
          }

          ele.replaceWith(wrapper);
        } catch (error) {
          if (!ele.isConnected) return;
          // Keep the source readable and avoid retrying on every preview update.
          delete ele.dataset.plantumlPending;
          eventBus.emit(editorId, ERROR_CATCHER, {
            name: 'plantuml',
            message: error instanceof Error ? error.message : String(error),
            error,
          });
        } finally {
          delete ele.dataset.plantumlRendering;
        }
      }),
    );
  }, [editorId, noPlantuml, rootRef]);

  return { replacePlantuml };
};

export default usePlantuml;

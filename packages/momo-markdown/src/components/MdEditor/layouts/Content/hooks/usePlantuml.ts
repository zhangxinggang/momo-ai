import { useCallback, useContext } from 'react';
import { globalConfig, prefix } from '~/config';
import { EditorContext } from '~/context';
import { ERROR_CATCHER } from '~/static/event-name';
import eventBus from '~/utils/event-bus';
import {
  buildPlantumlSvgUrl,
  encodePlantuml,
  normalizePlantumlSource,
} from '~/utils/plantuml-encoder';

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
        if (ele.dataset.closed === 'false') {
          return;
        }

        const code = ele.textContent?.trim() || '';
        if (!code) {
          return;
        }

        try {
          const normalized = normalizePlantumlSource(code);
          const encoded = await encodePlantuml(normalized);
          const url = buildPlantumlSvgUrl(normalized, encoded);

          const wrapper = document.createElement('div');
          wrapper.className = `${prefix}-plantuml-rendered`;
          wrapper.dataset.content = code;
          wrapper.dataset.encoded = encoded;

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
          eventBus.emit(editorId, ERROR_CATCHER, {
            name: 'plantuml',
            message: error instanceof Error ? error.message : String(error),
            error,
          });
        }
      }),
    );
  }, [editorId, noPlantuml, rootRef]);

  return { replacePlantuml };
};

export default usePlantuml;

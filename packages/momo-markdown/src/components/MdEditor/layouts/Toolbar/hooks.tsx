import { importScreenfull } from '@momo/utils';
import { cloneElement, ReactElement, useCallback, useContext, useEffect, useRef } from 'react';
import Divider from '~/components/Divider';
import { allToolbar, editorExtensionsAttrs, globalConfig } from '~/config';
import { EditorContext } from '~/context';
import { CDN_IDS } from '~/static';
import { CHANGE_FULL_SCREEN, ERROR_CATCHER, REPLACE } from '~/static/event-name';
import { TInsertContentGenerator, TToolbarNames } from '~/type';
import { appendHandler } from '~/utils/dom';
import bus from '~/utils/event-bus';

import ToolbarBold from './tools/Bold';
import ToolbarCatalog from './tools/Catalog';
import ToolbarCode from './tools/Code';
import ToolbarCodeRow from './tools/CodeRow';
import ToolbarFullscreen from './tools/Fullscreen';
import ToolbarGithub from './tools/Github';
import ToolbarHtmlPreview from './tools/HtmlPreview';
import ToolbarImage from './tools/Image';
import ToolbarImageDropdown from './tools/ImageDropdown';
import ToolbarItalic from './tools/Italic';
import ToolbarKatex from './tools/Katex';
import ToolbarLink from './tools/Link';
import ToolbarMermaid from './tools/Mermaid';
import ToolbarNext from './tools/Next';
import ToolbarOrderedList from './tools/OrderedList';
import ToolbarPrettier from './tools/Prettier';
import ToolbarPreview from './tools/Preview';
import ToolbarPreviewOnly from './tools/PreviewOnly';
import ToolbarPreviewStyle from './tools/PreviewStyle';
import ToolbarQuote from './tools/Quote';
import ToolbarRevoke from './tools/Revoke';
import ToolbarSave from './tools/Save';
import ToolbarStrikeThrough from './tools/StrikeThrough';
import ToolbarSub from './tools/Sub';
import ToolbarSup from './tools/Sup';
import ToolbarTable from './tools/Table';
import ToolbarTask from './tools/Task';
import ToolbarTitle from './tools/Title';
import ToolbarUnderline from './tools/Underline';
import ToolbarUnorderedList from './tools/UnorderedList';

export const useSreenfull = () => {
  const { editorId, updateSetting } = useContext(EditorContext);
  const screenfull = useRef(globalConfig.editorExtensions.screenfull!.instance);
  const screenfullMe = useRef(false);

  const fullscreenHandler = useCallback(
    (status?: boolean) => {
      if (!screenfull.current) {
        bus.emit(editorId, ERROR_CATCHER, {
          name: 'fullscreen',
          message: 'fullscreen is undefined',
        });
        return;
      }

      if (screenfull.current.isEnabled) {
        const targetStatus = status === undefined ? !screenfull.current.isFullscreen : status;

        if (targetStatus) {
          screenfull.current.request();
        } else {
          screenfull.current.exit();
        }
      } else {
        console.error('browser does not support screenfull!');
      }
    },
    [editorId],
  );

  useEffect(() => {
    const changedEvent = () => {
      const isFullscreen = !!screenfull.current?.isFullscreen;
      screenfullMe.current = isFullscreen;
      updateSetting('fullscreen', isFullscreen);
    };

    let timer = -1;

    if (!screenfull.current) {
      void importScreenfull().then((instance) => {
        if (instance) {
          screenfull.current = instance;
          if (instance.isEnabled) {
            instance.on('change', changedEvent);
          }
          return;
        }

        const { editorExtensions } = globalConfig;

        timer = requestAnimationFrame(() => {
          appendHandler(
            'script',
            {
              ...editorExtensionsAttrs.screenfull?.js,
              src: editorExtensions.screenfull!.js,
              id: CDN_IDS.screenfull,
              onload() {
                screenfull.current = window.screenfull;
                if (screenfull.current && screenfull.current.isEnabled) {
                  screenfull.current.on('change', changedEvent);
                }
              },
            },
            'screenfull',
          );
        });
      });
    }

    if (screenfull.current && screenfull.current.isEnabled) {
      screenfull.current.on('change', changedEvent);
    }

    return () => {
      if (!screenfull.current) {
        cancelAnimationFrame(timer);
      }

      if (screenfull.current && screenfull.current.isEnabled) {
        screenfull.current.off('change', changedEvent);
      }
    };
  }, [updateSetting]);

  useEffect(() => {
    bus.on(editorId, {
      name: CHANGE_FULL_SCREEN,
      callback: fullscreenHandler,
    });

    return () => {
      bus.remove(editorId, CHANGE_FULL_SCREEN, fullscreenHandler);
    };
  }, [editorId, fullscreenHandler]);

  return { fullscreenHandler };
};

export const useBarRender = () => {
  const {
    editorId,
    theme,
    previewTheme,
    language,
    disabled,
    noUploadImg,
    noPrettier,
    codeTheme,
    showToolbarName,
    setting,
    defToolbars,
  } = useContext(EditorContext);

  const barRender = useCallback(
    (barItem: TToolbarNames, keyHint?: string | number) => {
      if (allToolbar.includes(barItem)) {
        const dividerKey = `bar-divider-${keyHint ?? editorId}`;

        switch (barItem) {
          case '-': {
            return <Divider key={dividerKey} />;
          }
          case 'bold': {
            return <ToolbarBold key='bar-bold' />;
          }
          case 'underline': {
            return <ToolbarUnderline key='bar-unorderline' />;
          }
          case 'italic': {
            return <ToolbarItalic key='bar-italic' />;
          }
          case 'strikeThrough': {
            return <ToolbarStrikeThrough key='bar-strikeThrough' />;
          }
          case 'title': {
            return <ToolbarTitle key='bar-title' />;
          }
          case 'sub': {
            return <ToolbarSub key='bar-sub' />;
          }
          case 'sup': {
            return <ToolbarSup key='bar-sup' />;
          }
          case 'quote': {
            return <ToolbarQuote key='bar-quote' />;
          }
          case 'unorderedList': {
            return <ToolbarUnorderedList key='bar-unorderedList' />;
          }
          case 'orderedList': {
            return <ToolbarOrderedList key='bar-orderedList' />;
          }
          case 'task': {
            return <ToolbarTask key='bar-task' />;
          }
          case 'codeRow': {
            return <ToolbarCodeRow key='bar-codeRow' />;
          }
          case 'code': {
            return <ToolbarCode key='bar-code' />;
          }
          case 'link': {
            return <ToolbarLink key='bar-link' />;
          }
          case 'image': {
            return noUploadImg ? (
              <ToolbarImage key='bar-image' />
            ) : (
              <ToolbarImageDropdown key='bar-imageDropdown' />
            );
          }
          case 'table': {
            return <ToolbarTable key='bar-table' />;
          }
          case 'revoke': {
            return <ToolbarRevoke key='bar-revoke' />;
          }
          case 'next': {
            return <ToolbarNext key='bar-next' />;
          }
          case 'save': {
            return <ToolbarSave key='bar-save' />;
          }
          case 'prettier': {
            return !noPrettier && <ToolbarPrettier key='bar-prettier' />;
          }
          case 'fullscreen': {
            return <ToolbarFullscreen key='bar-fullscreen' />;
          }
          case 'catalog': {
            return <ToolbarCatalog key='bar-catalog' />;
          }
          case 'preview': {
            return <ToolbarPreview key='bar-preview' />;
          }
          case 'previewStyle': {
            return <ToolbarPreviewStyle key='bar-previewStyle' />;
          }
          case 'previewOnly': {
            return <ToolbarPreviewOnly key='bar-previewOnly' />;
          }
          case 'htmlPreview': {
            return <ToolbarHtmlPreview key='bar-htmlPreview' />;
          }
          case 'github': {
            return <ToolbarGithub key='bar-github' />;
          }
          case 'mermaid': {
            return <ToolbarMermaid key='bar-mermaid' />;
          }
          case 'katex': {
            return <ToolbarKatex key='bar-katex' />;
          }
          default: {
            return null;
          }
        }
      }

      if (defToolbars) {
        const defItem = defToolbars[barItem as number] as ReactElement<
          any,
          React.FunctionComponent<any>
        >;

        if (defItem) {
          return cloneElement<any>(defItem, {
            theme: defItem.props?.theme || theme,
            codeTheme: defItem.props?.codeTheme || codeTheme,
            previewTheme: defItem.props?.previewTheme || previewTheme,
            language: defItem.props?.language || language,
            disabled: defItem.props?.disabled || disabled,
            showToolbarName: defItem.props?.showToolbarName || showToolbarName,
            insert(generate: TInsertContentGenerator) {
              bus.emit(editorId, REPLACE, 'universal', { generate });
            },
          });
        }
      }

      return null;
    },
    [
      codeTheme,
      defToolbars,
      disabled,
      editorId,
      language,
      noPrettier,
      noUploadImg,
      previewTheme,
      setting.fullscreen,
      showToolbarName,
      theme,
    ],
  );

  return { barRender };
};

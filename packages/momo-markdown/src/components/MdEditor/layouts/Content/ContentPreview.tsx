import { memo, useContext, useMemo } from 'react';
import { prefix } from '~/config';
import { EditorContext } from '~/context';

import { ISettingType } from '~/type';
import { classnames } from '~/utils';
import { useCopyCode, useMarkdownIt, useRemount, useTaskState, useZoom } from './hooks';
import { IContentPreviewProps } from './props';
import UpdateOnDemand from './UpdateOnDemand';

const ContentPreview = (props: IContentPreviewProps) => {
  const {
    previewOnly = false,
    setting = { preview: true } as ISettingType,
    previewComponent: PreviewComponent = UpdateOnDemand,
  } = props;
  const { editorId, previewTheme, showCodeRowNumber } = useContext(EditorContext);

  // markdown => html
  const { html, key } = useMarkdownIt(props, !!previewOnly);
  // 复制代码
  useCopyCode(props, html, key);
  // 图片点击放大
  useZoom(props, html);
  // 任务状态
  useTaskState(props, html);
  // 标准的重新渲染事件，能够正确获取到html
  useRemount(props, html, key);

  const previewNode = useMemo(() => {
    return (
      <PreviewComponent
        key={key}
        html={html}
        id={`${editorId}-preview`}
        className={classnames([
          `${prefix}-preview`,
          `${previewTheme || 'default'}-theme`,
          showCodeRowNumber && `${prefix}-scrn`,
        ])}
      />
    );
  }, [PreviewComponent, editorId, html, key, previewTheme, showCodeRowNumber]);

  return (
    <>
      {setting.preview &&
        (previewOnly ? (
          previewNode
        ) : (
          <div
            id={`${editorId}-preview-wrapper`}
            className={`${prefix}-preview-wrapper`}
            key='content-preview-wrapper'>
            {previewNode}
          </div>
        ))}
      {setting.htmlPreview && (
        <div
          id={`${editorId}-html-wrapper`}
          className={`${prefix}-preview-wrapper`}
          key='html-preview-wrapper'>
          <div className={`${prefix}-html`}>{html}</div>
        </div>
      )}
    </>
  );
};

export default memo(ContentPreview);

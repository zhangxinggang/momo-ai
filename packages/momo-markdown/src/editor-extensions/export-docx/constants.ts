import { HeadingLevel } from 'docx';

import { EXPORT_EDITOR_PREFIX } from '../export-constants';

export const MERMAID_CLASS = `${EXPORT_EDITOR_PREFIX}-mermaid`;
export const ECHARTS_CLASS = `${EXPORT_EDITOR_PREFIX}-echarts`;
export const PLANTUML_RENDERED_CLASS = `${EXPORT_EDITOR_PREFIX}-plantuml-rendered`;
export const PLANTUML_IMAGE_CLASS = `${EXPORT_EDITOR_PREFIX}-plantuml-image`;

export const HEADING_TAG_LEVEL: Record<string, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
  H1: HeadingLevel.HEADING_1,
  H2: HeadingLevel.HEADING_2,
  H3: HeadingLevel.HEADING_3,
  H4: HeadingLevel.HEADING_4,
  H5: HeadingLevel.HEADING_5,
  H6: HeadingLevel.HEADING_6,
};

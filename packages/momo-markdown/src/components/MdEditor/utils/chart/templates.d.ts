export interface IChartMenuItem {
  direct: string;
  labelZh: string;
  labelEn: string;
  template: string;
  lang: 'mermaid' | 'plantuml';
}
export declare const CHART_MENU_ITEMS: IChartMenuItem[];
export declare const getMermaidMenuItems: () => IChartMenuItem[];
export declare const getPlantumlMenuItems: () => IChartMenuItem[];
export declare const getChartTemplate: (direct: string) => string | undefined;
export declare const getChartFenceLang: (direct: string) => 'mermaid' | 'plantuml' | undefined;

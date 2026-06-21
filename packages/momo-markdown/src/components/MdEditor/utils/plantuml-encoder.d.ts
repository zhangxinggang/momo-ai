/** 将 PlantUML 源码编码为官方 SVG 服务可用的路径片段 */
export declare function encodePlantuml(source: string): Promise<string>;
export declare function buildPlantumlSvgUrl(_source: string, encoded: string): string;
export declare function buildPlantumlPngUrl(encoded: string): string;
export declare function normalizePlantumlSource(source: string): string;

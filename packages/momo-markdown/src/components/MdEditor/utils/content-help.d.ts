import CodeMirrorUt from '~/layouts/Content/codemirror';
export type TToolDirective =
  | 'bold'
  | 'underline'
  | 'italic'
  | 'strikeThrough'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'quote'
  | 'unorderedList'
  | 'orderedList'
  | 'task'
  | 'codeRow'
  | 'code'
  | 'link'
  | 'image'
  | 'table'
  | 'sub'
  | 'sup'
  | 'prettier'
  | 'flow'
  | 'flowLR'
  | 'sequence'
  | 'gantt'
  | 'class'
  | 'state'
  | 'pie'
  | 'relationship'
  | 'journey'
  | 'erDiagram'
  | 'requirement'
  | 'gitGraph'
  | 'c4Context'
  | 'mindmap'
  | 'timeline'
  | 'sankey'
  | 'xychart'
  | 'block'
  | 'packet'
  | 'kanban'
  | 'architecture'
  | 'radar'
  | 'eventModeling'
  | 'treemap'
  | 'venn'
  | 'ishikawa'
  | 'wardley'
  | 'cynefin'
  | 'treeView'
  | 'zenuml'
  | 'plantumlSequence'
  | 'plantumlClass'
  | 'plantumlActivity'
  | 'plantumlUseCase'
  | 'plantumlComponent'
  | 'plantumlState'
  | 'plantumlObject'
  | 'plantumlDeployment'
  | 'plantumlTiming'
  | 'plantumlRegex'
  | 'plantumlNwdiag'
  | 'plantumlSalt'
  | 'plantumlArchimate'
  | 'plantumlGantt'
  | 'plantumlMindmap'
  | 'plantumlWbs'
  | 'plantumlEbnf'
  | 'plantumlJson'
  | 'plantumlYaml'
  | 'katexInline'
  | 'katexBlock'
  | 'universal';
/**
 *
 * @param direct 操作指令
 * @param codeMirrorUt 编辑区辅助实例
 * @param params 自定义参数
 *
 * @returns string
 */
export declare const directive2flag: (
  direct: TToolDirective,
  codeMirrorUt: CodeMirrorUt,
  params?: any,
) => Promise<
  | {
      text: string;
      options: {
        deviationStart: number;
        replaceStart: number;
        replaceEnd: number;
      };
    }
  | {
      text: any;
      options: {
        select: boolean;
        replaceAll: boolean;
      };
    }
  | {
      text: string;
      options: {
        deviationStart: number;
        deviationEnd: number;
      };
    }
  | {
      text: string;
      options: {
        deviationStart?: undefined;
        deviationEnd?: undefined;
      };
    }
  | {
      text: any;
      options: {
        select: any;
        deviationStart: any;
        deviationEnd: any;
      };
    }
>;

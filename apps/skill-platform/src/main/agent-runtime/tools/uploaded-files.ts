import fs from 'node:fs/promises';
import { TextDecoder } from 'node:util';
import type { HostTool } from './broker';

export interface UploadedFile {
  sourceId: string;
  revision: string;
  name: string;
  mimeType: string;
  size: number;
  path: string;
}
export function uploadedFileTools(files: UploadedFile[], runCode: HostTool['execute']): HostTool[] {
  const tool = (
    id: string,
    description: string,
    inputSchema: any,
    execute: HostTool['execute'],
    effects: HostTool['effects'] = ['read'],
  ): HostTool => ({
    id,
    name: id.replaceAll('.', '_'),
    title: id,
    description,
    inputSchema,
    execute,
    effects,
    revision: '1',
    timeoutMs: 120000,
    parallelSafe: effects.every((effect) => effect === 'read'),
    idempotent: effects.every((effect) => effect === 'read'),
  });
  const object = (properties: any, required: string[] = []) => ({
    type: 'object',
    properties,
    required,
    additionalProperties: false,
  });
  const str = { type: 'string', minLength: 1, maxLength: 8000 };
  return [
    tool(
      'attachments.list',
      '列出当前会话上传的原文件及其只读绝对路径。上传文件独立于工作区，直接使用该路径，不要在工作区搜索。',
      object({}),
      async () => ({ files }),
    ),
    tool(
      'attachments.readFile',
      '按上传文件的 sourceId 或只读路径读取原始 UTF-8 文本。DOCX/PDF 等二进制文件应使用 execution_run 按需读取；上传时不解析。',
      object({ sourceId: str, path: str }),
      async (args) => {
        const source = files.find(
          (file) =>
            (args.sourceId || args.path) &&
            (!args.sourceId || file.sourceId === args.sourceId) &&
            (!args.path || file.path === args.path),
        );
        if (!source) throw Error('附件未绑定当前会话');
        if (source.size > 1024 * 1024)
          throw Error('文本超过读取限制，请使用 execution_run 按需读取');
        const stat = await fs.lstat(source.path);
        if (!stat.isFile() || stat.isSymbolicLink()) throw Error('附件路径不可读取');
        const bytes = await fs.readFile(source.path);
        if (/\.(docx?|pdf|xlsx?|pptx?|zip)$/i.test(source.name) || bytes.includes(0))
          throw Error('此附件为二进制原文件，请使用 execution_run 按需编写代码读取该路径');
        let text: string;
        try {
          text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        } catch {
          throw Error('此附件不是 UTF-8 文本，请使用 execution_run 按需读取');
        }
        return {
          sourceId: source.sourceId,
          name: source.name,
          path: source.path,
          text: text.slice(0, 60000),
        };
      },
    ),
    tool(
      'execution.run',
      '在 Harness 执行环境运行 Python、Node.js 或 PowerShell 代码，按需读取上传原文件（包括工作区之外的 DOCX/PDF）并输出所需内容。直接使用附件消息或 attachments_list 给出的只读绝对路径；原文件不应修改。Python 可用 zipfile/xml 等标准库读取 DOCX。代码执行遵守当前权限和审批。',
      object(
        {
          runtime: { type: 'string', enum: ['python', 'node', 'powershell'] },
          code: { type: 'string', minLength: 1, maxLength: 100000 },
          timeoutMs: { type: 'integer', minimum: 1, maximum: 120000 },
        },
        ['runtime', 'code'],
      ),
      runCode,
      ['execute'],
    ),
  ];
}

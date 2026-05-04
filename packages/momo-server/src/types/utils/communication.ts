export interface IMailOptions {
  from?: string;
  to?: string | string[];
  subject?: string;
  text?: string;
  html?: string;
  attachments?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export type TSendMailCallback = (err: Error | null, info?: unknown) => void;

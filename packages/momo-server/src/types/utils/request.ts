export interface IRequestOptions {
  url?: string;
  headers?: Record<string, string | number>;
  method?: string;
  encoding?: BufferEncoding;
  isBuffer?: boolean;
  json?: boolean;
  data?: string | Buffer | Record<string, unknown>;
  hostname?: string;
  port?: string | number;
  path?: string;
  auth?: string;
}

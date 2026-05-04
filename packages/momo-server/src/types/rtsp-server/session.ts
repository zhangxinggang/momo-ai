export interface IRtspResponseOptions {
  method?: string;
  code?: number;
  msg?: string;
  headers?: Record<string, string | number>;
  body?: string | Buffer;
}

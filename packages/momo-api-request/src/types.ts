export type ApiHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface IApiKeyValue {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export type ApiRequestBodyMode = 'none' | 'json' | 'text' | 'form-urlencoded';

export type ApiRequestAuth =
  | { type: 'none' }
  | { type: 'bearer'; token: string }
  | { type: 'basic'; username: string; password: string }
  | { type: 'api-key'; key: string; value: string; placement: 'header' | 'query' };

export interface IApiRequestConfig {
  method: ApiHttpMethod;
  url: string;
  query: IApiKeyValue[];
  headers: IApiKeyValue[];
  auth: ApiRequestAuth;
  body: {
    mode: ApiRequestBodyMode;
    content: string;
  };
  timeoutMs: number;
}

export interface IApiPreparedRequest {
  url: string;
  init: RequestInit;
}

export interface IApiRequestResponse {
  status: number;
  statusText: string;
  ok: boolean;
  url: string;
  headers: Record<string, string>;
  body: string;
  durationMs: number;
  sizeBytes: number;
  truncated: boolean;
}

export type ApiRequestExecutor = (config: IApiRequestConfig) => Promise<IApiRequestResponse>;

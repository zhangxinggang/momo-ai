export interface IRtmpHeader {
  fmt: number;
  cid: number;
  timestamp: number;
  length: number;
  type: number;
  stream_id: number;
}

export interface IRtmpPacketType {
  header: IRtmpHeader;
  clock: number;
  delta: number;
  payload: Buffer | null;
  capacity: number;
  bytes: number;
}

export interface IInvokeMessage {
  cmd?: string;
  streamId?: number;
  streamName?: string;
  transId?: number;
  cmdObj?: {
    app: string;
    objectEncoding?: number;
    [key: string]: unknown;
  };
  pause?: boolean;
  bool?: boolean;
  [key: string]: unknown;
}

export type IAMFMessage = Record<string, unknown>;

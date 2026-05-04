export interface IRtspPusherInfo {
  id: string;
  path: string;
  m3u8Path: string;
  transType: string;
  inBytes: number;
  outBytes: number;
  startTime: string;
  onlines: number;
}

export interface IRtspPushersQueryBody {
  start?: string | number;
  limit?: string | number;
  q?: string;
  sort?: keyof IRtspPusherInfo;
  order?: 'ascending' | 'descending';
}

/** RTSP 推流列表 API 的请求发送方 */
export interface IRtspPushersSender {
  req: {
    body?: IRtspPushersQueryBody;
    hostname: string;
    protocol: string;
    headers: Record<string, string>;
  };
  success: (data: unknown) => void;
}

export interface IRtspPusherSession {
  id: string;
  path: string;
  m3u8Path?: string;
  transType: string;
  inBytes: number;
  outBytes: number;
  startTime: number | Date | string;
}

export interface IRtspPushersServerStats {
  rtspServer: {
    port: number;
  };
  pushSessions: Record<string, IRtspPusherSession>;
  playSessions: Record<string, unknown[]>;
}

export interface IRtspPlayerInfo {
  id: string;
  path: string;
  transType: string;
  inBytes: number;
  outBytes: number;
  protocol: 'rtsp';
  startTime: string;
}

export interface IRtspPlayersQueryBody {
  start?: string | number;
  limit?: string | number;
  q?: string;
  sort?: keyof IRtspPlayerInfo;
  order?: 'ascending' | 'descending';
}

/** RTSP 播放列表 API 的请求发送方 */
export interface IRtspPlayersSender {
  req: {
    body?: IRtspPlayersQueryBody;
    hostname: string;
  };
  success: (data: unknown) => void;
}

export interface IRtspPlayerSession {
  id: string;
  transType: string;
  inBytes: number;
  outBytes: number;
  startTime: number | Date | string;
}

export interface IRtspPlayersServerStats {
  rtspServer: {
    port: number;
  };
  playSessions: Record<string, IRtspPlayerSession[]>;
}

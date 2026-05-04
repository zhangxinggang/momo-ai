/** RTMP 推流列表 API 的请求发送方 */
export interface IRtmpPushersSender {
  req: {
    protocol: string;
    headers: Record<string, string>;
  };
  success: (data: unknown) => void;
}

export interface IRtmpPublisherInfo {
  id: string;
  startTime: string;
  inBytes: number;
  outBytes: number;
  m3u8Path?: string;
  onlines: number;
  transType: string;
  ip?: string;
  audio: Record<string, unknown> | null;
  video: Record<string, unknown> | null;
  path?: string;
}

export interface IRtmpSessionStat {
  id: string;
  appname: string;
  isStarting: boolean;
  isPublishing: boolean;
  publishStreamPath: string;
  playStreamPath: string;
  connectCmdObj: {
    tcUrl: string;
  };
  m3u8Path?: string;
  startTime: number | Date | string;
  audioCodec: number;
  audioCodecName: string;
  audioProfileName: string;
  audioSamplerate: number;
  audioChannels: number;
  videoCodec: number;
  videoCodecName: string;
  videoWidth: number;
  videoHeight: number;
  videoProfileName: string;
  videoLevel: number;
  videoFps: number;
  socket: {
    bytesRead: number;
    bytesWritten: number;
    remoteAddress?: string;
  };
  constructor: {
    name?: string;
  };
}

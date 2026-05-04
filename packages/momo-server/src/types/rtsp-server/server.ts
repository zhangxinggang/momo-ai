export interface ISessionLike {
  type: 'pusher' | 'player';
  path: string;
  sendVideo?: (rtpBuf: Buffer) => void;
  sendVideoControl?: (rtpBuf: Buffer) => void;
  sendAudio?: (rtpBuf: Buffer) => void;
  sendAudioControl?: (rtpBuf: Buffer) => void;
}

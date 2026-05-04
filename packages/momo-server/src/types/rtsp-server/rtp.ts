export interface IPayloadTypeInfo {
  name: string;
  mediaType?: string;
  clockRate?: number;
  channels?: number;
}

export interface IParsedRtpPacket {
  version: number;
  padding: number;
  extension: number;
  csrcCount: number;
  marker: number;
  payloadType: number;
  sequenceNumber: number;
  timestamp: number;
  ssrc: number;
  payload: Buffer;
}

import type { Socket } from 'net';
import type { IRtmpAuthConfig } from '../runtime-config';

export interface IFlvPacketType {
  header: {
    length: number;
    timestamp: number;
    type: number;
  };
  payload: Buffer;
}

export interface IFlvRequest {
  method: string;
  url: string;
  nmsConnectionType?: string;
  socket: Socket;
  on: (event: string, listener: (...args: unknown[]) => void) => void;
}

export interface IFlvResponse {
  statusCode: number;
  send?: (data: Buffer) => void;
  close?: () => void;
  write: (data: Buffer) => void;
  end: () => void;
  on: (event: string, listener: (...args: unknown[]) => void) => void;
}

export interface IFlvServer {
  rtmpServer: {
    auth?: IRtmpAuthConfig;
  };
}

export interface IPublisherSession {
  players: Set<string>;
  isFirstAudioReceived: boolean;
  isFirstVideoReceived: boolean;
  metaData: Buffer | null;
  audioCodec: number;
  aacSequenceHeader: Buffer;
  videoCodec: number;
  avcSequenceHeader: Buffer;
  flvGopCacheQueue: Buffer[] | null;
}

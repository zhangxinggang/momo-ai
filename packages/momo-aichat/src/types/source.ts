export interface IChatSourceInput {
  sourceRef?: IChatSourceRef;
  name: string;
  mimeType: string;
  encoding: 'utf8' | 'base64';
  content: string;
}

export interface IChatSourceRef {
  originalAvailable?: boolean;
  sourceId: string;
  revision: string;
  name: string;
  mimeType: string;
  encoding: 'utf8' | 'base64';
  size: number;
}

export interface IResolvedChatSource extends IChatSourceRef {
  content: string;
}

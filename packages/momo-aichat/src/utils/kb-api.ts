import axios from 'axios';
import type { IKbChunk, IKbCollection } from '../adapters/types';

export function createKbApi(apiBaseUrl: string) {
  return {
    async listCollections(): Promise<IKbCollection[]> {
      const resp = await axios.get(`${apiBaseUrl}/api/kb/collections`);
      return resp.data?.items || [];
    },
    async getChunk(chunkId: number): Promise<IKbChunk> {
      const resp = await axios.get(`${apiBaseUrl}/api/kb/chunks/${chunkId}`);
      const data = resp.data;
      return {
        docName: data?.doc_name || data?.docName || '',
        idx: data?.idx ?? 0,
        tokens: data?.tokens ?? 0,
        content: data?.content || '',
      };
    },
  };
}

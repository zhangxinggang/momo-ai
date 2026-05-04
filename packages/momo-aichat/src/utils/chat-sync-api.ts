import axios from 'axios';
import type { IChatSyncAdapter } from '../adapters/types';
import type { IChatAttachmentMeta, IChatSession } from '../types/chat';

axios.defaults.withCredentials = true;

interface DCloudSession {
  session_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface DCloudMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

function convertDCloudSessionToLocal(
  cloudSession: DCloudSession,
  messages: DCloudMessage[],
): IChatSession {
  const parseContent = (
    msg: DCloudMessage,
  ): { display: string; attachments?: IChatAttachmentMeta[] } => {
    const raw = msg.content || '';
    if (msg.role === 'user' && raw.startsWith('{')) {
      try {
        const obj = JSON.parse(raw) as {
          __type?: string;
          v?: number;
          display?: string;
          attachments?: IChatAttachmentMeta[];
        };
        if (obj?.__type === 'chatstudio.msg' && (obj.v ?? 0) >= 1) {
          return {
            display: typeof obj.display === 'string' ? obj.display : raw,
            attachments: Array.isArray(obj.attachments) ? obj.attachments : undefined,
          };
        }
      } catch {
        // 非 JSON 用户消息
      }
    }
    return { display: raw };
  };

  return {
    id: cloudSession.session_id,
    title: cloudSession.title,
    messages: messages.map((msg, index) => {
      const parsed = parseContent(msg);
      return {
        id: `cloud-msg-${cloudSession.session_id}-${index}`,
        role: msg.role,
        content: parsed.display,
        attachments: parsed.attachments,
        timestamp: new Date(msg.timestamp).getTime(),
      };
    }),
    createdAt: new Date(cloudSession.created_at).getTime(),
    updatedAt: new Date(cloudSession.updated_at).getTime(),
  };
}

export function createChatSyncAdapter(apiBaseUrl: string): IChatSyncAdapter {
  const base = `${apiBaseUrl}/api`;

  return {
    async syncGuestData(sessions) {
      const formattedSessions = sessions.map((session) => ({
        id: session.id,
        title: session.title,
        messages: session.messages.map((message) => ({
          role: message.role,
          content: (() => {
            const atts = message.attachments;
            if (message.role === 'user' && Array.isArray(atts) && atts.length > 0) {
              try {
                return JSON.stringify({
                  __type: 'chatstudio.msg',
                  v: 1,
                  role: message.role,
                  display: message.content,
                  attachments: atts,
                });
              } catch {
                return message.content;
              }
            }
            return message.content;
          })(),
          timestamp: new Date(message.timestamp).toISOString(),
        })),
        createdAt: new Date(session.createdAt).toISOString(),
      }));

      const response = await axios.post(`${base}/chat-sync/sync-guest-data`, {
        sessions: formattedSessions,
      });
      return !!response.data?.success;
    },

    async loadCloudData() {
      const sessionsResp = await axios.get(`${base}/chat-sync/sessions`);
      if (!sessionsResp.data?.success) {
        throw new Error(sessionsResp.data?.message || '获取云端会话失败');
      }
      const cloudSessions: DCloudSession[] = sessionsResp.data.sessions || [];
      const localSessions: IChatSession[] = [];

      const results = await Promise.allSettled(
        cloudSessions.map(async (cloudSession) => {
          const msgResp = await axios.get(
            `${base}/chat-sync/sessions/${cloudSession.session_id}/messages`,
          );
          const messages: DCloudMessage[] = msgResp.data?.messages || [];
          return convertDCloudSessionToLocal(cloudSession, messages);
        }),
      );

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          localSessions.push(result.value);
        }
      });

      return localSessions.sort((a, b) => b.updatedAt - a.updatedAt);
    },

    async saveMessage(sessionId, role, content, title) {
      const response = await axios.post(`${base}/chat-sync/sessions/${sessionId}/messages`, {
        role,
        content,
        title,
      });
      if (!response.data?.success) {
        throw new Error(response.data?.message || '保存消息失败');
      }
    },

    async deleteSession(sessionId) {
      const response = await axios.delete(`${base}/chat-sync/sessions/${sessionId}`);
      if (!response.data?.success) {
        throw new Error(response.data?.message || '删除会话失败');
      }
    },
  };
}

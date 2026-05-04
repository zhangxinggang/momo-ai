import { EventEmitter } from 'events';
import net, { Server } from 'net';
import type { IRtmpServerConfig } from '../../types/runtime-config';
import RTMPSession = require('./node_rtmp_session');
import context = require('./core_ctx');

class RtmpServer extends EventEmitter {
  private readonly rtmpServer: IRtmpServerConfig;
  private readonly pushSessions: Record<string, unknown>;
  private readonly playSessions: Record<string, unknown>;
  private readonly server: Server;

  constructor(rtmpServer: IRtmpServerConfig) {
    super();
    this.rtmpServer = rtmpServer;
    this.pushSessions = {};
    this.playSessions = {};
    this.server = net.createServer();
    this.server
      .on('connection', (socket) => {
        new RTMPSession(socket, this);
      })
      .on('error', (err) => {
        console.error('rtmp server error:', err);
      })
      .on('listening', async () => {
        console.info(`[rtmpServer] started at port ${rtmpServer.port || 1935}`);
      });
  }

  start(callback?: () => void): void {
    if (this.rtmpServer && this.rtmpServer.start) {
      this.server.listen(this.rtmpServer.port || 1935, () => {
        callback?.();
      });
      this.stats();
    } else {
      callback?.();
    }
  }

  stats(): void {
    (context as { server: unknown }).server = this;
  }

  stop(): void {
    this.server.close();
    context.sessions.forEach((session, id) => {
      if (session instanceof RTMPSession) {
        session.socket.destroy();
        context.sessions.delete(id);
      }
    });
  }
}

export default RtmpServer;

import net, { Server, Socket } from 'net';
import type { IPortServiceConfig } from '../../types/runtime-config';

let tcpConnCount = 0;

class TcpServer {
  private readonly tcpServer: IPortServiceConfig;
  private server?: Server;

  constructor(tcpServer: IPortServiceConfig) {
    this.tcpServer = tcpServer;
  }

  start(callback?: () => void): void {
    if (this.tcpServer && this.tcpServer.start) {
      this.server = net.createServer();
      this.server.on('connection', (socket: Socket) => {
        console.log('tcpConnection++');
        tcpConnCount++;
        socket.on('data', (content: Buffer) => {
          socket.write(content);
        });
        socket.on('error', () => {
          console.log('tcpConnection--');
          tcpConnCount--;
        });
      });
      const tcpPort = this.tcpServer.port || 8087;
      this.server.listen(tcpPort, () => {
        console.info(`[tcpServer] started at port ${tcpPort}`);
        callback?.();
      });
      return;
    }
    callback?.();
  }
}

export default TcpServer;

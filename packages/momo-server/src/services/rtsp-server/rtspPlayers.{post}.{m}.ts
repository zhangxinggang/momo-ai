const escapeStringRegexp: (value: string) => string = require('escape-string-regexp');
const moment: (input?: unknown) => { format: (formatStr: string) => string } = require('moment');
import type {
  IRtspPlayerInfo,
  IRtspPlayersSender,
  IRtspPlayersServerStats,
} from '../../types/rtsp-server/rtsp-players-api';
import context = require('./core_ctx');

module.exports = function (sender: IRtspPlayersSender): void {
  const body = sender.req.body || {};
  /**
     * @return {[type]}               [description]
    {
        "total":1,
        "rows":[{
            "id":"vzsAuQp2L",
            "path":"rtsp://127.0.0.1:554/test.sdp",
            "transType":"tcp",
            "inBytes":609,
            "outBytes":18310747,
            "startTime":"2019-01-11 08:32:32"
        }]
    }
     */
  const rtspServer = (context as unknown as { server?: IRtspPlayersServerStats }).server;
  if (!rtspServer) {
    sender.success({
      total: 0,
      rows: [],
    });
    return;
  }
  let players: IRtspPlayerInfo[] = [];
  const start = parseInt(String(body.start ?? 0), 10) || 0;
  const limit = parseInt(String(body.limit ?? 10), 10) || 10;
  const q = body.q || '';
  const sort = body.sort;
  const order = body.order;
  for (const path in rtspServer.playSessions) {
    const sessionPlayers = rtspServer.playSessions[path] || [];
    const streamUrl = `rtsp://${sender.req.hostname}:${rtspServer.rtspServer.port}${path}`;
    const mappedPlayers: IRtspPlayerInfo[] = sessionPlayers.map((player) => {
      return {
        id: player.id,
        path: streamUrl,
        transType: player.transType,
        inBytes: player.inBytes,
        outBytes: player.outBytes,
        protocol: 'rtsp',
        startTime: moment(player.startTime).format('YYYY-MM-DD HH:mm:ss'),
      };
    });
    players = players.concat(mappedPlayers);
  }
  if (sort && sort in (players[0] || {})) {
    players.sort((a, b) => {
      return String(a[sort]).localeCompare(String(b[sort])) * (order === 'ascending' ? 1 : -1);
    });
  }
  if (q) {
    players = players.filter((v) => {
      const exp = new RegExp(escapeStringRegexp(q));
      return exp.test(v.path) || exp.test(v.id);
    });
  }
  sender.success({
    total: players.length,
    rows: players.slice(start, start + limit),
  });
};

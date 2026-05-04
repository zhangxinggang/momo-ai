const escapeStringRegexp: (value: string) => string = require('escape-string-regexp');
const moment: (input?: unknown) => { format: (formatStr: string) => string } = require('moment');
import path from 'path';
import type {
  IRtspPusherInfo,
  IRtspPushersSender,
  IRtspPushersServerStats,
} from '../../types/rtsp-server/rtsp-pushers-api';
import context = require('./core_ctx');

module.exports = function (sender: IRtspPushersSender): void {
  const httpServerPath = String(NKGlobal.config.httpServerPath || '');
  const formLiveParam = require(path.join(httpServerPath, 'servers/video/formLiveParam.js'));
  const body = sender.req.body || {};
  /**
     * @return {[type]}
     * 
        {
            "total":1,
            "rows":[{
                "id":"dtr1nHNAm",
                "path":"rtsp://127.0.0.1:554/test.sdp",
                "transType":"udp",
                "inBytes":6192000,
                "outBytes":359,
                "startTime":"2019-01-10 16:51:54",
                "onlines":0
            }]
        }
     * 
     */
  const rtspServer = (context as unknown as { server?: IRtspPushersServerStats }).server;
  if (!rtspServer) {
    sender.success({
      total: 0,
      rows: [],
    });
    return;
  }
  let pushers: IRtspPusherInfo[] = [];
  const start = parseInt(String(body.start ?? 0), 10) || 0;
  const limit = parseInt(String(body.limit ?? 10), 10) || 10;
  const q = body.q || '';
  const sort = body.sort;
  const order = body.order;
  for (const pathKey in rtspServer.pushSessions) {
    const pusher = rtspServer.pushSessions[pathKey];
    const streamUrl = `rtsp://${sender.req.hostname}:${rtspServer.rtspServer.port}${pusher.path}`;
    //m3u8閸︽澘娼?
    if (!pusher.m3u8Path) {
      const currentStream: Record<string, unknown> = {
        deviceName: pusher.id,
        streamUrl: streamUrl,
      };
      Object.assign(currentStream, NKGlobal.config.video?.camera || {});
      const m3u8Path = `${sender.req.protocol}://${sender.req.headers.host}${formLiveParam.liveAddr(currentStream)}`;
      currentStream.tempLive = true;
      const LiveStream = require(path.join(httpServerPath, 'servers/video/liveStream.js'));
      const tempStream = new LiveStream(currentStream);
      tempStream.start();
      pusher.m3u8Path = m3u8Path;
    }
    pushers.push({
      id: pusher.id,
      path: streamUrl,
      m3u8Path: pusher.m3u8Path,
      transType: pusher.transType,
      inBytes: pusher.inBytes,
      outBytes: pusher.outBytes,
      startTime: moment(pusher.startTime).format('YYYY-MM-DD HH:mm:ss'),
      onlines: (rtspServer.playSessions[pathKey] || []).length,
    });
  }
  if (sort && sort in (pushers[0] || {})) {
    pushers.sort((a, b) => {
      return String(a[sort]).localeCompare(String(b[sort])) * (order === 'ascending' ? 1 : -1);
    });
  }
  if (q) {
    pushers = pushers.filter((v) => {
      const exp = new RegExp(escapeStringRegexp(q));
      return exp.test(v.path) || exp.test(v.id);
    });
  }
  sender.success({
    total: pushers.length,
    rows: pushers.slice(start, start + limit),
  });
};

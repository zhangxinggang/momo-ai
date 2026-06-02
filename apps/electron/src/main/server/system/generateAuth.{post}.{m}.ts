const { DiffieHellman } = global.NKRequire('NKH', 'security');

const HALF_YEAR_MS = 0.5 * 365 * 24 * 60 * 60 * 1000;

module.exports = function (sender) {
  const { machineId, startTime, endTime } = sender.request.body;
  if (!machineId) {
    sender.error({ message: 'machineId is required' });
    return;
  }
  const sTime = startTime != null ? Number(startTime) : Date.now();
  const eTime = endTime != null ? Number(endTime) : HALF_YEAR_MS;
  const str = DiffieHellman.encrypt(
    JSON.stringify({
      machineId,
      startTime: sTime,
      endTime: eTime,
    }),
  );
  sender.success({ code: 200, data: str });
};

export {};

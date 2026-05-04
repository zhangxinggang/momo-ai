const { DiffieHellman } = NKRequire('NKH', 'security');
const { machineIdSync } = require('node-machine-id');

module.exports = async function (sender) {
  const { authCode } = sender.request.body;
  const trimmed = typeof authCode === 'string' ? authCode.trim() : '';
  if (!trimmed) {
    sender.error({ message: 'authCode is required' });
    return;
  }
  try {
    const result = await DiffieHellman.decrypt(trimmed);
    const { machineId, startTime, endTime } = JSON.parse(result);
    if (!machineId) {
      sender.error({ message: 'machineId is required' });
      return;
    }
    if (startTime > Date.now() || endTime < Date.now()) {
      sender.error({ message: '授权已过期' });
      return;
    }
    if (machineId !== machineIdSync(true)) {
      sender.error({ message: '授权与当前设备不匹配' });
      return;
    }
    sender.success({ code: 200, message: '授权成功' });
  } catch (err) {
    const message = err instanceof Error ? err.message : '授权失败';
    sender.error({ message });
  }
};

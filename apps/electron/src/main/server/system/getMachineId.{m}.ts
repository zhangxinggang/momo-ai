const { machineIdSync } = require('node-machine-id');

module.exports = function (sender) {
  sender.success({ code: 200, data: machineIdSync(true) });
};

export {};

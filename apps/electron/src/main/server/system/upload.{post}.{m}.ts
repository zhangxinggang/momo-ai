import { UPLOAD_FOLDER } from '../../../utils/constant';

module.exports = function (sender) {
  const { buildHttpUrl } = require('@momo/utils/tools/url');
  const file = sender.request.files; // 获取上传的文件对象
  const httpServer = global.NKGlobal.config.services.httpServer;

  const response = {};
  Object.keys(file).forEach((key) => {
    const origin = `http://localhost:${httpServer.protocols.http.port}`;
    response[key] = {
      fileurl: buildHttpUrl(origin, UPLOAD_FOLDER, file[key].newFilename),
      newFilename: file[key].newFilename,
      originalFilename: file[key].originalFilename,
      size: file[key].size,
      mimetype: file[key].mimetype,
    };
  });
  sender.success(response);
};

export {};

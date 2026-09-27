module.exports = function (sender) {
  // System routes are emitted separately; avoid imports from the bundled Electron entry.
  const path = require('node:path');
  const file = sender.request.files; // 获取上传的文件对象
  const httpServer = global.NKGlobal.config.services.httpServer;
  const uploadDir = httpServer.bodyparser.formidable.uploadDir;
  const uploadRoute = httpServer.routes.staticDirs.find(
    (route) => path.resolve(route.rootDir) === path.resolve(uploadDir),
  );
  if (!uploadRoute) throw new Error('上传资源目录未配置');
  if (!file || Object.keys(file).length === 0) {
    sender.throw(400, '请选择需要上传的文件');
  }
  const origin = `http://localhost:${httpServer.protocols.http.port}`;
  const rootPath = uploadRoute.rootPath.replace(/^\/+|\/+$/g, '');

  const response = {};
  Object.keys(file).forEach((key) => {
    response[key] = {
      fileurl: new URL(`${rootPath}/${encodeURIComponent(file[key].newFilename)}`, origin).href,
      newFilename: file[key].newFilename,
      originalFilename: file[key].originalFilename,
      size: file[key].size,
      mimetype: file[key].mimetype,
    };
  });
  sender.success(response);
};

export {};

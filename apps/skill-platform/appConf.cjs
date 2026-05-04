/**
 * 与 @momo/electron 基座约定一致：与 static、server 同处应用根目录，打包后与可执行文件同层。
 * loadURL 非空时优先于默认 Vite / renderer 入口。
 */
module.exports = {
  appName: 'PromptHub',
  loadURL: '',
  openDevTools: true,
  closeConfirm: false,
  bundledNodeServer: true,
  server: {
    httpPort: 28081,
    upload: {
      maxFileSize: 1000 * 1024 * 1024,
    },
  },
};

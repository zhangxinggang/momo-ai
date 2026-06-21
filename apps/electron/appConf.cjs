module.exports = {
  appName: 'electron',
  loadUrl: '',
  openDevTools: true,
  closeConfirm: true,
  onlineConfUrl: '',
  databaseName: 'database.sql',
  browserWindow: {
    width: 1200,
  },
  server: {
    httpPort: 8081,
    httpsPort: 8080,
    filePreviewBaseUrl: 'https://demo.file-viewer.app',
    upload: {
      maxFileSize: 1000 * 1024 * 1024,
    },
    autoRunDirs: [],
    proxyRoutes: {
      '/NKWeather': {
        target: 'http://wthrcdn.etouch.cn/weather_mini',
        pathRewrite: {
          '^/NKWeather': '',
        },
        changeOrigin: true,
        secure: false,
        auth: false,
      },
    },
  },
};

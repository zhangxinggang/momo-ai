## 运行报错

```
throw new Error('Electron failed to install correctly, please delete node_modules/electron and try installing again');
```

参考：https://github.com/pangxieju/electron-fix

```
npm install electron-fix -g
electron-fix start
```

## sqllite使用nativeBinding

```
参考：https://juejin.cn/post/7424425429699198991
Electron npm：39.8.2  对应Electron 140版本
下载
better-sqlite3-v12.4.4-electron-v140-win32-x64.tar.gz
```

## markdown

https://github.com/md-reader/markdown-it-mermaid/blob/master/package.json

## 设计思路

- static 为 静态文件放置的地方
- server 为 后端node文件执行的脚本
- appConf 为项目配置文件

打包后，static，server，appConf都在项目的根目录

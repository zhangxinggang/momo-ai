import fs from 'fs';
import multiparty from 'multiparty';
import path from 'path';
import { fileURLToPath } from 'url';
import { Plugin, ViteDevServer } from 'vite';

const __dirname = fileURLToPath(new URL('..', import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../example/public');
const LOCAL_IMG_PATH = path.join(PUBLIC_DIR, 'temp.local');

export default (): Plugin => {
  return {
    name: 'node-service',
    configureServer: (server: ViteDevServer) => {
      server.middlewares.use((req, res, next) => {
        if (/^\/api\/img\/upload$/.test(req.url)) {
          if (!fs.existsSync(LOCAL_IMG_PATH)) {
            fs.mkdirSync(LOCAL_IMG_PATH, {
              recursive: true,
            });
          }

          const form = new multiparty.Form({
            uploadDir: LOCAL_IMG_PATH,
          });

          form.parse(req, (err, fields, files) => {
            const savedPath = files.file[0].path;
            const filename = '/' + path.relative(PUBLIC_DIR, savedPath).replace(/\\/g, '/');

            res.end(
              JSON.stringify({
                code: 0,
                url: filename,
              }),
            );
          });
        } else {
          next();
        }
      });
    },
  };
};

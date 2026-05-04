const path = require('path');
const chalk = require('chalk');
const fs = require('fs');
const prepare = require('./prepare.cjs');

const distRoot = path.join(__dirname, '..', 'dist');
const outDir = path.join(distRoot, 'src');

if (fs.existsSync(distRoot)) {
  fs.rmSync(distRoot, {
    recursive: true,
    force: true,
  });
}

console.log(chalk.blueBright('Building with Vite...'));

prepare().then(() => {
  console.log(
    chalk.greenBright(
      `successfully built to ${outDir}! (ready to be built with electron-builder)`,
    ),
  );
});

const fs = require('fs');
const path = require('path');

const distRoot = path.join(__dirname, '..', 'dist');
fs.writeFileSync(path.join(distRoot, 'package.json'), JSON.stringify({ type: 'commonjs' }, null, 2));

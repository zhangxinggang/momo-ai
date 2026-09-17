import './icons-B5Lu0sqU.js';
import './index-C2avURFS.js';
import './markdown-it-vendor-DL4wSELR.js';
import './markdown-vendor-DldLOD9R.js';
import './percentages-BXMCSKIN-BjlwlnnH.js';
import { subsetToBinary as o, Commands as r } from './subset-shared.chunk-ff5n5xs6.js';
import './ui-vendor-C-FKu2uc.js';
var d = import.meta.url ? new URL(import.meta.url) : void 0;
typeof window > 'u' &&
  typeof self < 'u' &&
  (self.onmessage = async (a) => {
    if (a.data.command === r.Subset) {
      let t = await o(a.data.arrayBuffer, a.data.codePoints);
      self.postMessage(t, { transfer: [t] });
    }
  });
export { d as WorkerUrl };

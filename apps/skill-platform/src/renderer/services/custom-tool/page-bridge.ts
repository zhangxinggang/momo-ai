/** The sandbox receives a narrow request API, never Electron, models or credentials. */
export function toolPageSource(html: string, token: string) {
  const script = `<script>(function(){
const token=${JSON.stringify(token)}, pending=new Map(); let sequence=0;
function request(method,payload){return new Promise((resolve,reject)=>{const id=String(++sequence);pending.set(id,{resolve,reject});parent.postMessage({channel:'momo-page',token,id,method,payload},'*');});}
window.addEventListener('message',event=>{const msg=event.data;if(event.source!==parent||msg?.channel!=='momo-host'||msg.token!==token)return;if(msg.id){const item=pending.get(msg.id);if(item){pending.delete(msg.id);msg.error?item.reject(new Error(msg.error)):item.resolve(msg.result);}}else window.dispatchEvent(new CustomEvent('momo:progress',{detail:msg.state}));});
window.momo=Object.freeze({invoke:(action,fields={},files=[])=>request('run',{action,fields,files:Array.from(files)}),status:()=>request('status'),stop:()=>request('stop'),exportDocx:()=>request('export')});
window.addEventListener('DOMContentLoaded',()=>{let height=0;const measure=()=>{const body=document.body;if(!body)return;const style=getComputedStyle(body);const next=Math.ceil(body.getBoundingClientRect().height+(parseFloat(style.marginTop)||0)+(parseFloat(style.marginBottom)||0));if(next>0&&next!==height){height=next;parent.postMessage({channel:'momo-page',token,id:'layout',method:'resize',payload:{height}},'*');}};new ResizeObserver(measure).observe(document.body);measure();});
})();</script>`;
  return /<head\b[^>]*>/i.test(html)
    ? html.replace(/<head\b[^>]*>/i, (match) => match + script)
    : script + html;
}

export function isPageRequest(event: MessageEvent, frame: Window | null, token: string): boolean {
  const data = event.data;
  return Boolean(
    frame &&
    event.source === frame &&
    data?.channel === 'momo-page' &&
    data.token === token &&
    typeof data.id === 'string' &&
    data.id.length <= 100,
  );
}

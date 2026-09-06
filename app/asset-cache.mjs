import fs from 'node:fs';
import {promises as fsp} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'data/brown-dust-assets.json'),'utf8'));
const allowed=new Map(manifest.files.map(f=>[f.path,f]));
const inflight=new Map(),queue=[];let active=0;
export async function ensureAsset(assetPath){
  if(!allowed.has(assetPath))throw new Error('找不到這個角色資源');
  const target=path.resolve(root,'.asset-cache',assetPath);
  const cacheRoot=path.resolve(root,'.asset-cache');
  if(!target.startsWith(cacheRoot+path.sep))throw new Error('無效的資源路徑');
  if(fs.existsSync(target))return target;
  if(inflight.has(assetPath))return inflight.get(assetPath);
  const pending=(async()=>{
    if(active>=6)await new Promise(resolve=>queue.push(resolve));else active++;
    try{
      const url=`https://raw.githubusercontent.com/${manifest.repository}/${manifest.commit}/${assetPath.split('/').map(encodeURIComponent).join('/')}`;
      let response;
      for(let attempt=0;attempt<3;attempt++){
        response=await fetch(url,{signal:AbortSignal.timeout(60000)});
        if(response.ok)break;
        if(response.status<500)throw new Error('角色資源下載失敗');
      }
      if(!response?.ok)throw new Error('來源暫時無法回應');
      const bytes=Buffer.from(await response.arrayBuffer());
      if(!bytes.length)throw new Error('角色資源內容為空');
      await fsp.mkdir(path.dirname(target),{recursive:true});
      await fsp.writeFile(target+'.part',bytes);await fsp.rename(target+'.part',target);
      return target;
    }finally{const next=queue.shift();if(next)next();else active--;}
  })();
  inflight.set(assetPath,pending);
  try{return await pending;}finally{inflight.delete(assetPath);}
}
export function hasAsset(assetPath){return allowed.has(assetPath);}

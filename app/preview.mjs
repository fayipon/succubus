import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ensureAsset,hasAsset} from './asset-cache.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.atlas':'text/plain','.skel':'application/octet-stream'};
export const server=createServer(async(req,res)=>{
  try{
    if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405).end();return;}
    const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1:4173').pathname);
    let file;
    if(pathname.startsWith('/character-assets/')){
      const asset=pathname.slice('/character-assets/'.length);
      if(!hasAsset(asset)){res.writeHead(404).end('找不到角色資源');return;}
      file=await ensureAsset(asset);
    }else{
      file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
      if(!file.startsWith(root+sep)){res.writeHead(403).end();return;}
    }
    const data=await readFile(file);
    res.writeHead(200,{'Content-Type':types[extname(file)]??'application/octet-stream','Cache-Control':pathname.startsWith('/character-assets/')?'public, max-age=31536000, immutable':'no-cache'}).end(req.method==='HEAD'?undefined:data);
  }catch(error){res.writeHead(error.code==='ENOENT'?404:502,{'Content-Type':'text/plain; charset=utf-8'}).end('讀取失敗，請稍後重試。');}
});
if(process.argv[1]===fileURLToPath(import.meta.url))server.listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));

import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.glb':'model/gltf-binary','.gltf':'model/gltf+json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg'};
createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const path=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!path.startsWith(root+sep)){res.writeHead(403).end();return;}const data=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]??'application/octet-stream'}).end(data);}catch{res.writeHead(404).end('Not found');}}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));

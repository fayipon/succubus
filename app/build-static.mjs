import {build} from 'rolldown';
import {compile} from '@tailwindcss/node';
import {readFile,mkdir,writeFile,cp,readdir,unlink} from 'node:fs/promises';
import {resolve} from 'node:path';
await mkdir('dist',{recursive:true});
// Remove only generated JavaScript chunks so old builds cannot ship stale code.
await mkdir('dist/assets',{recursive:true});
for(const file of await readdir('dist/assets'))if(file.endsWith('.js'))await unlink(resolve('dist/assets',file));
await build({input:'client.tsx',platform:'browser',resolve:{alias:{'@':resolve('.')}},transform:{jsx:{runtime:'automatic'},define:{'process.env.NODE_ENV':JSON.stringify('production')}},output:{dir:'dist/assets',format:'esm',entryFileNames:'app.js',minify:true}});
const compiler=await compile(await readFile('app/globals.css','utf8'),{base:resolve('app'),onDependency:()=>{}});
const button=await readFile('components/ui/button.tsx','utf8');
await writeFile('dist/styles.css',compiler.build(button.match(/[\w\-:/[\].%]+/g)??[]));
await cp('public','dist',{recursive:true});
await writeFile('dist/index.html','<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Succubus — Character Archive</title><meta name="description" content="探索 Succubus 3D 人物與房間展示。"><link rel="icon" href="./favicon.svg"><link rel="stylesheet" href="./styles.css"></head><body><div id="root"></div><script type="module" src="./assets/app.js"></script></body></html>');
console.log('Static production build complete: dist');



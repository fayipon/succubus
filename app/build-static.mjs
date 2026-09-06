import {build} from 'rolldown';
import {compile} from '@tailwindcss/node';
import {readFile,mkdir,writeFile,cp,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ensureAsset} from './asset-cache.mjs';
// This directory is generated. Clear it so removed public assets cannot ship again.
const output=resolve('dist');
if(output!==fileURLToPath(new URL('./dist',import.meta.url)))throw new Error('Run the build from the app directory.');
await rm(output,{recursive:true,force:true});
await mkdir('dist/assets',{recursive:true});
await build({input:'client.tsx',platform:'browser',resolve:{alias:{'@':resolve('.')}},transform:{jsx:{runtime:'automatic'},define:{'process.env.NODE_ENV':JSON.stringify('production')}},output:{dir:'dist/assets',format:'esm',entryFileNames:'app.js',minify:true}});
const compiler=await compile(await readFile('app/globals.css','utf8'),{base:resolve('app'),onDependency:()=>{}});
const button=await readFile('components/ui/button.tsx','utf8');
await writeFile('dist/styles.css',compiler.build(button.match(/[\w\-:/[\].%]+/g)??[]));
await cp('public','dist',{recursive:true});
// Package the character assets too, so a static build works without the viewer server.
const assetManifest=JSON.parse(await readFile('data/brown-dust-assets.json','utf8'));
const remainingAssets=[...assetManifest.files];
await Promise.all(Array.from({length:6},async()=>{
  while(remainingAssets.length){
    const asset=remainingAssets.pop();
    const source=await ensureAsset(asset.path);
    const destination=resolve('dist/character-assets',asset.path);
    await mkdir(resolve(destination,'..'),{recursive:true});
    await cp(source,destination);
  }
}));
await cp('licenses','dist/licenses',{recursive:true});
await writeFile('dist/index.html','<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>魅魔店 — 人物圖鑑</title><meta name="description" content="探索人物圖鑑、皮膚與互動動畫。"><link rel="icon" href="./favicon.svg"><link rel="stylesheet" href="./styles.css"></head><body><div id="root"></div><script type="module" src="./assets/app.js"></script></body></html>');
console.log('Static production build complete: dist');



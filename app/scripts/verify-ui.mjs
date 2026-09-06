import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {build} from 'rolldown';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ensureAsset} from '../asset-cache.mjs';
const characters=JSON.parse(fs.readFileSync('lib/brown-dust-characters.json','utf8'));
fs.mkdirSync('work',{recursive:true});
await build({input:'components/character-list.tsx',platform:'node',external:['react','react/jsx-runtime','@esotericsoftware/spine-player'],resolve:{alias:{'@':resolve('.')}},transform:{jsx:{runtime:'automatic'}},output:{file:'work/verify-ui.mjs',format:'esm'}});
const {default:CharacterList}=await import(pathToFileURL(resolve('work/verify-ui.mjs')).href);
const html=renderToStaticMarkup(createElement(CharacterList,{onBack(){}}));
assert.equal((html.match(/class="lounge-card /g)??[]).length,69);
assert.equal((html.match(/class="character-skin /g)??[]).length,4);
assert(html.includes('內布利斯'));assert(!html.includes('SSR'));assert(!html.includes('>SR<'));
const visible=html.replace(/<[^>]+>/g,'').replace(/&[^;]+;/g,'');assert(!/[A-Za-z\u3040-\u30ff]/.test(visible),visible);
for(const c of characters){assert.equal(new Set(c.skins.map(s=>s.name)).size,c.skins.length);}
const originalFetch=globalThis.fetch;
globalThis.fetch=async()=>{throw new Error('離線測試禁止網路');};
for(const c of characters)for(const s of c.skins){await ensureAsset(s.skeleton);await ensureAsset(s.atlas);await ensureAsset(s.thumbnail);}
await assert.rejects(()=>ensureAsset('../preview.mjs'));
globalThis.fetch=originalFetch;
const base='http://127.0.0.1:4173';
assert.equal((await fetch(base+'/')).status,200);
const skin=characters.find(c=>c.id==='Nebris').skins[0];
for(const file of [skin.skeleton,skin.atlas,skin.thumbnail]){
 const url='/character-assets/'+file.split('/').map(encodeURIComponent).join('/');
 const response=await fetch(base+url);assert.equal(response.status,200,url);
 assert.deepEqual(Buffer.from(await response.arrayBuffer()),fs.readFileSync(resolve('dist/character-assets',file)));
}
assert.equal((await fetch(base+'/character-assets/unknown.png')).status,404);
console.log('PASS：69 位角色、預設人物的 4 款皮膚、繁體中文介面、皮膚名稱唯一、離線快取、本地資源與完整靜態建置一致。');

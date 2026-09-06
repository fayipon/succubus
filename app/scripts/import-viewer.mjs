import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const app=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=path.resolve(process.argv[2]||'');
if(!process.argv[2])throw new Error('請指定原本 viewer 的資料夾。');
const read=(file)=>JSON.parse(fs.readFileSync(path.join(source,file),'utf8'));
const dictionary=(file)=>Object.fromEntries(fs.readFileSync(path.join(app,'data',file),'utf8').trim().split(/\r?\n/).map(line=>line.trim().split('=')));
const names=dictionary('female-names.txt'),labels=dictionary('skin-names.txt');
const catalog=read('public/catalog.json');
const groups=new Map(),allowed=new Set();
for(const entry of catalog.entries.filter(e=>e.category==='character'&&Object.hasOwn(names,e.title))){
  const id=entry.title==='Sacred Justia'?'Justia':entry.title;
  if(!groups.has(id))groups.set(id,{id,name:names[entry.title],gender:'female',skins:[]});
  if(!labels[entry.subtitle])throw new Error('缺少繁體中文皮膚名稱：'+entry.subtitle);
  const group=groups.get(id),same=group.skins.filter(s=>s.sourceLabel===entry.subtitle).length;
  const skin={id:entry.id,name:labels[entry.subtitle]+(same?`・款式${same+1}`:''),sourceLabel:entry.subtitle,skeleton:entry.skeleton,atlas:entry.atlas,thumbnail:entry.thumbnail};
  group.skins.push(skin);
  for(const f of [...entry.files,entry.thumbnail].filter(Boolean))allowed.add(f);
}
const characters=[...groups.values()];
const files=read('data/files.json').filter(f=>allowed.has(f.path));
fs.writeFileSync(path.join(app,'lib/brown-dust-characters.json'),JSON.stringify(characters,null,2));
fs.writeFileSync(path.join(app,'data/brown-dust-assets.json'),JSON.stringify({repository:catalog.repository,commit:catalog.commit,files},null,2));
let copied=0;
for(const file of files){const from=path.join(source,'cache',file.path),to=path.join(app,'.asset-cache',file.path);if(fs.existsSync(from)&&!fs.existsSync(to)){fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to);copied++;}}
for(const file of ['assets-repository-LICENSE.txt','spine-runtime-LICENSE.txt'])fs.copyFileSync(path.join(source,'licenses',file),path.join(app,'licenses',file));
console.log(`${characters.length} 位女性角色，${characters.reduce((n,c)=>n+c.skins.length,0)} 套皮膚；沿用 ${copied} 個快取檔案。`);

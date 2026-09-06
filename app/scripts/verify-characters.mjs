import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {TextureAtlas,AtlasAttachmentLoader,SkeletonBinary,Skeleton,AnimationState,AnimationStateData} from '@esotericsoftware/spine-core';
import {ensureAsset} from '../asset-cache.mjs';
import {characterAnimations} from '../lib/character-motion.ts';
const characters=JSON.parse(fs.readFileSync('lib/brown-dust-characters.json','utf8'));
assert.equal(new Set(characters.map(c=>c.name)).size,characters.length);
assert(characters.every(c=>c.gender==='female'&&/[\u3400-\u9fff]/.test(c.name)));
const skins=characters.flatMap(c=>c.skins);let complete=0;const failures=[];const results=[];
async function check(skin){
  try{
    const [atlasPath,skeletonPath]=await Promise.all([ensureAsset(skin.atlas),ensureAsset(skin.skeleton),ensureAsset(skin.thumbnail)]);
    const atlas=new TextureAtlas(fs.readFileSync(atlasPath,'utf8'));
    await Promise.all(atlas.pages.map(async page=>{
      const bytes=fs.readFileSync(await ensureAsset(path.posix.join(path.posix.dirname(skin.atlas),page.name)));
      const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
      assert(width>0&&height>0);page.setTexture({getImage:()=>({width,height}),setFilters(){},setWraps(){},dispose(){}});
    }));
    const data=new SkeletonBinary(new AtlasAttachmentLoader(atlas)).readSkeletonData(fs.readFileSync(skeletonPath));
    const names=data.animations.map(a=>a.name),{idle,motion}=characterAnimations(names);
    assert(idle,`沒有待機動畫：${skin.id}`);
    const skeleton=new Skeleton(data),state=new AnimationState(new AnimationStateData(data));
    state.setAnimation(0,idle,true);state.update(.1);state.apply(skeleton);skeleton.updateWorldTransform();
    assert(skeleton.bones.every(b=>Number.isFinite(b.worldX)&&Number.isFinite(b.worldY)));
    if(motion){
      state.setAnimation(0,motion,false);state.addAnimation(0,idle,true,0);
      state.update((data.findAnimation(motion)?.duration??0)+.1);state.apply(skeleton);state.update(.1);state.apply(skeleton);
      assert.equal(state.getCurrent(0).animation.name,idle,'互動結束未回到待機');
    }
    results.push({id:skin.id,idle,motion,animations:names});
  }catch(error){failures.push({id:skin.id,error:error.message});}
  complete++;if(complete%20===0)console.log(`已檢查 ${complete}/${skins.length}`);
}
const todo=[...skins];await Promise.all(Array.from({length:6},async()=>{while(todo.length)await check(todo.shift());}));
fs.writeFileSync('data/animation-verification.json',JSON.stringify({results,failures},null,2));
console.log(JSON.stringify({characters:characters.length,skins:skins.length,verified:results.length,noMotion:results.filter(r=>!r.motion).map(r=>r.id),failures},null,2));
assert.equal(failures.length,0);

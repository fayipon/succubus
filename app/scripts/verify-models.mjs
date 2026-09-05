import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {Box3,Vector3} from 'three';
for(const name of ['character','room']){
 const file=await readFile('public/examples/succubus-01/'+name+'.glb');
 assert.equal(file.readUInt32LE(0),0x46546c67);assert.equal(file.readUInt32LE(4),2);assert.equal(file.readUInt32LE(8),file.length);
 const data=file.buffer.slice(file.byteOffset,file.byteOffset+file.byteLength);
 const gltf=await new GLTFLoader().parseAsync(data,'');
 let count=0,triangles=0;
 gltf.scene.traverse(node=>{if(!node.isMesh)return;count++;const g=node.geometry;assert(g.attributes.normal);for(const value of g.attributes.position.array)assert(Number.isFinite(value));triangles+=(g.index?.count??g.attributes.position.count)/3;});
 const size=new Box3().setFromObject(gltf.scene).getSize(new Vector3());
 assert(size.x>.1&&size.y>.1&&size.z>.1,'Model must occupy three dimensions');
 if(name==='character'){
  assert(size.y>1.6&&size.y<2,'Human-scale height');
  for(const part of ['Face','Torso','Brief','HairCap','EyeWhite1','EyeWhite-1'])assert(gltf.scene.getObjectByName(part),'Missing '+part);
  const leg=gltf.scene.getObjectByName('Leg1');assert(leg.geometry.attributes.normal.getX(0)>0,'Leg surface normals must face outward');
 }
 console.log(name+': GLTFLoader OK; '+count+' meshes; '+triangles+' triangles; bounds '+size.toArray().map(n=>n.toFixed(3)).join(' x ')+'m');
}

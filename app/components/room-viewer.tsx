'use client';
import {assetUrl} from '@/lib/asset-url';
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {Button} from '@/components/ui/button';
import type {Example,ModelAsset} from '@/lib/examples';

function dispose(root:THREE.Object3D){
  root.traverse(node=>{if(node instanceof THREE.Mesh){node.geometry.dispose();const materials=Array.isArray(node.material)?node.material:[node.material];for(const material of materials){for(const value of Object.values(material)){if(value instanceof THREE.Texture)value.dispose();}material.dispose();}}});
}
export default function RoomViewer({example,characterId}:{example:Example;characterId:string}){
  const host=useRef<HTMLDivElement>(null);
  const actions=useRef<{reset:()=>void;rotate:(angle:number)=>void;zoom:(factor:number)=>void}>({reset:()=>{},rotate:()=>{},zoom:()=>{}});
  const [status,setStatus]=useState('正在載入房間與角色…');
  const [failed,setFailed]=useState(false);
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>{
    const element=host.current;if(!element)return;
    let renderer:THREE.WebGLRenderer;
    try{renderer=new THREE.WebGLRenderer({antialias:true});}catch{setFailed(true);setStatus('無法啟動 3D 顯示，請使用支援 WebGL 的瀏覽器。');return;}
    setFailed(false);setStatus('正在載入房間與角色…');
    let disposed=false;
    const scene=new THREE.Scene();scene.background=new THREE.Color('#171219');
    const camera=new THREE.PerspectiveCamera(45,1,.01,1000);camera.position.set(3,2,5);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));element.appendChild(renderer.domElement);
    const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;
    scene.add(new THREE.HemisphereLight(0xffffff,0x493344,2));
    const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(4,7,4);scene.add(key);
    const observer=new ResizeObserver(()=>{const width=element.clientWidth,height=element.clientHeight;if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();});observer.observe(element);
    const loader=new GLTFLoader();
    async function load(asset:ModelAsset){const gltf=await loader.loadAsync(assetUrl(asset.model));const root=gltf.scene;if(disposed){dispose(root);return null;}root.position.fromArray(asset.position??[0,0,0]);root.rotation.fromArray([...(asset.rotation??[0,0,0]),'XYZ']);root.scale.setScalar(asset.scale??1);scene.add(root);return root;}
    Promise.all([load(example.room),...example.characters.map(load)]).then(models=>{
      if(disposed)return;
      const selected=models[1+example.characters.findIndex(c=>c.id===characterId)];
      if(!selected)throw new Error('Missing character');
      const box=new THREE.Box3().setFromObject(selected),target=box.getCenter(new THREE.Vector3());
      const radius=Math.max(box.getSize(new THREE.Vector3()).length()/2,.5);
      const distance=radius/Math.sin(THREE.MathUtils.degToRad(22.5))*1.25;
      controls.target.copy(target);camera.position.copy(target).add(new THREE.Vector3(0,radius*.25,distance));
      controls.minDistance=radius*.3;controls.maxDistance=distance*5;controls.update();controls.saveState();setStatus('');
    }).catch(()=>{if(!disposed){setFailed(true);setStatus('房間或角色載入失敗，請確認模型檔案後重試。');}});
    actions.current={reset:()=>controls.reset(),rotate:angle=>{const offset=camera.position.clone().sub(controls.target);offset.applyAxisAngle(new THREE.Vector3(0,1,0),angle);camera.position.copy(controls.target).add(offset);controls.update();},zoom:factor=>{const offset=camera.position.clone().sub(controls.target);offset.setLength(THREE.MathUtils.clamp(offset.length()*factor,controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(offset);controls.update();}};
    renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);});
    return()=>{disposed=true;renderer.setAnimationLoop(null);observer.disconnect();controls.dispose();dispose(scene);renderer.dispose();renderer.domElement.remove();actions.current={reset:()=>{},rotate:()=>{},zoom:()=>{}};};
  },[example,characterId,attempt]);
  return <><div role="status" className={failed?'error':''}>{status}</div><div className="viewer" ref={host} aria-label="3D 人物展示間"/><div className="room-controls">{failed?<Button className="control" onClick={()=>setAttempt(x=>x+1)}>重新載入</Button>:<><Button className="control" disabled={!!status} onClick={()=>actions.current.rotate(-Math.PI/8)}>向左旋轉</Button><Button className="control" disabled={!!status} onClick={()=>actions.current.rotate(Math.PI/8)}>向右旋轉</Button><Button className="control" disabled={!!status} onClick={()=>actions.current.zoom(.8)}>放大</Button><Button className="control" disabled={!!status} onClick={()=>actions.current.zoom(1.25)}>縮小</Button><Button className="control" disabled={!!status} onClick={()=>actions.current.reset()}>重設視角</Button></>}</div><p className="room-help">拖曳旋轉 · 滾輪縮放 · 右鍵拖曳平移<br/>觸控：單指旋轉，雙指縮放與平移。也可使用上方按鈕調整視角。</p></>;
}



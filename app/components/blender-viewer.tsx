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
export default function BlenderViewer({example,characterId,view='full',autoRotate=false}:{example:Example;characterId:string;view?:'full'|'upper'|'face';autoRotate?:boolean}){
  const moving=useRef(autoRotate);moving.current=autoRotate;
  const currentView=useRef(view);currentView.current=view;
  const orbit=useRef<OrbitControls|null>(null);
  const frameView=useRef<((view:'full'|'upper'|'face')=>void)|null>(null);
  useEffect(()=>{frameView.current?.(view);},[view]);
  
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
    const scene=new THREE.Scene();scene.background=new THREE.Color('#211b26');
    const camera=new THREE.PerspectiveCamera(45,1,.01,1000);camera.position.set(3,2,5);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;element.appendChild(renderer.domElement);
    const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.autoRotate=false;controls.enablePan=false;controls.minPolarAngle=.3;controls.maxPolarAngle=Math.PI*.65;controls.autoRotateSpeed=.65;controls.maxPolarAngle=Math.PI*.49;orbit.current=controls;
    scene.add(new THREE.HemisphereLight(0xffffff,0x493344,.9));
    const key=new THREE.DirectionalLight(0xffffff,1.5);key.position.set(2,4,3);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-3;key.shadow.camera.right=3;key.shadow.camera.top=3;key.shadow.camera.bottom=-3;key.shadow.bias=-.0003;scene.add(key);const rim=new THREE.DirectionalLight(0xc3b4ff,.6);rim.position.set(-2,3,-2);scene.add(rim);
    const observer=new ResizeObserver(()=>{const width=element.clientWidth,height=element.clientHeight;if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();});observer.observe(element);
    const loader=new GLTFLoader();const mixers:THREE.AnimationMixer[]=[];const clock=new THREE.Clock();const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
    async function load(asset:ModelAsset){const gltf=await loader.loadAsync(assetUrl(asset.model));const root=gltf.scene;if(disposed){dispose(root);return null;}root.position.fromArray(asset.position??[0,0,0]);root.rotation.fromArray([...(asset.rotation??[0,0,0]),'XYZ']);root.scale.setScalar(asset.scale??1);root.traverse(node=>{if(node instanceof THREE.Mesh){node.castShadow=true;node.receiveShadow=true;if(node.name==="Portrait"){const old=node.material as THREE.MeshStandardMaterial;node.material=new THREE.MeshStandardMaterial({map:old.map,emissiveMap:old.map,emissive:0xffffff,emissiveIntensity:.22,roughness:1,metalness:0,transparent:true,alphaTest:.45,side:THREE.FrontSide});old.dispose();node.castShadow=true;node.receiveShadow=false;node.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:(node.material as THREE.MeshStandardMaterial).map,alphaTest:.45});}}});scene.add(root);if(gltf.animations.length){const mixer=new THREE.AnimationMixer(root);gltf.animations.forEach(clip=>mixer.clipAction(clip).play());mixers.push(mixer);}return root;}
    Promise.all([load(example.room),...example.characters.map(load)]).then(models=>{
      if(disposed)return;
      const selected=models[1+example.characters.findIndex(c=>c.id===characterId)];
      if(!selected)throw new Error('Missing character');
      const box=new THREE.Box3().setFromObject(selected),target=box.getCenter(new THREE.Vector3());
      const radius=Math.max(box.getSize(new THREE.Vector3()).length()/2,.5);
      const distance=radius/Math.sin(THREE.MathUtils.degToRad(22.5))*1.25;
      controls.target.copy(target);camera.position.copy(target).add(new THREE.Vector3(0,radius*.25,distance));
      controls.minDistance=.28;controls.maxDistance=5;controls.update();
      frameView.current=(next)=>{const height=box.max.y-box.min.y;const factor=next==='full'?.5:next==='upper'?.76:.91;const distance=next==='full'?height*1.48:next==='upper'?height*.77:height*.36;const a=controls.getAzimuthalAngle();controls.target.set(target.x,box.min.y+height*factor,target.z);camera.position.copy(controls.target).add(new THREE.Vector3(Math.sin(a)*distance,.02,Math.cos(a)*distance));controls.update();};
      frameView.current(currentView.current);controls.saveState();setStatus('');
    }).catch(()=>{if(!disposed){setFailed(true);setStatus('房間或角色載入失敗，請確認模型檔案後重試。');}});
    actions.current={reset:()=>{controls.reset();frameView.current?.(currentView.current);},rotate:angle=>{const offset=camera.position.clone().sub(controls.target);offset.applyAxisAngle(new THREE.Vector3(0,1,0),angle);camera.position.copy(controls.target).add(offset);controls.update();},zoom:factor=>{const offset=camera.position.clone().sub(controls.target);offset.setLength(THREE.MathUtils.clamp(offset.length()*factor,controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(offset);controls.update();}};
    renderer.setAnimationLoop(()=>{const dt=Math.min(clock.getDelta(),.05);if(document.hidden)return;if(moving.current&&!reduced.matches)mixers.forEach(m=>m.update(dt));controls.update();renderer.render(scene,camera);});
    return()=>{disposed=true;renderer.setAnimationLoop(null);observer.disconnect();mixers.forEach(m=>{m.stopAllAction();m.uncacheRoot(m.getRoot());});frameView.current=null;orbit.current=null;controls.dispose();dispose(scene);renderer.dispose();renderer.domElement.remove();actions.current={reset:()=>{},rotate:()=>{},zoom:()=>{}};};
  },[example,characterId,attempt]);
  return <><div role="status" className={failed?'error':''}>{status}</div><div className="viewer" ref={host} aria-label="3D 人物展示間"/><div className="room-controls">{failed?<Button className="control" onClick={()=>setAttempt(x=>x+1)}>重新載入</Button>:<><Button className="control" disabled={!!status} onClick={()=>actions.current.rotate(-.05)}>向左查看</Button><Button className="control" disabled={!!status} onClick={()=>actions.current.rotate(.05)}>向右查看</Button><Button className="control" disabled={!!status} onClick={()=>actions.current.zoom(.8)}>放大</Button><Button className="control" disabled={!!status} onClick={()=>actions.current.zoom(1.25)}>縮小</Button><Button className="control" disabled={!!status} onClick={()=>actions.current.reset()}>重設視角</Button></>}</div><p className="room-help">360° 拖曳旋轉 · 滾輪／雙指縮放 · 動態按鈕控制待機動作</p></>;
}




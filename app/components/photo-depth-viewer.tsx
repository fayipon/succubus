'use client';
import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {Button} from '@/components/ui/button';

type View='full'|'upper'|'face';
export default function PhotoDepthViewer({view,motion}:{view:View;motion:boolean}){
 const host=useRef<HTMLDivElement>(null);
 const latest=useRef({view,motion});latest.current={view,motion};
 const actions=useRef({frame:(_v:View)=>{},turn:(_a:number)=>{},zoom:(_n:number)=>{}});
 const [ready,setReady]=useState(false),[error,setError]=useState(false),[attempt,setAttempt]=useState(0);
 useEffect(()=>{actions.current.frame(view);},[view]);
 useEffect(()=>{
  const element=host.current;if(!element)return;let renderer:T.WebGLRenderer;
  try{renderer=new T.WebGLRenderer({antialias:true,alpha:true});}catch{setError(true);return;}
  setReady(false);setError(false);let disposed=false,texture:T.Texture|null=null;
  const scene=new T.Scene();const camera=new T.OrthographicCamera(-1,1,1,-1,.01,10);
  camera.position.set(0,.86,3);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));element.appendChild(renderer.domElement);
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.86,0);controls.enableDamping=true;controls.enablePan=false;controls.minAzimuthAngle=-.14;controls.maxAzimuthAngle=.14;controls.minPolarAngle=Math.PI/2-.08;controls.maxPolarAngle=Math.PI/2+.08;controls.minZoom=1;controls.maxZoom=3.5;
  const geometry=new T.PlaneGeometry(.993,1.72,100,160);
  const position=geometry.attributes.position,uv=geometry.attributes.uv;
  const gaussian=(x:number,y:number,cx:number,cy:number,rx:number,ry:number)=>Math.exp(-2*((x-cx)**2/rx**2+(y-cy)**2/ry**2));
  // Approximate depth is only an animation aid; it is not a recovered body scan.
  for(let i=0;i<position.count;i++){const x=uv.getX(i),y=1-uv.getY(i);const edge=Math.min(1,x*12,(1-x)*12,y*12,(1-y)*12);const depth=.045*gaussian(x,y,.5,.39,.25,.31)+.06*gaussian(x,y,.52,.12,.13,.12)+.025*gaussian(x,y,.53,.78,.16,.3);position.setZ(i,depth*edge);}
  geometry.computeVertexNormals();
  const material=new T.MeshBasicMaterial({transparent:false});
  const time={value:0};
  material.onBeforeCompile=shader=>{shader.uniforms.motionTime=time;shader.fragmentShader='uniform float motionTime;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
   vec2 q=vMapUv;vec2 p=vec2(q.x,1.0-q.y);
   float rightHair=exp(-3.0*dot((p-vec2(.655,.23))/vec2(.085,.20),(p-vec2(.655,.23))/vec2(.085,.20)));
   float leftHair=exp(-3.0*dot((p-vec2(.35,.22))/vec2(.065,.16),(p-vec2(.35,.22))/vec2(.065,.16)));
   q.x+=sin(motionTime*.8+p.y*20.0)*.0008*(rightHair+leftHair);
   diffuseColor*=texture2D(map,q);
   #endif`);};
  const photo=new T.Mesh(geometry,material);photo.position.y=.86;scene.add(photo);
  let interactUntil=0;
  const interact=()=>{interactUntil=performance.now()+8000;};
  controls.addEventListener('start',interact);
  const frame=(v:View)=>{const aspect=Math.max(element.clientWidth,1)/Math.max(element.clientHeight,1);const half=v==='full'?Math.max(.9,.52/aspect):v==='upper'?.51:.255;const y=v==='full'?.86:v==='upper'?1.19:1.47;camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;camera.zoom=1;camera.position.set(0,y,3);controls.target.set(0,y,0);camera.updateProjectionMatrix();controls.update();interact();};
  actions.current={frame,turn:a=>{interact();const angle=T.MathUtils.clamp(controls.getAzimuthalAngle()+a,-.14,.14);camera.position.copy(controls.target).add(new T.Vector3(Math.sin(angle)*3,0,Math.cos(angle)*3));controls.update();},zoom:n=>{interact();camera.zoom=T.MathUtils.clamp(camera.zoom*n,1,3.5);camera.updateProjectionMatrix();}};
  const observer=new ResizeObserver(()=>{renderer.setSize(element.clientWidth,element.clientHeight);frame(latest.current.view);});observer.observe(element);
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  new T.TextureLoader().load('./images/succubus-01.png',loaded=>{if(disposed){loaded.dispose();return;}texture=loaded;loaded.colorSpace=T.SRGBColorSpace;material.map=loaded;material.needsUpdate=true;setReady(true);},undefined,()=>{if(!disposed)setError(true);});
  renderer.setAnimationLoop(now=>{if(document.hidden)return;const moving=latest.current.motion&&!reduced.matches;time.value=moving?now/1000:0;if(moving&&now>interactUntil){const angle=Math.sin(now*.00027)*.037;camera.position.copy(controls.target).add(new T.Vector3(Math.sin(angle)*3,Math.sin(now*.00019)*.014,Math.cos(angle)*3));}controls.update();renderer.render(scene,camera);});
  return()=>{disposed=true;renderer.setAnimationLoop(null);observer.disconnect();controls.removeEventListener('start',interact);controls.dispose();texture?.dispose();material.dispose();geometry.dispose();renderer.dispose();renderer.domElement.remove();actions.current={frame:()=>{},turn:()=>{},zoom:()=>{}};};
 },[attempt]);
 return <><div className="photo-depth-stage viewer"><img className="depth-fallback" src="./images/succubus-01.png" alt="Succubus 01 原始人物影像" style={{visibility:ready&&!error?'hidden':'visible'}}/><div ref={host} className="depth-canvas" aria-label="2.5D 人物，小角度拖曳與縮放" style={{visibility:error?'hidden':'visible'}}/>{error&&<p className="depth-status" role="status">動態暫時無法載入，已顯示原圖。<Button onClick={()=>setAttempt(a=>a+1)}>重試</Button></p>}</div><div className="room-controls"><Button className="control" disabled={!ready||error} onClick={()=>actions.current.turn(-.05)}>向左查看</Button><Button className="control" disabled={!ready||error} onClick={()=>actions.current.turn(.05)}>向右查看</Button><Button className="control" disabled={!ready||error} onClick={()=>actions.current.zoom(1.2)}>放大</Button><Button className="control" disabled={!ready||error} onClick={()=>actions.current.zoom(1/1.2)}>縮小</Button><Button className="control" disabled={!ready||error} onClick={()=>actions.current.frame(view)}>重設視角</Button></div><p className="room-help">拖曳：小角度視差 · 滾輪／雙指：縮放 · 保留原始照片外觀</p></>;
}

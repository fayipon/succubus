'use client';
import {useEffect,useRef,useState} from 'react';
import type {SpinePlayer} from '@esotericsoftware/spine-player';
import {characterAnimations} from '@/lib/character-motion';
export type CharacterSkin={id:string;name:string;skeleton:string;atlas:string;thumbnail:string};
export const characterAsset=(path:string)=>'./character-assets/'+path.split('/').map(encodeURIComponent).join('/');

export default function CharacterAnimation({skin,name,motionRequest}:{skin:CharacterSkin;name:string;motionRequest:number}){
  const mount=useRef<HTMLDivElement>(null),player=useRef<SpinePlayer|null>(null);
  const trigger=useRef(()=>{});
  const [status,setStatus]=useState<'loading'|'idle'|'motion'|'error'>('loading');
  const [hasMotion,setHasMotion]=useState(false),[retry,setRetry]=useState(0);
  useEffect(()=>{
    let gone=false,local:SpinePlayer|undefined,busy=false;
    const element=mount.current;setStatus('loading');setHasMotion(false);trigger.current=()=>{};
    void import('@esotericsoftware/spine-player').then(({SpinePlayer})=>{
      if(gone||!element)return;
      local=new SpinePlayer(element,{
        binaryUrl:characterAsset(skin.skeleton),atlasUrl:characterAsset(skin.atlas),
        showControls:false,showLoading:false,premultipliedAlpha:false,alpha:true,
        preserveDrawingBuffer:false,backgroundColor:'#00000000',defaultMix:.18,
        viewport:{padLeft:'9%',padRight:'9%',padTop:'8%',padBottom:'8%',transitionTime:0},
        success:p=>{
          if(gone){p.dispose();return;}
          const {idle,motion}=characterAnimations(p.skeleton?.data.animations.map(a=>a.name)??[]);
          if(!idle){setStatus('error');return;}
          player.current=p;p.setAnimation(idle,true);
          // Selecting an animation does not clear SpinePlayer's initial paused state.
          if(document.hidden)p.pause();else p.play();
          setStatus('idle');setHasMotion(Boolean(motion));
          trigger.current=()=>{
            if(gone||busy||!motion||!p.animationState)return;
            busy=true;setStatus('motion');
            // Keep the idle camera framing; queue the return on the animation timeline.
            const entry=p.animationState.setAnimation(0,motion,false);
            p.animationState.addAnimation(0,idle,true,0);
            entry.listener={complete:()=>{if(!gone){busy=false;setStatus('idle');}}};p.play();
          };
        },
        error:()=>{if(!gone)setStatus('error');},
      });
    }).catch(()=>{if(!gone)setStatus('error');});
    const visibility=()=>{if(document.hidden)player.current?.pause();else player.current?.play();};
    document.addEventListener('visibilitychange',visibility);
    return()=>{gone=true;trigger.current=()=>{};player.current=null;local?.dispose();element?.replaceChildren();document.removeEventListener('visibilitychange',visibility);};
  },[skin.id,retry]);
  useEffect(()=>{if(motionRequest)trigger.current();},[motionRequest]);
  return <div className="character-animation" aria-busy={status==='loading'}>
    <div className="character-animation-canvas" ref={mount}/>
    {(status==='idle'||status==='motion')&&<button className="character-touch" aria-label={`與${name}互動`} disabled={!hasMotion||status==='motion'} onClick={()=>trigger.current()}/>}
    {status==='loading'&&<div className="character-load" role="status"><span className="character-loader"/>正在迎接{name}…</div>}
    {status==='error'&&<div className="character-load" role="alert"><p>人物暫時無法載入。</p><button onClick={()=>setRetry(n=>n+1)}>重新載入</button></div>}
  </div>;
}

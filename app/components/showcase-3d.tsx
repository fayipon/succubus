'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,Box,Pause,Play,Scan} from 'lucide-react';
import {Button} from '@/components/ui/button';
import BlenderViewer from '@/components/blender-viewer';
import type {Example} from '@/lib/examples';
const blenderExample:Example={id:'blender-01',name:'柔光展示間',room:{model:'/examples/full-01/room.glb'},characters:[{id:'succubus-01',name:'Succubus 01',model:'/examples/full-01/character.glb'}]};

import {succubus01} from '@/lib/succubus-01';

export default function Showcase3D({onBack}:{onBack:()=>void}){
  const [view,setView]=useState<'full'|'upper'|'face'>('full');
  const [rotate,setRotate]=useState(false);
  const [focus,setFocus]=useState(false);
  const title=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{title.current?.focus();setRotate(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);},[]);
  return <main className={'showcase real-3d '+(focus?'showcase-focused':'')}>
    <header className="showcase-header"><Button className="showcase-back" onClick={onBack}><ArrowLeft size={17}/>角色列表</Button><span className="showcase-wordmark">SUCCUBUS <span>/</span> 3D VIEWING ROOM<small>CHARACTER COLLECTION</small></span><span className="showcase-mode"><span/> 動態 3D</span></header>
    <div className="showcase-layout"><aside className="showcase-nav"><p className="eyebrow">CAMERA VIEWS</p><h2>靠近，細看。</h2><div className="view-options">{([{id:'full',name:'全身',en:'FULL BODY'},{id:'upper',name:'半身',en:'UPPER BODY'},{id:'face',name:'臉部',en:'PORTRAIT'}] as const).map((v,i)=><button className={'view-option '+(view===v.id?'active':'')} key={v.id} aria-pressed={view===v.id} onClick={()=>setView(v.id)}><span className={'camera-thumb '+v.id} aria-hidden="true"><img src="./images/succubus-01-office.png" alt=""/></span><span className="camera-view-icon"><Box size={24}/></span><span><small>0{i+1}</small><strong>{v.name}</strong><em>{v.en}</em></span></button>)}</div><div className="view-note"><p>輕輕拖曳畫面，<br/>查看人物的側面與背面。</p><span>FULL MODEL / 360°</span></div><Button className="turntable-toggle" aria-pressed={rotate} onClick={()=>setRotate(!rotate)}>{rotate?<Pause size={16}/>:<Play size={16}/>} <span>{rotate?'暫停動態':'開啟動態'}<small>SUBTLE MOTION</small></span><span className={'rotate-switch '+(rotate?'is-on':'')} aria-hidden="true"/></Button></aside>
    <section className="showcase-center" aria-label="3D 人物展示"><div className="stage-topline"><span>01 / SUCCUBUS_01</span><button className="focus-toggle" aria-pressed={focus} onClick={()=>setFocus(!focus)}><Scan size={16}/>{focus?'退出專注':'專注檢視'}</button></div><BlenderViewer example={blenderExample} characterId="succubus-01" view={view} autoRotate={rotate}/></section>
    <aside className="showcase-info"><p className="eyebrow">CHARACTER / {succubus01.number}</p><h1 ref={title} tabIndex={-1}>Succubus <em>01</em></h1><div className="portrait-label"><span/> 柔光展示間</div><div className="character-intro character-biography" lang="ja">{succubus01.description.map(line=><p key={line}>{line}</p>)}</div><div className="info-rule"/><dl className="showcase-facts"><div><dt>番号</dt><dd>{succubus01.number}</dd></div><div><dt>身高</dt><dd>{succubus01.heightCm} cm</dd></div><div><dt>體重</dt><dd>{succubus01.weightKg} kg</dd></div><div><dt>罩杯</dt><dd>{succubus01.cup}</dd></div><div><dt>年齡</dt><dd>{succubus01.age} 歲</dd></div><div><dt>展示模式</dt><dd>動態 3D</dd></div><div><dt>人物來源</dt><dd>3D 近似建模</dd></div><div><dt>目前鏡頭</dt><dd>{view==='full'?'全身':view==='upper'?'半身':'臉部'}</dd></div></dl><div className="showcase-tip"><Box size={22}/><h2>完整立體人物</h2><p>完整人物網格與立體服裝，可旋轉查看側面與背面。此版為近似草模，臉型與材質仍待細化。</p></div><details className="model-reference"><summary>查看原始參考</summary><img src="./images/succubus-01-office.png" alt="人物原始參考照片"/></details><button className="return-collection" onClick={onBack}>返回人物列表 <ArrowLeft size={17}/></button></aside></div>
    <footer className="showcase-footer"><span>SUCCUBUS / PHOTO COLLECTION</span><span>REAL-TIME RENDER / 01</span></footer>
  </main>;
}



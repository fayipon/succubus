'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,Box,Pause,Play,Scan,Download} from 'lucide-react';
import {Button} from '@/components/ui/button';
import RoomViewer from '@/components/room-viewer';
import {examples} from '@/lib/examples';
import {succubus01} from '@/lib/succubus-01';

export default function Showcase3D({onBack}:{onBack:()=>void}){
  const [view,setView]=useState<'full'|'upper'|'face'>('full');
  const [rotate,setRotate]=useState(false);
  const [focus,setFocus]=useState(false);
  const title=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{title.current?.focus();setRotate(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);},[]);
  return <main className={'showcase real-3d '+(focus?'showcase-focused':'')}>
    <header className="showcase-header"><Button className="showcase-back" onClick={onBack}><ArrowLeft size={17}/>角色列表</Button><span className="showcase-wordmark">SUCCUBUS <span>/</span> 3D VIEWING ROOM</span><span className="showcase-mode"><span/> 即時 3D</span></header>
    <div className="showcase-layout"><aside className="showcase-nav"><p className="eyebrow">CAMERA VIEWS</p><h2>環繞，細看。</h2><div className="view-options">{([{id:'full',name:'全身',en:'FULL BODY'},{id:'upper',name:'半身',en:'UPPER BODY'},{id:'face',name:'臉部',en:'PORTRAIT'}] as const).map((v,i)=><button className={'view-option '+(view===v.id?'active':'')} key={v.id} aria-pressed={view===v.id} onClick={()=>setView(v.id)}><span className="camera-view-icon"><Box size={24}/></span><span><small>0{i+1}</small><strong>{v.name}</strong><em>{v.en}</em></span></button>)}</div><div className="view-note"><p>拖曳人物周圍的空間，<br/>查看側面與背面。</p><span>360° / ORBIT CONTROLS</span></div><Button className="turntable-toggle" aria-pressed={rotate} onClick={()=>setRotate(!rotate)}>{rotate?<Pause size={16}/>:<Play size={16}/>} {rotate?'暫停自動旋轉':'自動旋轉'}</Button></aside>
    <section className="showcase-center" aria-label="3D 人物展示"><div className="stage-topline"><span>01 / SUCCUBUS_01</span><button className="focus-toggle" aria-pressed={focus} onClick={()=>setFocus(!focus)}><Scan size={16}/>{focus?'退出專注':'專注檢視'}</button></div><RoomViewer example={examples[0]} characterId="succubus-01" view={view} autoRotate={rotate}/></section>
    <aside className="showcase-info"><p className="eyebrow">CHARACTER / {succubus01.number}</p><h1 ref={title} tabIndex={-1}>Succubus <em>01</em></h1><div className="portrait-label"><span/> 柔光展示間</div><div className="character-intro character-biography" lang="ja">{succubus01.description.map(line=><p key={line}>{line}</p>)}</div><div className="info-rule"/><dl className="showcase-facts"><div><dt>番号</dt><dd>{succubus01.number}</dd></div><div><dt>身高</dt><dd>{succubus01.heightCm} cm</dd></div><div><dt>體重</dt><dd>{succubus01.weightKg} kg</dd></div><div><dt>罩杯</dt><dd>{succubus01.cup}</dd></div><div><dt>年齡</dt><dd>{succubus01.age} 歲</dd></div><div><dt>展示模式</dt><dd>即時 3D</dd></div><div><dt>模型風格</dt><dd>風格化初版</dd></div><div><dt>目前鏡頭</dt><dd>{view==='full'?'全身':view==='upper'?'半身':'臉部'}</dd></div></dl><div className="showcase-tip"><Box size={22}/><h2>完整立體模型</h2><p>可從任意方向查看。背面與照片未呈現的部分為補充設計，並非照片的精確重建。</p></div><details className="model-reference"><summary>查看原始參考</summary><img src="./images/succubus-01.png" alt="人物原始參考照片"/></details><a className="return-collection" href="./examples/succubus-01/character.glb" download="succubus-01.glb">下載人物 GLB <Download size={17}/></a></aside></div>
    <footer className="showcase-footer"><span>SUCCUBUS / 3D COLLECTION</span><span>REAL-TIME RENDER / 01</span></footer>
  </main>;
}

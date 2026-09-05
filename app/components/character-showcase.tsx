'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowUpRight,Focus,Image as ImageIcon,Minus,Plus,RotateCcw,Scan,ChevronRight} from 'lucide-react';
import {Button} from '@/components/ui/button';

type View='full'|'upper'|'face';
const views:{id:View;name:string;caption:string;zoom:number;focus:number}[]=[
  {id:'full',name:'全身',caption:'FULL LENGTH',zoom:1,focus:.5},
  {id:'upper',name:'半身',caption:'UPPER BODY',zoom:1.9,focus:.30},
  {id:'face',name:'特寫',caption:'PORTRAIT',zoom:3.1,focus:.17},
];
const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,n));
export default function CharacterShowcase({onBack}:{onBack:()=>void}){
  const [view,setView]=useState<View>('full');
  const [zoom,setZoom]=useState(1);
  const [pan,setPan]=useState({x:0,y:0});
  const [size,setSize]=useState({width:1,height:1});
  const [natural,setNatural]=useState({width:953,height:1651});
  const [focused,setFocused]=useState(false);
  const [loaded,setLoaded]=useState(false);
  const [failed,setFailed]=useState(false);
  const [attempt,setAttempt]=useState(0);
  const stage=useRef<HTMLDivElement>(null);
  const title=useRef<HTMLHeadingElement>(null);
  const drag=useRef<{id:number;x:number;y:number;startX:number;startY:number}|null>(null);
  const fit=Math.min(size.width/natural.width,size.height/natural.height);
  const fitted={width:natural.width*fit,height:natural.height*fit};
  const constrain=(x:number,y:number,z=zoom)=>({x:clamp(x,-Math.max(0,(fitted.width*z-size.width)/2),Math.max(0,(fitted.width*z-size.width)/2)),y:clamp(y,-Math.max(0,(fitted.height*z-size.height)/2),Math.max(0,(fitted.height*z-size.height)/2))});
  const selectView=(id:View)=>{const preset=views.find(v=>v.id===id)!;setView(id);setZoom(preset.zoom);setPan(constrain(0,(.5-preset.focus)*fitted.height*preset.zoom,preset.zoom));};
  const changeZoom=(value:number)=>{const next=clamp(value,1,4);setZoom(next);setPan(constrain(pan.x*next/zoom,pan.y*next/zoom,next));};
  useEffect(()=>{title.current?.focus();const element=stage.current;if(!element)return;const observer=new ResizeObserver(()=>setSize({width:element.clientWidth,height:element.clientHeight}));observer.observe(element);return()=>observer.disconnect();},[]);
  useEffect(()=>{const preset=views.find(v=>v.id===view)!;setPan(constrain(0,(.5-preset.focus)*fitted.height*zoom));},[size.width,size.height,natural.width,natural.height]);
  useEffect(()=>{const element=stage.current;if(!element)return;const wheel=(event:WheelEvent)=>{if(!loaded)return;event.preventDefault();changeZoom(zoom*Math.exp(-event.deltaY*.0015));};element.addEventListener('wheel',wheel,{passive:false});return()=>element.removeEventListener('wheel',wheel);},[zoom,pan,size,loaded]);
  return <main className={'showcase '+(focused?'showcase-focused':'')}>
    <header className="showcase-header"><Button className="showcase-back" onClick={onBack}><ArrowLeft size={17}/>角色列表</Button><span className="showcase-wordmark">SUCCUBUS <span>/</span> VIEWING ROOM</span><span className="showcase-mode"><span/> 人物展示</span></header>
    <div className="showcase-layout"><aside className="showcase-nav"><p className="eyebrow">THE PERSPECTIVES</p><h2>換個視角。</h2><div className="view-options">{views.map((preset,index)=><button key={preset.id} className={'view-option '+(view===preset.id?'active':'')} aria-pressed={view===preset.id} disabled={!loaded} onClick={()=>selectView(preset.id)}><span className={'view-thumbnail '+preset.id}><img src="./images/succubus-01.png" alt=""/></span><span><small>0{index+1}</small><strong>{preset.name}</strong><em>{preset.caption}</em></span><ChevronRight size={15}/></button>)}</div><div className="view-note"><ImageIcon size={18}/><p>切換取景。<br/>查看人物細節。</p><span>IMAGE STUDY / 01</span></div></aside>
    <section className="showcase-center" aria-label="人物圖片展示"><div className="stage-topline"><span>01 <span>/</span> SUCCUBUS_01</span><button className="focus-toggle" aria-pressed={focused} onClick={()=>setFocused(!focused)}><Scan size={16}/>{focused?'退出專注':'專注檢視'}</button></div>
      <div className="portrait-stage" ref={stage} tabIndex={0} role="region" aria-label="可縮放的人物圖片，方向鍵平移，加減鍵縮放，0 重設" onKeyDown={event=>{if(!loaded)return;const key=event.key;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','0','Escape'].includes(key))event.preventDefault();if(key==='+'||key==='=')changeZoom(zoom+.2);if(key==='-')changeZoom(zoom-.2);if(key==='0')selectView('full');if(key==='Escape')setFocused(false);if(key.startsWith('Arrow'))setPan(constrain(pan.x+(key==='ArrowLeft'?40:key==='ArrowRight'?-40:0),pan.y+(key==='ArrowUp'?40:key==='ArrowDown'?-40:0)));}}
      onPointerDown={event=>{if(!loaded||event.button!==0||drag.current)return;drag.current={id:event.pointerId,x:event.clientX,y:event.clientY,startX:pan.x,startY:pan.y};event.currentTarget.setPointerCapture(event.pointerId);}}
      onPointerMove={event=>{const start=drag.current;if(start&&start.id===event.pointerId)setPan(constrain(start.startX+event.clientX-start.x,start.startY+event.clientY-start.y));}}
      onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}} onLostPointerCapture={()=>{drag.current=null;}}>
        <img className="showcase-portrait" src={'./images/succubus-01.png'+(attempt?'?retry='+attempt:'')} alt="Succubus 01 人物參考，黑色長髮，站立於柔光窗簾前" draggable={false} onLoad={event=>{setNatural({width:event.currentTarget.naturalWidth,height:event.currentTarget.naturalHeight});setLoaded(true);setFailed(false);}} onError={()=>{setFailed(true);setLoaded(false);}} style={{opacity:loaded?1:0,transform:'translate('+pan.x+'px,'+pan.y+'px) scale('+zoom+')'}}/>
        {!loaded&&<div className="portrait-status" role="status">{failed?<><p>圖片暫時無法載入</p><Button className="control" onClick={()=>{setFailed(false);setAttempt(a=>a+1);}}>重新載入</Button></>:'正在準備展示…'}</div>}
        <span className="stage-corner corner-tl"/><span className="stage-corner corner-br"/>
      </div>
      <div className="zoom-toolbar"><Button aria-label="縮小" disabled={!loaded||zoom<=1} onClick={()=>changeZoom(zoom-.2)}><Minus size={18}/></Button><label className="zoom-slider"><span className="sr-only">圖片縮放</span><input type="range" min="1" max="4" step=".01" value={zoom} disabled={!loaded} onChange={event=>changeZoom(Number(event.target.value))}/></label><Button aria-label="放大" disabled={!loaded||zoom>=4} onClick={()=>changeZoom(zoom+.2)}><Plus size={18}/></Button><output>{Math.round(zoom*100)}%</output><span className="toolbar-divider"/><Button className="reset-view" disabled={!loaded} onClick={()=>selectView('full')}><RotateCcw size={15}/>重設</Button></div><p className="stage-instructions">滾輪縮放 · 放大後拖曳移動 · 觸控可使用下方縮放列</p>
    </section>
    <aside className="showcase-info"><p className="eyebrow">CHARACTER / 001</p><h1 ref={title} tabIndex={-1}>Succubus <em>01</em></h1><div className="portrait-label"><span/> 柔光展示間</div><p className="character-intro">黑色長髮、柔和光線。<br/>從全身輪廓，到近處的細節。</p><div className="info-rule"/><dl className="showcase-facts"><div><dt>目前視圖</dt><dd>{views.find(v=>v.id===view)?.name}</dd></div><div><dt>展示模式</dt><dd>人物影像</dd></div><div><dt>可用視圖</dt><dd>全身 / 半身 / 特寫</dd></div></dl><div className="showcase-tip"><Focus size={22}/><h2>細節，值得停留。</h2><p>切換視圖，或自行放大檢視。按下重設，即可回到完整畫面。</p></div><div className="future-3d"><BoxLabel/><span>360° 立體展示<small>3D 模型準備中</small></span></div><button className="return-collection" onClick={onBack}>返回人物圖鑑 <ArrowUpRight size={18}/></button></aside>
    </div><footer className="showcase-footer"><span>SUCCUBUS / PERSONAL COLLECTION</span><span>IMAGE VIEWER <span>—</span> 01</span></footer>
  </main>;
}
function BoxLabel(){return <span className="future-icon" aria-hidden="true">3D</span>;}

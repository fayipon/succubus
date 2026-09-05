'use client';
import {lazy,Suspense,useEffect,useRef,useState} from 'react';
import {ArrowLeft,Box,Pause,Play,Heart} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {profiles} from '@/lib/character-profiles';
const CharacterShowcase=lazy(()=>import('@/components/showcase-3d'));
const NoctiaRoom=lazy(()=>import('@/components/noctia-room'));
const AnimatedMain=lazy(()=>import('@/components/animated-main'));

export default function Home(){
  const [screen,setScreen]=useState<'main'|'char'|'room'|'noctia'>('main');
  const [paused,setPaused]=useState(false);
  const [profileId,setProfileId]=useState<string>('yoru');
  const heading=useRef<HTMLHeadingElement>(null);
  const profile=profiles.find(p=>p.id===profileId)??profiles[0];
  useEffect(()=>{const sync=()=>{setScreen(window.location.hash==='#room/noctia'?'noctia':window.location.hash==='#room/succubus-01'?'room':window.location.hash==='#char'?'char':'main');};sync();window.addEventListener('hashchange',sync);return()=>window.removeEventListener('hashchange',sync);},[]);
  useEffect(()=>{document.title=screen==='noctia'?'NOCTIA — 月夜圖書館':screen==='main'?'Succubus — 深夜魅魔店':screen==='room'?'Succubus 01 — 人物展示':'Succubus — Character Archive';if(screen==='char')heading.current?.focus();},[screen]);
  const navigate=(destination:'main'|'char'|'room'|'noctia')=>{window.location.hash=destination==='noctia'?'room/noctia':destination==='room'?'room/succubus-01':destination;setScreen(destination);};
  if(screen==='noctia')return <Suspense fallback={<p role="status">正在準備月夜圖書館…</p>}><NoctiaRoom onBack={()=>navigate('char')}/></Suspense>;
  if(screen==='room')return <Suspense fallback={<p role="status">正在準備人物展示…</p>}><CharacterShowcase onBack={()=>navigate('char')}/></Suspense>;
  if(screen==='main')return <main className="main-screen"><h1 className="sr-only">日本深夜限定的魅魔店</h1><div className="main-stage"><img className="main-art" src="./images/main.png" alt="月夜櫻花街道中的魅魔店，紫髮店長在門前等候"/><Suspense fallback={null}><AnimatedMain paused={paused}/></Suspense><button className="enter-game" onClick={()=>navigate('char')} aria-label="進入遊戲，開啟角色選單"><span className="sr-only">進入遊戲</span></button></div><button className="motion-toggle" aria-pressed={paused} onClick={()=>setPaused(p=>!p)}>{paused?<Play size={15}/>:<Pause size={15}/>}<span>{paused?'開啟人物動畫':'暫停人物動畫'}</span></button></main>;
  return <main className="shell character-screen"><header><button className="brand home-link" onClick={()=>navigate('main')} aria-label="返回 main 首頁">S / SUCCUBUS</button><span className="edition">CHARACTER ARCHIVE · 01</span><Button className="back-main" onClick={()=>navigate('main')}><ArrowLeft size={15}/> 返回首頁</Button></header>
    <div className="title"><div><p className="eyebrow">THE COLLECTION</p><h1 ref={heading} tabIndex={-1}>Succubus <em>list</em><sup>04</sup></h1></div><p>選取角色，進入她的世界。<br/><span className="muted">人物動畫與 3D 房間展示</span></p></div>
    <div className="section-bar"><span>◆ 角色圖鑑</span><span>2 ROOMS / 4 CHARACTERS</span></div>
    <section className="character-layout" aria-label="角色選單"><div className="character-cards">{profiles.map((p,index)=><button className={'profile-card '+(p.id===profileId?'active':'')} key={p.id} aria-pressed={p.id===profileId} onClick={()=>setProfileId(p.id)}><div className={'profile-art '+(p.id==='yoru'?'real-profile':'')} style={p.id==='noctia'?{backgroundImage:'url(./examples/noctia/portrait.png)',backgroundSize:'auto 105%',backgroundPosition:'center top',backgroundRepeat:'no-repeat'}:{backgroundPosition:p.crop+'% 58%'}}/><div className="profile-number"><span>NO. {String(index+1).padStart(3,'0')}</span><span className="profile-icon">{p.icon}</span></div><div className="profile-caption"><h2>{p.title} · {p.name}</h2><p>「{p.quote}」</p></div></button>)}</div>
    <article className={'profile-detail '+(profile.id==='yoru'?'real-detail':'')} aria-live="polite"><div className="detail-art" style={profile.id==='noctia'?{backgroundImage:'url(./examples/noctia/portrait.png)',backgroundSize:'auto 100%',backgroundPosition:'right top',backgroundRepeat:'no-repeat'}:profile.id==='yoru'?undefined:{backgroundPosition:profile.crop+'% 58%'}} aria-hidden="true"/><div className="detail-copy"><p className="eyebrow">A WORLD NOW OPEN</p><h2>{profile.tagline}</h2><p>{profile.description}<br/>專屬房間：{profile.room}</p><div className="profile-actions"><span className="selected-label"><Heart size={18}/> {profile.title}</span><Button className={(profile.id==='yoru'||profile.id==='noctia')?'enter-showcase':'preview-locked'} disabled={profile.id!=='yoru'&&profile.id!=='noctia'} onClick={()=>navigate(profile.id==='noctia'?'noctia':'room')}><Box size={17}/>{(profile.id==='yoru'||profile.id==='noctia')?'進入展示間':'尚未開放'}</Button></div><p className="asset-note">{profile.id==='noctia'?'已開放角色動畫展示':profile.id==='yoru'?'已開放 3D 人物展示':'人物與房間模型準備中'}</p><dl className="stats">{(['charm','mystery','trust'] as const).map(stat=><div key={stat}><dt>{stat.toUpperCase()}</dt><dd><span className="stat-track"><span style={{width:(profile[stat]??0)+'%'}}/></span><span>{profile[stat]??'—'}</span></dd></div>)}</dl></div><div className="detail-name">{profile.name}<span>{profile.title}</span></div><p className="detail-quote">「{profile.quote}」</p></article></section>
    <div className="steps"><span>01 / SELECT A CHARACTER</span><span>02 / ENTER THE ROOM</span><span>03 / EXPLORE IN 3D</span></div>
    <footer><span>SUCCUBUS</span><span>PERSONAL 3D GALLERY</span><span>v0.4.0</span></footer></main>;
}

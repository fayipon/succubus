'use client';
import {lazy,Suspense,useEffect,useState} from 'react';
import {Pause,Play} from 'lucide-react';
import CharacterList from '@/components/character-list';
const AnimatedMain=lazy(()=>import('@/components/animated-main'));

export default function Home(){
  const [screen,setScreen]=useState<'main'|'char'>('main');
  const [paused,setPaused]=useState(false);
  useEffect(()=>{const sync=()=>{if(window.location.hash.startsWith('#room/'))window.history.replaceState(null,'','#char');setScreen(window.location.hash==='#char'?'char':'main');};sync();window.addEventListener('hashchange',sync);return()=>window.removeEventListener('hashchange',sync);},[]);
  useEffect(()=>{document.title=screen==='main'?'Succubus — 深夜魅魔店':'魅魔店 — 人物圖鑑';},[screen]);
  const navigate=(destination:'main'|'char')=>{window.location.hash=destination;setScreen(destination);};
  if(screen==='main')return <main className="main-screen"><h1 className="sr-only">日本深夜限定的魅魔店</h1><div className="main-stage"><img className="main-art" src="./images/main.png" alt="月夜櫻花街道中的魅魔店，紫髮店長在門前等候"/><Suspense fallback={null}><AnimatedMain paused={paused}/></Suspense><button className="enter-game" onClick={()=>navigate('char')} aria-label="進入遊戲，開啟角色選單"><span className="sr-only">進入遊戲</span></button></div><button className="motion-toggle" aria-pressed={paused} onClick={()=>setPaused(p=>!p)}>{paused?<Play size={15}/>:<Pause size={15}/>}<span>{paused?'開啟人物動畫':'暫停人物動畫'}</span></button></main>;
  return <CharacterList onBack={()=>navigate('main')}/>;
}

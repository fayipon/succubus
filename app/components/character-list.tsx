'use client';
import {useEffect,useRef,useState} from 'react';
import {ChevronLeft,Heart,Sparkles} from 'lucide-react';
import {Button} from '@/components/ui/button';
import CharacterAnimation,{characterAsset} from '@/components/character-animation';
import characters from '@/lib/brown-dust-characters.json';

export default function CharacterList({onBack}:{onBack:()=>void}){
  const [selected,setSelected]=useState(characters.findIndex(c=>c.id==='Nebris'));
  const [skinChoices,setSkinChoices]=useState<Record<string,number>>({});
  const [motionRequest,setMotionRequest]=useState(0);
  const heading=useRef<HTMLHeadingElement>(null);
  const character=characters[selected]??characters[0];
  const skinIndex=skinChoices[character.id]??0;
  const skin=character.skins[skinIndex]??character.skins[0];
  useEffect(()=>{heading.current?.focus();},[]);
  return <main className="lounge">
    <header className="lounge-header">
      <Button className="lounge-back" onClick={onBack} aria-label="返回首頁"><ChevronLeft/><span>返回<small>首頁</small></span></Button>
      <div className="lounge-brand"><h1 ref={heading} tabIndex={-1}>日本深夜限定魅魔店</h1><p><span/>深夜的邂逅<span/></p></div>
      <p className="lounge-invitation">今夜，<br/><span>想與誰相遇？♡</span></p>
      <div className="lounge-count"><Sparkles size={19}/><span>人物圖鑑<strong>{characters.length}</strong></span></div>
    </header>
    <div className="lounge-content">
      <section className="lounge-roster" aria-label="女性人物列表">
        <div className="lounge-grid">{characters.map((item,index)=>{
          const portrait=item.skins[skinChoices[item.id]??0]??item.skins[0];
          return <button key={item.id} className={`lounge-card ${selected===index?'is-selected':''}`} aria-pressed={selected===index} aria-label={item.name} onClick={()=>{if(selected===index)setMotionRequest(n=>n+1);else setSelected(index);}}>
            <img className="lounge-portrait" src={characterAsset(portrait.thumbnail)} alt="" loading="lazy" onError={event=>{event.currentTarget.style.visibility='hidden';}}/>
            <span className="lounge-card-shade"/><span className="lounge-card-ornament" aria-hidden="true">✧</span>
            <Heart className="lounge-card-heart" size={18} fill={selected===index?'currentColor':'none'} aria-hidden="true"/>
            <span className="lounge-card-caption"><span>{item.name}</span><small>{item.skins.length} 款皮膚</small></span>
          </button>;
        })}</div>
      </section>
      <article className="lounge-character-area" aria-label={`${character.name}人物區`}>
        <aside className="character-skins" aria-label={`${character.name}的皮膚選擇`}><h2>皮膚</h2><div className="character-skin-list">{character.skins.map((item,index)=><button key={item.id} className={`character-skin ${skin.id===item.id?'is-selected':''}`} aria-pressed={skin.id===item.id} onClick={()=>setSkinChoices(previous=>({...previous,[character.id]:index}))}>
          <img src={characterAsset(item.thumbnail)} alt="" loading="lazy"/><span>{item.name}</span>
        </button>)}</div></aside>
        <div className="lounge-live-feature">
          <div className="character-heading" aria-live="polite"><p>今夜的相遇</p><h2>{character.name}</h2><span>{skin.name}</span></div>
          <CharacterAnimation key={skin.id} skin={skin} name={character.name} motionRequest={motionRequest}/>
        </div>
      </article>
    </div>
  </main>;
}

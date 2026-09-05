import {succubus01} from './succubus-01';
/** Concept profiles from design/char.png; these are not registered 3D examples. */
export const profiles=[
  {id:'noctia',name:'NOCTIA',title:'月夜管理員',tagline:'月光之下，靜候你的到來。',description:'銀髮與書頁相伴，守候深夜圖書館的管理員。',room:'月夜圖書館',quote:'今晚，想讀哪一段故事？',charm:null,mystery:null,trust:null,icon:'☽',crop:0},
  {id:'yoru',name:'SUCCUBUS 01',title:succubus01.number,tagline:'故事，從她開始。',description:succubus01.summary,room:'柔光展示間',quote:'在柔光之中，遇見她。',charm:null,mystery:null,trust:null,icon:'☾',crop:4.0},
  {id:'lilith',name:'LILITH',title:'夢魅侍者',tagline:'夢境，在此相遇。',description:'夢魅侍者，等待你的下一次來訪。',room:'尚待揭曉',quote:'……要不要，再靠近一點？',charm:null,mystery:null,trust:null,icon:'✧',crop:19.4},
  {id:'eve',name:'EVE',title:'紫煙調香師',tagline:'循著香氣，遇見她。',description:'紫煙調香師，在夜色中調配她的故事。',room:'尚待揭曉',quote:'香氣會說謊，但我不會。',charm:null,mystery:null,trust:null,icon:'♧',crop:34.5}
] as const;

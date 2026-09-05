export type Vec3=[number,number,number];
export interface ModelAsset {model:string;position?:Vec3;rotation?:Vec3;scale?:number}
export interface Character extends ModelAsset{id:string;name:string;portrait?:string}
export interface Example{id:string;name:string;room:ModelAsset;characters:[Character,...Character[]]}
/** Original stylized 3D example. Units: meters; Y-up; rotations: radians. */
export const examples:Example[]=[{
  id:'succubus-01',name:'柔光展示間',
  room:{model:'/examples/succubus-01/room.glb'},
  characters:[{id:'succubus-01',name:'Succubus 01',model:'/examples/succubus-01/character.glb',portrait:'/images/succubus-01.png'}]
}];

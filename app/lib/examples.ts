export type Vec3=[number,number,number];
export interface ModelAsset {model:string;position?:Vec3;rotation?:Vec3;scale?:number}
export interface Character extends ModelAsset{id:string;name:string;portrait?:string}
export interface Example{id:string;name:string;room:ModelAsset;characters:[Character,...Character[]]}
/** Register the first example after its assets are supplied. Units: meters; Y-up; rotations: radians. */
export const examples:Example[]=[];

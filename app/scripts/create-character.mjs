// Original stylized geometry, based on the supplied silhouette and colors.
// Units: meters; Y up; character faces +Z. No photograph is projected onto a plane.
import * as T from 'three';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {writeFile,mkdir} from 'node:fs/promises';
globalThis.FileReader=class {readAsArrayBuffer(blob){blob.arrayBuffer().then(data=>{this.result=data;this.onloadend?.();});}};
const character=new T.Group();character.name='Succubus01';
const material=(color,roughness=.55,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
const skin=material('#e7bca8',.65),hair=material('#17141b',.34),hairShine=material('#302331',.42),navy=material('#344858',.68),lace=material('#c9b7a5',.6),lips=material('#b47377',.6),white=material('#fff6ee',.35),iris=material('#493139',.3),black=material('#100d16',.28),gold=material('#cbb493',.28,.65);
function mesh(name,geo,mat,position=[0,0,0],parent=character){const m=new T.Mesh(geo,mat);m.name=name;m.position.fromArray(position);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function oval(name,p,s,mat,parent=character){const m=mesh(name,new T.SphereGeometry(1,32,24),mat,p,parent);m.scale.fromArray(s);return m;}
function tube(name,points,r,mat,parent=character){return mesh(name,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),40,r,8,false),mat,[0,0,0],parent);}
// Smooth tapered anatomical surfaces, with elliptical cross-sections.
function surface(name,sections,mat,parent=character){
 const centers=new T.CatmullRomCurve3(sections.map(s=>new T.Vector3(s[0],s[1],s[2])));
 const radii=new T.CatmullRomCurve3(sections.map(s=>new T.Vector3(s[3],s[4],0)));
 const rings=64,sides=40,positions=[],indices=[];
 for(let i=0;i<=rings;i++){const t=i/rings,c=centers.getPoint(t),r=radii.getPoint(t);for(let j=0;j<=sides;j++){const a=j/sides*Math.PI*2;positions.push(c.x+Math.cos(a)*r.x,c.y,c.z+Math.sin(a)*r.y);}}
 for(let i=0;i<rings;i++)for(let j=0;j<sides;j++){const a=i*(sides+1)+j,b=a+sides+1;indices.push(a,b,a+1,b,b+1,a+1);}
 if(sections.at(-1)[1]<sections[0][1])for(let i=0;i<indices.length;i+=3){[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return mesh(name,g,mat,[0,0,0],parent);
}
surface('Torso',[[0,.91,0,.035,.03],[0,.97,0,.156,.105],[0,1.05,0,.171,.111],[0,1.16,0,.119,.081],[0,1.26,0,.135,.09],[0,1.36,0,.176,.102],[0,1.43,0,.172,.088],[0,1.47,0,.11,.065],[0,1.49,0,.044,.042]],skin);
surface('Neck',[[0,1.44,0,.05,.047],[0,1.52,0,.041,.043],[0,1.57,0,.048,.048]],skin);
for(const side of [-1,1]){
 surface('Leg'+side,[[side*.087,.98,0,.077,.082],[side*.102,.87,0,.077,.082],[side*.11,.74,.011,.062,.064],[side*.107,.56,.025,.044,.046],[side*.109,.51,.024,.042,.044],[side*.106,.40,.006,.054,.053],[side*.102,.22,-.003,.032,.038],[side*.102,.095,.002,.023,.028],[side*.102,.055,.009,.018,.022]],skin);
 oval('Foot'+side,[side*.102,.047,.057],[.037,.04,.091],skin);
 // Modest relaxed pose, with both elbows slightly bent away from the torso.
 surface('Arm'+side,[[side*.15,1.43,0,.045,.048],[side*.202,1.39,0,.048,.049],[side*.229,1.27,.002,.037,.04],[side*.246,1.15,.025,.030,.031],[side*.242,1.08,.038,.033,.033],[side*.215,.99,.055,.024,.025],[side*.20,.925,.064,.018,.02]],skin);
 const palm=oval('Hand'+side,[side*.199,.887,.067],[.026,.045,.018],skin);palm.rotation.z=side*-.12;
 for(let finger=0;finger<4;finger++){const x=side*(.179+finger*.013);tube('Finger'+side+'_'+finger,[[x,.882,.065],[x+side*.004,.851,.071],[x+side*.006,.826+(Math.abs(finger-1.4)*.009),.08]],.006,skin);}
 tube('Thumb'+side,[[side*.18,.904,.066],[side*.164,.881,.083],[side*.158,.86,.085]],.008,skin);
 // Fully covered navy garment cups and wrap band, with raised decorative edging.
 oval('BodiceCup'+side,[side*.081,1.343,.081],[.089,.072,.08],navy);
 tube('CupTrim'+side,[[side*.012,1.335,.146],[side*.036,1.388,.145],[side*.087,1.411,.118],[side*.146,1.382,.124],[side*.162,1.335,.115]],.004,lace);
 tube('ShoulderStrap'+side,[[side*.115,1.392,.119],[side*.14,1.455,.05],[side*.145,1.452,-.06],[side*.12,1.323,-.097]],.009,navy);
 // Embroidery is small geometry rather than a flat photo skin.
 for(let i=0;i<6;i++){const a=i/6*Math.PI*2,cx=side*.081,cy=1.35;const points=[];for(let k=0;k<=16;k++){const t=k/16*Math.PI*2;points.push([cx+Math.cos(a)*.026+Math.cos(t)*.012,cy+Math.sin(a)*.023+Math.sin(t)*.018,.158-Math.abs(Math.cos(a))*.006]);}tube('Embroidery'+side+'_'+i,points,.0018,lace);}
}
surface('BodiceBand',[[0,1.294,0,.139,.094],[0,1.316,0,.152,.101]],navy);
// High-coverage brief: opaque continuous surface from hips to upper thighs.
surface('Brief',[[0,.918,0,.091,.077],[0,.95,0,.13,.101],[0,.99,0,.161,.113],[0,1.025,0,.174,.115],[0,1.05,0,.173,.114]],navy);
const belt=[];for(let j=0;j<=64;j++){const a=j/64*Math.PI*2;belt.push([Math.cos(a)*.174,1.05,Math.sin(a)*.116]);}tube('WaistTrim',belt,.005,lace);
for(const s of [-1,1])for(let i=0;i<5;i++){const x=s*(.032+i*.024);tube('BriefLace'+s+i,[[x,1.04,.112],[x+s*.01,1.018,.116],[x,1,.113]],.0025,lace);}
// Head and face: original stylized reconstruction, not claimed identity recovery.
const head=new T.Group();head.name='Head';head.position.set(0,1.636,.007);head.rotation.z=-.045;character.add(head);
const headMesh=oval('Face',[0,0,0],[.105,.139,.091],skin,head);
const pos=headMesh.geometry.attributes.position;
for(let i=0;i<pos.count;i++){const y=pos.getY(i);if(y<-.25)pos.setX(i,pos.getX(i)*(1+(y+.25)*.24));}pos.needsUpdate=true;headMesh.geometry.computeVertexNormals();
oval('NoseBridge',[0,-.002,.084],[.011,.031,.016],skin,head);oval('NoseTip',[0,-.025,.096],[.015,.012,.016],skin,head);
oval('UpperLip',[0,-.055,.083],[.026,.005,.008],lips,head);oval('LowerLip',[0,-.064,.082],[.023,.006,.008],lips,head);
for(const s of [-1,1]){
 oval('Ear'+s,[s*.103,-.015,-.004],[.016,.031,.016],skin,head);
 const eye=oval('EyeWhite'+s,[s*.041,.013,.080],[.029,.013,.014],white,head);eye.rotation.z=s*.08;
 oval('Iris'+s,[s*.041,.013,.093],[.011,.011,.004],iris,head);
 oval('Pupil'+s,[s*.041,.013,.097],[.0055,.008,.002],black,head);
 oval('EyeHighlight'+s,[s*.038,.017,.099],[.003,.003,.001],white,head);
 tube('Eyelash'+s,[[s*.014,.012,.085],[s*.026,.026,.091],[s*.047,.028,.093],[s*.069,.018,.083]],.0028,black,head);
 tube('Brow'+s,[[s*.017,.047,.078],[s*.042,.054,.081],[s*.07,.045,.07]],.0037,hair,head);
 oval('Stud'+s,[s*.107,-.043,.008],[.005,.007,.005],gold,head);
}
// Upper cap and individual curved locks provide real side/back volume.
const cap=new T.SphereGeometry(1,40,24,0,Math.PI*2,0,Math.PI*.54);const capMesh=mesh('HairCap',cap,hair,[0,.013,-.004],head);capMesh.scale.set(.113,.14,.102);
for(let i=0;i<31;i++){
 const a=Math.PI*.04+i/30*Math.PI*.92;
 const x=Math.cos(a)*.105,z=-Math.sin(a)*.085;
 tube('BackHair'+i,[[x,1.72,z],[x*1.17,1.59,z-.017],[x*1.35,1.40,z-.026],[x*1.42+Math.sin(i)*.012,1.21,z-.029],[x*1.28,1.06+(i%5)*.018,z-.003]],.014+(i%3)*.002,i%5===0?hairShine:hair);
}
for(const s of [-1,1])for(let i=0;i<7;i++){
 tube('FrontLock'+s+i,[[s*(.012+i*.011),1.77,.01],[s*(.067+i*.006),1.70,.071],[s*(.104+i*.006),1.57,.039],[s*(.114+i*.01),1.42,.057],[s*(.128+i*.011),1.22+i*.008,.08]],.008+i*.0008,i%4===0?hairShine:hair);
}
// Fine necklace and pendant.
tube('Necklace',[[-.05,1.50,.035],[-.075,1.453,.071],[0,1.411,.108],[.075,1.453,.071],[.05,1.50,.035]],.002,gold);
oval('Pendant',[0,1.407,.113],[.008,.011,.004],gold);
const room=new T.Group();room.name='SoftLightRoom';
const floor=material('#211b29',.36),platform=material('#382839',.3),curtain=material('#493147',.94),trim=material('#b59976',.45,.5);
mesh('Floor',new T.CylinderGeometry(3,3,.06,96),floor,[0,-.08,0],room);
mesh('DisplayPlinth',new T.CylinderGeometry(.65,.68,.07,96),platform,[0,-.035,0],room);
const ring=mesh('PlinthTrim',new T.TorusGeometry(.65,.006,8,96),trim,[0,-.006,0],room);ring.rotation.x=Math.PI/2;ring.material=material('#efafd9',.3);ring.material.emissive=new T.Color('#ea75c4');ring.material.emissiveIntensity=2.4;
for(let i=0;i<40;i++){const a=Math.PI*.18+i/39*Math.PI*.64;const x=Math.cos(a)*2,z=-Math.sin(a)*2;mesh('CurtainFold'+i,new T.CylinderGeometry(.085,.10,2.8,12),curtain,[x,1.32,z],room);}
for(const s of [-1,1]){mesh('LightStand'+s,new T.CylinderGeometry(.018,.024,1.65,12),trim,[s*1.15,.8,-.6],room);mesh('LightBase'+s,new T.CylinderGeometry(.15,.17,.03,32),platform,[s*1.15,-.035,-.6],room);const shade=material('#f4ded0',.8);shade.emissive=new T.Color('#e8bba0');shade.emissiveIntensity=.3;mesh('LampShade'+s,new T.CylinderGeometry(.12,.22,.27,32),shade,[s*1.15,1.67,-.6],room);}
await mkdir('public/examples/succubus-01',{recursive:true});
const exporter=new GLTFExporter();
for(const [name,object] of [['character',character],['room',room]]){
 object.updateMatrixWorld(true);let triangles=0;object.traverse(node=>{if(node.isMesh)triangles+=(node.geometry.index?.count??node.geometry.attributes.position.count)/3;});
 const data=await exporter.parseAsync(object,{binary:true});await writeFile('public/examples/succubus-01/'+name+'.glb',Buffer.from(data));
 console.log(name+': '+Math.round(triangles)+' triangles, '+data.byteLength+' bytes');
}

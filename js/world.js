import {npcs} from '../data/npcs.js';
import * as T from '../vendor/three.module.js';
export {T};
export function createWorld(canvas){
 const mobile=matchMedia('(pointer: coarse)').matches||innerWidth<900;
 const renderer=new T.WebGLRenderer({canvas,antialias:!mobile,powerPreference:'high-performance'});renderer.setPixelRatio(mobile?1:Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=!mobile;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
 const scene=new T.Scene();scene.background=new T.Color('#a9dce5');scene.fog=new T.Fog('#a9dce5',65,155);const camera=new T.PerspectiveCamera(60,innerWidth/innerHeight,.1,210);
 const playerShadow=new T.Mesh(new T.CircleGeometry(.65,20),new T.MeshBasicMaterial({color:'#183f3e',transparent:true,opacity:.22,depthWrite:false}));playerShadow.rotation.x=-Math.PI/2;scene.add(playerShadow);
 scene.add(new T.HemisphereLight('#e6f8ff','#708956',1.9));const sun=new T.DirectionalLight('#fff0c9',2.5);sun.position.set(-25,45,30);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-55,right:55,top:55,bottom:-55,far:130});sun.shadow.bias=-.0005;scene.add(sun);
 const solids=[],portals=[],animated=[],clues=[];const mats=new Map();function mat(c){if(!mats.has(c))mats.set(c,new T.MeshStandardMaterial({color:c,roughness:.85}));return mats.get(c);}
 function box(x,y,z,w,h,d,c,parent=scene){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function solid(x,z,w,d){solids.push({x,z,w,d});}
 function sphere(x,y,z,r,c,s=1,parent=scene){const m=new T.Mesh(new T.IcosahedronGeometry(r,1),mat(c));m.position.set(x,y,z);m.scale.y=s;m.castShadow=true;parent.add(m);return m;}
 function label(text,x,y,z,color='#f8e8b8',width=7){const c=document.createElement('canvas');c.width=768;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#123d42';ctx.fillRect(0,0,768,128);ctx.strokeStyle=color;ctx.lineWidth=6;ctx.strokeRect(7,7,754,114);ctx.fillStyle=color;ctx.font='bold 42px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,384,66,720);const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;const sp=new T.Sprite(new T.SpriteMaterial({map:tx}));sp.position.set(x,y,z);sp.scale.set(width,width/6,1);scene.add(sp);return sp;}
 box(0,-.65,0,110,1.2,100,'#83ad65');box(0,-.05,9,32,.22,42,'#daceaa');box(0,.08,8,9,.08,39,'#efe1bd');
 const tileGeometry=new T.BoxGeometry(2.94,.035,2.94),tiles=new T.InstancedMesh(tileGeometry,mat('#ded6b7'),140);let tileIndex=0;const tileMatrix=new T.Matrix4();for(let z=-9;z<30;z+=3)for(let x=-14;x<16;x+=3){tileMatrix.makeTranslation(x,.081,z);tiles.setMatrixAt(tileIndex++,tileMatrix);}tiles.count=tileIndex;tiles.receiveShadow=true;scene.add(tiles);
 // River, bridge, and banks. The river is a non-walkable boundary except at the bridge.
 const water=box(0,.01,34,108,.18,10,'#36b6c5');water.material=new T.MeshStandardMaterial({color:'#2eb8ca',metalness:.15,roughness:.3});
 for(let i=0;i<35;i++){const ripple=box(-50+i*3,.115,31+(i%4)*1.6,1.2,.025,.09,'#a7e7df');animated.push(ripple);}
 for(let i=0;i<17;i++)box(0,.28,28+i*.75,7,.35,.69,'#a77b4f');for(const x of [-3.6,3.6]){for(let z=28;z<=41;z+=2.5)box(x,1,z,.2,1.9,.2,'#694a32');box(x,1.7,34.5,.17,.18,13.5,'#caa06b');}
 solid(-29,34,50,10);solid(29,34,50,10);
 // Raised longhouse with a broad gable roof, timber posts and open veranda.
 box(0,2,-15,24,.6,11,'#9a6742');box(0,4,-18,22,4,5,'#bd8a57');solid(0,-17,24,8);
 for(let x=-11;x<=11;x+=2.75){box(x,1,-15,.42,2,.42,'#654631');box(x,4.1,-10,.3,4.1,.3,'#62462e');if(Math.abs(x)>2){box(x,3,-9.8,2.6,.16,.15,'#e6bd77');box(x,2.65,-9.8,2.6,.13,.15,'#e6bd77');}}
 for(let x=-9;x<=9;x+=4.5){box(x,4,-15.42,1.8,2.1,.08,'#23474a');box(x,4,-15.3,.12,2.1,.1,'#f2bf70');}
 const roofShape=new T.Shape();roofShape.moveTo(-7,0);roofShape.lineTo(0,4.6);roofShape.lineTo(7,0);roofShape.closePath();const roof=new T.Mesh(new T.ExtrudeGeometry(roofShape,{depth:26,bevelEnabled:false}),mat('#663c2f'));roof.rotation.y=Math.PI/2;roof.position.set(-13,6,-15);roof.castShadow=true;scene.add(roof);
 for(const side of [-1,1]){const trim=box(0,8.4,-15+side*3.5,27,.18,8.5,'#ba7544');trim.rotation.x=side*.58;}
 for(let i=0;i<6;i++)box(0,.16+i*.34,-5.7-i*.72,5,.34,.9,'#b68a58');
 solid(-7.7,-9.8,9.2,.25);solid(7.7,-9.8,9.2,.25);
 label('HUMA BETANG ILMU',0,7.3,-7.4,'#ffe7ae',12);label('RUANG BELAJAR · KELAS XII',0,4.9,-9,'#b5f4df',7);
 // Fountain / gathering point.
 const base=new T.Mesh(new T.CylinderGeometry(2.7,3,.5,12),mat('#e4d5b2'));base.position.set(0,.35,7);scene.add(base);const inner=new T.Mesh(new T.CylinderGeometry(2.3,2.3,.12,12),mat('#3ec4cf'));inner.position.set(0,.66,7);scene.add(inner);box(0,1.1,7,.8,1.3,.8,'#c4a06a');const gem=new T.Mesh(new T.OctahedronGeometry(.7),new T.MeshStandardMaterial({color:'#84f5e2',emissive:'#2bbca9',emissiveIntensity:.5}));gem.position.set(0,2.4,7);scene.add(gem);solid(0,7,5.6,5.6);
 function tree(x,z,s=1){box(x,1.6*s,z,.5*s,3.2*s,.5*s,'#866040');sphere(x,4*s,z,1.9*s,'#3f8156',1.1);sphere(x-1*s,3.3*s,z+.4*s,1.35*s,'#61994e');sphere(x+.9*s,3.7*s,z,1.5*s,'#88ad53');solid(x,z,.8*s,.8*s);}
 let seed=42;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};for(let i=0;i<65;i++){const x=(rand()-.5)*100,z=(rand()-.5)*88;if(Math.abs(x)<27&&z>-25&&z<42||z>28&&z<40||x< -25&&x> -42&&z>-19&&z<22||x>18&&x<43&&z>14&&z<29)continue;tree(x,z,.7+rand()*.8);}
 for(let i=0;i<16;i++){const x=(i%2?1:-1)*(21+rand()*27),z=-37-rand()*15;sphere(x,2,z,6+rand()*6,'#80a580',1.7);}
 for(const x of [-12,12])for(const z of [0,14,25]){box(x,.35,z,2.5,.7,2,'#ded0ab');for(let j=0;j<3;j++)sphere(x-.6+j*.6,.9,z,.7,'#579658');box(x,2.2,z,.12,3,.12,'#455957');box(x,3.8,z,.7,.7,.7,'#ffe6a0');}
 // Benches and banners frame the plaza.
 for(const x of [-9,9])for(const z of [17,23]){box(x,.8,z,3,.25,.8,'#966a43');box(x,1.4,z+.4,3,.8,.15,'#b38852');for(const dx of [-1,1])box(x+dx,.4,z,.15,.8,.6,'#3e5d58');solid(x,z,3,1);}
 for(const x of [-15,15]){box(x,3.5,-5,.15,7,.15,'#726344');box(x+1.1,5.5,-5,2.2,2.8,.1,'#258e8b');box(x+1.1,5.5,-4.91,.9,.9,.06,'#e6bc64');}
 function portal(id,title,x,z,color){const group=new T.Group();group.position.set(x,0,z);scene.add(group);box(0,.2,0,5.5,.4,3,'#cfbea1',group);for(const dx of [-2.2,2.2])box(dx,2.5,0,.65,4.8,.8,'#c4b79e',group);box(0,4.8,0,5.4,.7,1,'#e3cfa6',group);const glow=new T.Mesh(new T.TorusGeometry(1.7,.12,8,48),new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:2}));glow.position.y=2.4;group.add(glow);const disc=new T.Mesh(new T.CircleGeometry(1.63,48),new T.MeshBasicMaterial({color,transparent:true,opacity:.42,side:T.DoubleSide}));disc.position.set(0,2.4,-.02);group.add(disc);const swirl=new T.Mesh(new T.TorusGeometry(1.35,.035,6,32,Math.PI*1.4),new T.MeshBasicMaterial({color:'#ffffff'}));swirl.position.set(0,2.4,.04);group.add(swirl);label(title,x,6,z,color,7.5);portals.push({id,title,x,z,glow,disc,swirl});}
 portal('lesson','HUMA BETANG ILMU',-10,-4,'#67e7d1');portal('video','BIOSKOP BELAJAR',-21,9,'#ba9aff');portal('quiz','ARENA BAHASA',20,9,'#ffce72');portal('achievements','BALAI PRESTASI',11,-4,'#78cdff');
 // Three connected places with their own landmarks and exploration activities.
 box(-32,.03,1,8,.15,39,'#bbaf8a');box(-23,.02,20,23,.12,5,'#bbaf8a');
 for(let z=-16;z<20;z+=5){tree(-40,z,.9);tree(-25,z,.8);box(-32,.15,z,5,.08,1.7,'#d0bf98');}
 box(-32,3.5,-17,9,.6,1.2,'#745943');for(const x of [-36,-28])box(x,1.7,-17,.7,3.4,.7,'#745943');label('RIMBA LITERASI',-32,4.5,-17,'#d4c6ff',8);
 box(-32,.4,-14,4,.8,2.2,'#7b6351');solid(-32,-14,4,2.2);label('MEJA PENYUSUN',-32,2.2,-14,'#d4c6ff',4.5);portals.push({id:'puzzle:forest',title:'Susun catatan rimba',x:-32,z:-13});
 // The riverside path stays on land. Docks and boats are scenery behind its rail.
 box(31,.04,24,30,.2,6,'#d5bf8b');for(let x=18;x<=44;x+=2){box(x,.55,28,.15,1.5,.15,'#896647');}box(31,1.1,28,27,.16,.16,'#b39161');solid(31,28,28,.3);
 box(37,1.5,18,7,.4,4,'#916942');for(const x of [34,40]){box(x,1,18,.3,2,.3,'#694b37');box(x,3,18,.25,3,.25,'#694b37');}box(37,4.4,18,8,.5,5,'#398b91');solid(37,18,7,3);label('TEPIAN KAHAYAN',33,6,20,'#ffe1a0',9);
 box(39,.45,24,3,.9,1.5,'#8d6845');solid(39,24,3,1.5);label('MEJA PENYUSUN',39,2.4,24,'#ffe1a0',4.5);portals.push({id:'puzzle:river',title:'Susun laporan sungai',x:39,z:24});
 for(const x of [18,29,43]){const boat=box(x,.1,34,1.5,.6,4,'#916541');boat.rotation.y=.5;box(x,.45,34,1.2,.15,2.7,'#cfb783');}
 function clue(area,index,x,z,color){const group=new T.Group();group.position.set(x,1.6,z);scene.add(group);const page=box(0,0,0,.65,.9,.14,'#fff0c3',group);page.rotation.z=.15;for(const y of [-.3,.3])box(0,y,.03,.83,.16,.24,color,group);const ring=new T.Mesh(new T.TorusGeometry(.82,.035,6,24),new T.MeshBasicMaterial({color}));group.add(ring);clues.push({area,index,x,z,group,ring});portals.push({id:`clue:${area}:${index}`,title:'Ambil gulungan petunjuk',x,z});}
 clue('forest',0,-32,10,'#bc9eff');clue('forest',1,-34,1,'#bc9eff');clue('forest',2,-30,-8,'#bc9eff');clue('river',0,23,24,'#ffc45e');clue('river',1,30,23,'#ffc45e');clue('river',2,35,25,'#ffc45e');
 // Ordinary decorative plants, without sacred or ceremonial motifs.
 for(let i=0;i<28;i++){const x=i%2?-43:45,z=-20+i*1.7;sphere(x,.3,z,.5,'#608a48');if(i%3===0)sphere(x,.8,z,.18,'#f1c66d');}
 // Friendly NPC is explicitly marked, never presented as another online player.
 const npcModels=npcs.map((npc,index)=>{const model=createAvatar(npc);model.position.set(npc.x,Math.abs(npc.x)<16?.12:0,npc.z);model.rotation.y=.2;scene.add(model);label(`${npc.name.toUpperCase()} · NPC ${npc.role}`,npc.x,3.5,npc.z,'#ffe1a0',5);portals.push({id:npc.id,title:`Bicara dengan ${npc.name}`,x:npc.x,z:npc.z});solid(npc.x,npc.z,.65,.65);return {model,index};});
 for(let i=0;i<9;i++){const cloud=new T.Group();for(let j=0;j<3;j++)sphere(j*3,0,0,2.6,'#edf8f4',.55,cloud);cloud.position.set(-65+i*17,24+(i%3)*3,-45-(i%2)*15);scene.add(cloud);}
 function blocked(x,z){return Math.abs(x)>49||z< -39||z>45||solids.some(o=>Math.abs(x-o.x)<o.w/2+.4&&Math.abs(z-o.z)<o.d/2+.4);}
 function groundHeight(x,z){
  if(Math.abs(x)<3.1&&z>27.5&&z<41)return .46;
  if(Math.abs(x)<2.55&&z<=-5.25&&z>=-9.75)return Math.min(2.3,.33+Math.floor((-z-5.25)/.72)*.34);
  if(Math.abs(x)<12&&z< -9.75&&z> -13)return 2.3;
  return Math.abs(x)<16&&z>-10&&z<30?.12:0;
 }
 function update(t){for(const {model,index} of npcModels){model.userData.limbs[0].rotation.x=Math.sin(t*1.5+index)*.08;model.userData.limbs[2].rotation.x=-Math.sin(t*1.5+index)*.08;}gem.rotation.y=t;gem.position.y=2.4+Math.sin(t*2)*.12;for(const c of clues){c.group.position.y=1.6+Math.sin(t*2+c.index)*.2;c.group.rotation.y=t*.5;c.ring.rotation.z=t;}for(const p of portals)if(p.swirl){p.swirl.rotation.z=t*.7;p.disc.material.opacity=.3+Math.sin(t*2)*.1;p.glow.scale.setScalar(1+Math.sin(t*2)*.025);}for(let i=0;i<animated.length;i++)animated[i].position.x=-50+i*3+Math.sin(t+i)*.7;}
 function syncClues(progress){for(const c of clues)c.group.visible=!progress.expeditions[c.area].found.includes(c.index);}
 // Group static scenery by material to reduce draw calls on phones.
 const batches=new Map();for(const object of [...scene.children]){if(!object.isMesh||object.isInstancedMesh||animated.includes(object)||object===gem||object===water||!['BoxGeometry','IcosahedronGeometry'].includes(object.geometry.type))continue;const key=object.material.uuid+'|'+object.geometry.type;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(object);}
 for(const list of batches.values()){if(list.length<3)continue;const type=list[0].geometry.type;const geometry=type==='BoxGeometry'?new T.BoxGeometry(1,1,1):new T.IcosahedronGeometry(1,1);const mesh=new T.InstancedMesh(geometry,list[0].material,list.length);list.forEach((object,index)=>{const p=object.geometry.parameters;const scale=type==='BoxGeometry'?new T.Vector3(p.width,p.height,p.depth):new T.Vector3(p.radius,p.radius,p.radius);scale.multiply(object.scale);mesh.setMatrixAt(index,new T.Matrix4().compose(object.position,object.quaternion,scale));scene.remove(object);object.geometry.dispose();});mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);}
 return {renderer,scene,camera,portals,blocked,update,solids,syncClues,groundHeight,playerShadow};
}
export function createAvatar(colors){const g=new T.Group(),limbs=[];const material=c=>new T.MeshStandardMaterial({color:c,roughness:.8});const skin=material(colors.skin),shirt=material(colors.shirt),hair=material(colors.hair),pants=material('#263d49'),white=material('#f4ead5');function part(w,h,d,x,y,z,m,parent=g){const a=new T.Mesh(new T.BoxGeometry(w,h,d),m);a.position.set(x,y,z);a.castShadow=true;parent.add(a);return a;}
 part(.86,.9,.46,0,1.35,0,shirt);part(.71,.68,.65,0,2.15,0,skin);part(.77,.2,.71,0,2.53,0,hair);part(.77,.3,.17,0,2.32,-.28,hair);part(.2,.3,.16,-.27,2.36,.3,hair);for(const x of [-.17,.17])part(.065,.08,.025,x,2.18,.335,pants);part(.17,.03,.025,0,2.01,.335,pants);
 for(const side of [-1,1]){const arm=new T.Group();arm.position.set(side*.61,1.73,0);g.add(arm);part(.32,.5,.4,0,-.23,0,shirt,arm);part(.31,.35,.38,0,-.65,0,skin,arm);limbs.push(arm);const leg=new T.Group();leg.position.set(side*.23,.94,0);g.add(leg);part(.37,.67,.4,0,-.32,0,pants,leg);part(.4,.2,.56,0,-.77,.07,white,leg);limbs.push(leg);}
 part(.63,.7,.23,0,1.4,-.34,pants);part(.36,.07,.025,0,1.55,-.465,material('#78e3da'));
 if(colors.character==='ranger'){part(.95,.15,.86,0,2.66,.04,shirt);part(.72,.28,.65,0,2.8,0,shirt);part(.3,.45,.06,-.21,1.38,.26,material('#d7ba7a'));part(.3,.45,.06,.21,1.38,.26,material('#d7ba7a'));}
 if(colors.character==='maker'){part(.8,.85,.24,0,2.06,-.29,hair);part(.17,.65,.58,-.36,2.13,0,hair);part(.17,.65,.58,.36,2.13,0,hair);part(.84,.11,.49,0,1.74,0,white);}
 g.userData={limbs,skin,shirt,hair};return g;
}




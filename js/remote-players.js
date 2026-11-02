import {createAvatar,T} from './world.js';
import {appearance} from './network-model.js';
function textSprite(text,color='#b9edff'){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;const ctx=canvas.getContext('2d');ctx.fillStyle='#123b46ee';ctx.fillRect(0,0,512,96);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 28px sans-serif';ctx.fillText(text,256,49,490);const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;const sprite=new T.Sprite(new T.SpriteMaterial({map,depthTest:true}));sprite.scale.set(3.9,.73,1);return sprite;
}
function dispose(group){const materials=new Set(),geometries=new Set();group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});geometries.forEach(g=>g.dispose());materials.forEach(m=>{m.map?.dispose();m.dispose();});}
export class RemotePlayers {
 constructor(scene){this.scene=scene;this.players=new Map();}
 set(records){
  for(const [uid,entry] of this.players)if(!records[uid]){this.scene.remove(entry.avatar);dispose(entry.avatar);this.players.delete(uid);}
  for(const [uid,p] of Object.entries(records)){
   const key=JSON.stringify(appearance(p));let entry=this.players.get(uid);
   if(entry&&entry.key!==key){this.scene.remove(entry.avatar);dispose(entry.avatar);this.players.delete(uid);entry=null;}
   if(!entry){const avatar=createAvatar(p);const label=textSprite(`${p.name} · PEMAIN`);label.position.y=3.35;avatar.add(label);avatar.position.set(p.x,p.y,p.z);this.scene.add(avatar);entry={avatar,key,target:new T.Vector3(),record:p};this.players.set(uid,entry);}
   entry.target.set(p.x,p.y,p.z);entry.record=p;if(entry.avatar.position.distanceTo(entry.target)>12)entry.avatar.position.copy(entry.target);
  }
 }
 speak(uid,message){const entry=this.players.get(uid);if(!entry)return;if(entry.bubble){entry.avatar.remove(entry.bubble);dispose(entry.bubble);}entry.bubble=textSprite(message,'#ffe7ae');entry.bubble.position.y=4.2;entry.avatar.add(entry.bubble);entry.bubbleUntil=Date.now()+4500;}
 update(dt,time,localPosition,now){for(const e of this.players.values()){
  const p=e.record;e.avatar.visible=e.target.distanceTo(localPosition)<65;e.avatar.position.lerp(e.target,1-Math.exp(-12*dt));e.avatar.rotation.y+=Math.atan2(Math.sin(p.angle-e.avatar.rotation.y),Math.cos(p.angle-e.avatar.rotation.y))*Math.min(1,dt*12);
  e.avatar.userData.limbs.forEach((limb,i)=>{limb.rotation.z=0;limb.rotation.x=p.moving?Math.sin(time*10)*.65*[1,-1,-1,1][i]:0;});
  if(p.emote&&now-p.emoteAt<4000){const arm=e.avatar.userData.limbs[0];arm.rotation.z=-2.4+Math.sin(time*10)*.3;if(p.emote===2)e.avatar.userData.limbs[2].rotation.z=2.4;if(p.emote===3){arm.rotation.z=-.5;arm.rotation.x=-1.3;}}
  if(e.bubble&&Date.now()>e.bubbleUntil){e.avatar.remove(e.bubble);dispose(e.bubble);e.bubble=null;}
 }}
 clear(){this.set({});}
}

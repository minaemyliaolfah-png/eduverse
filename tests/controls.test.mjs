import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createControls} from '../js/controls.js';

class Surface {
 constructor(){this.listeners=new Map();this.captured=new Set();this.style={};}
 addEventListener(name,handler){if(!this.listeners.has(name))this.listeners.set(name,[]);this.listeners.get(name).push(handler);}
 emit(name,event={}){for(const handler of this.listeners.get(name)||[])handler({preventDefault(){},...event});}
 setPointerCapture(id){this.captured.add(id);}
 releasePointerCapture(id){this.captured.delete(id);}
 hasPointerCapture(id){return this.captured.has(id);}
 getBoundingClientRect(){return {left:0,top:0,width:150,height:150};}
}
test('two pointers walk and turn independently; release, cancel, modal and blur clear motion',()=>{
 const windowSurface=new Surface(),documentSurface=new Surface();
 const oldAdd=globalThis.addEventListener,oldDocument=globalThis.document;
 globalThis.addEventListener=windowSurface.addEventListener.bind(windowSurface);globalThis.document=documentSurface;
 try{
  const canvas=new Surface(),stick=new Surface(),knob=new Surface();let active=true,turns=0,jumps=0;
  const controls=createControls({canvas,stick,knob,active:()=>active,turn:()=>turns++,jump:()=>jumps++,interact(){},pause(){}});
  stick.emit('pointerdown',{pointerId:1,clientX:123,clientY:75,pointerType:'touch'});
  assert.equal(controls.read().x,1);
  canvas.emit('pointerdown',{pointerId:2,clientX:300,clientY:200,pointerType:'touch'});
  canvas.emit('pointermove',{pointerId:2,clientX:330,clientY:200,pointerType:'touch'});
  assert.equal(turns,1);assert.equal(controls.read().x,1);
  // A third finger must not steal either pointer.
  stick.emit('pointerdown',{pointerId:3,clientX:0,clientY:75});
  canvas.emit('pointermove',{pointerId:3,clientX:900,clientY:0});assert.equal(turns,1);
  canvas.emit('pointerup',{pointerId:2});assert.equal(controls.read().x,1);
  stick.emit('pointercancel',{pointerId:1});assert.equal(controls.read().moving,0);
  windowSurface.emit('keydown',{code:'KeyW'});assert.equal(controls.read().z,-1);
  windowSurface.emit('keydown',{code:'Space',repeat:false});assert.equal(jumps,1);
  windowSurface.emit('keydown',{code:'Space',repeat:true});assert.equal(jumps,1);
  controls.reset();active=false;stick.emit('pointerdown',{pointerId:4,clientX:123,clientY:75});assert.equal(controls.read().moving,0);
  active=true;windowSurface.emit('keydown',{code:'KeyW'});windowSurface.emit('blur');assert.equal(controls.read().moving,0);
  stick.emit('pointerdown',{pointerId:5,clientX:123,clientY:75});documentSurface.emit('visibilitychange');assert.equal(controls.read().moving,0);
 }finally{if(oldAdd)globalThis.addEventListener=oldAdd;else delete globalThis.addEventListener;if(oldDocument)globalThis.document=oldDocument;else delete globalThis.document;}
});

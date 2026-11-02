import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialProgress,loadProgress,collectClue,finishExpedition,claimReward} from '../js/progress.js';
import {stickVector} from '../js/controls.js';

test('joystick dead zone, partial speed, diagonal limit, all directions',()=>{
 assert.deepEqual(stickVector(1,1),{x:0,z:0});
 assert.equal(stickVector(24,0).x,.5);
 assert.equal(stickVector(0,-100).z,-1);
 assert.equal(stickVector(-100,0).x,-1);
 assert.ok(Math.abs(Math.hypot(...Object.values(stickVector(100,100)))-1)<1e-10);
});
test('exploration requires all clues, correct order, and unique rewards',()=>{
 const p=initialProgress();assert.equal(finishExpedition(p,'river',[0,1,2]),false);
 assert.equal(collectClue(p,'river',0),true);assert.equal(collectClue(p,'river',0),false);assert.equal(collectClue(p,'river',8),false);
 collectClue(p,'river',1);collectClue(p,'river',2);
 assert.equal(finishExpedition(p,'river',[2,0,1]),false);assert.equal(finishExpedition(p,'river',[0,1,2]),true);assert.equal(finishExpedition(p,'river',[0,1,2]),false);
 assert.equal(p.xp,100);assert.equal(p.coins,30);
 for(const i of [0,1,2])collectClue(p,'forest',i);assert.equal(finishExpedition(p,'forest',[0,1,2]),true);
 p.talked=p.read=p.passed=true;claimReward(p);assert.equal(p.xp,350);assert.equal(p.coins,110);
 const restored=loadProgress({getItem:()=>JSON.stringify(p)});assert.equal(restored.xp,350);assert.equal(finishExpedition(restored,'forest',[0,1,2]),false);
});
test('existing saves migrate; malformed new save data is constrained',()=>{
 const p=loadProgress({getItem:()=>JSON.stringify({name:'Lama',claimed:true,character:'invalid',destination:'moon',expeditions:{river:{found:[0,0,3,-1,'1'],completed:true}}})});
 assert.equal(p.name,'Lama');assert.equal(p.character,'explorer');assert.equal(p.destination,'hub');assert.deepEqual(p.expeditions.river.found,[0]);assert.equal(p.expeditions.river.completed,false);assert.equal(p.xp,150);
});

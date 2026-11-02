import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mergeProgress,latestPlayers,validRoom,roomCode,appearance} from '../js/network-model.js';
import {initialProgress} from '../js/progress.js';
test('private practice merge preserves completion from both devices',()=>{const a=initialProgress(),b=initialProgress();a.talked=true;a.expeditions.river.found=[0,1];b.read=true;b.expeditions.river.found=[1,2];const p=mergeProgress(a,b);assert.ok(p.talked&&p.read);assert.deepEqual(p.expeditions.river.found,[0,1,2]);assert.equal(p.xp,0);});
test('presence excludes own account, stale data, invalid coordinates; same-account sessions deduplicate',()=>{const now=100000;const p={...appearance(initialProgress()),x:0,y:0,z:21,angle:0,area:'hub',at:now};const result=latestPlayers({self:{one:p},other:{one:{...p,at:now-1000},two:{...p,x:2}},old:{one:{...p,at:1}},bad:{one:{...p,x:999}}},'self',now);assert.deepEqual(Object.keys(result),['other']);assert.equal(result.other.x,2);});
test('room codes are bounded, random, and path safe',()=>{const codes=Array.from({length:40},roomCode);assert.ok(codes.every(validRoom));assert.equal(new Set(codes).size,40);assert.equal(validRoom('../rooms'),false);assert.equal(validRoom('AAAAAAAA/'),false);});

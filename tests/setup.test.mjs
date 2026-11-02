import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseWebConfig} from '../js/setup.js';

const config={apiKey:'AIzaExamplePublicConfigOnly123456789',authDomain:'school-demo.firebaseapp.com',projectId:'school-demo',appId:'1:123:web:abc',databaseURL:'https://school-demo-default-rtdb.asia-southeast1.firebasedatabase.app'};
test('setup accepts copied web configuration with a separate database URL',()=>{
 const {databaseURL,...partial}=config;
 assert.deepEqual(parseWebConfig(`const firebaseConfig = ${JSON.stringify(partial)};`,databaseURL),config);
});
test('setup rejects private keys, missing fields, and non-Firebase database addresses',()=>{
 assert.throws(()=>parseWebConfig('{"type":"service_account","private_key":"secret"}'),/kunci privat/);
 assert.throws(()=>parseWebConfig('{}'),/apiKey/);
 for(const databaseURL of ['http://school-demo.firebaseio.com','https://firebaseio.com.evil.test','https://school-demo.firebaseio.com/data','https://user:password@school-demo.firebaseio.com'])assert.throws(()=>parseWebConfig(JSON.stringify({...config,databaseURL})));
});

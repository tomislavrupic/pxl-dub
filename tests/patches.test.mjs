import assert from 'node:assert/strict';import fs from 'node:fs';import {defaultPatch,validatePatch,parsePatch,savePatch,loadPatch} from '../dist/patches.js';
const m=JSON.parse(fs.readFileSync(new URL('../dist/metadata.json',import.meta.url)));const p=defaultPatch(m);p.ducks=[0,15,30,45,60,100];p.pings=Array.from({length:82},(_,i)=>i);p.name='Midnight';
assert.deepEqual(parsePatch(JSON.stringify(p),m),p);
for(const value of [{...p,version:99},{...p,ducks:[-1,0,0,0,0,0]},{...p,pings:[1]},{...p,params:[]},{...p,output:Infinity},{...p,tempo:0}])assert.throws(()=>validatePatch(value,m));
assert.throws(()=>parsePatch('x'.repeat(65537),m));assert.throws(()=>parsePatch('{oops',m));
const storage={value:null,setItem(k,v){this.value=v},getItem(){return this.value}};assert.equal(savePatch(storage,p,m),true);assert.deepEqual(loadPatch(storage,m),p);
storage.value='{bad';assert.deepEqual(loadPatch(storage,m),defaultPatch(m));
const denied={setItem(){throw Error('denied')},getItem(){throw Error('denied')}};assert.equal(savePatch(denied,p,m),false);assert.deepEqual(loadPatch(denied,m),defaultPatch(m));
console.log('Patches: complete recall, duck amounts/pings, malformed/oversized input and storage denial passed');

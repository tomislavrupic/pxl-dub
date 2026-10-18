import fs from 'node:fs';import assert from 'node:assert/strict';
const module=await WebAssembly.compile(fs.readFileSync(new URL('../dist/engine.wasm',import.meta.url)));
let Processor;globalThis.AudioWorkletProcessor=class{constructor(){this.port={onmessage:null,postMessage:()=>{}}}};
globalThis.registerProcessor=(name,Type)=>{Processor=Type};
await import('../dist/audio-worklet.js');
for(const rate of [44100,48000,96000]){
 globalThis.sampleRate=rate;const p=new Processor({processorOptions:{module}});p.port.onmessage({data:{type:'play',value:true}});
 let energy=0;const buffers=[new Float32Array(128),new Float32Array(128)];
 for(let b=0;b<Math.ceil(rate/128);++b){assert.equal(p.process([], [buffers]),true);for(const channel of buffers)for(const x of channel){assert.ok(Number.isFinite(x)&&Math.abs(x)<=1);energy+=x*x;}}
 assert.ok(energy>.01);assert.ok(Math.abs(p.e.dub_status()&&p.status[7]-8)<2,'rate changes tempo');
 p.port.onmessage({data:{type:'action',value:3}});let tail=0;for(let b=0;b<10;++b){p.process([], [buffers]);for(const x of buffers[0])tail+=x*x;}assert.ok(tail<1e-10,'panic left buffered audio');
}
console.log('Worklet: audible finite audio at44.1/48/96kHz, stable tempo and panic passed');
{
 globalThis.sampleRate=44100;const p=new Processor({processorOptions:{module}});
 const metadata=JSON.parse(fs.readFileSync(new URL('../dist/metadata.json',import.meta.url)));
 const patch={piece:0,params:metadata.pieces[0].params,ducks:[100,100,100,100,100,100],recovery:130,tempo:122,mutes:0,scale:0,hold:false,pings:Array(82).fill(255)};
 p.port.onmessage({data:{type:'patch',value:patch,play:false}});const buffers=[new Float32Array(128),new Float32Array(128)];p.process([], [buffers]);
 p.port.onmessage({data:{type:'patch',value:{...patch,piece:1,params:metadata.pieces[1].params,pings:null},play:false}});
 p.process([], [buffers]);const loops=[...new Uint8Array(p.e.memory.buffer,p.e.dub_pings(),82)];
 assert.ok(loops.some(x=>x!==255),'factory patch inherited queued previous loops');
}
{
 globalThis.sampleRate=44100;const p=new Processor({processorOptions:{module}});const metadata=JSON.parse(fs.readFileSync(new URL('../dist/metadata.json',import.meta.url)));
 const params=[...metadata.pieces[0].params],index=key=>metadata.params.find(p=>p.key===key).id;
 for(const [key,value] of Object.entries({ROOT:0,MODE:0,CR0:2,CQ0:1,CX0:0,PMODE:1}))params[index(key)]=value;
 const patch={piece:0,params,ducks:[100,100,100,100,100,100],recovery:130,tempo:122,mutes:0,scale:0,hold:false,pings:null};
 p.port.onmessage({data:{type:'patch',value:patch,play:false}});p.process([], [[new Float32Array(128),new Float32Array(128)]]);p.e.dub_status();assert.equal(p.status[8],2,'patch initial chord ignores its custom progression');
}

import fs from 'node:fs';
const bytes=fs.readFileSync(new URL('../dist/engine.wasm',import.meta.url));const {instance}=await WebAssembly.instantiate(bytes);const e=instance.exports;e.__wasm_call_ctors();e.dub_init();e.dub_piece(0);
const keys=JSON.parse(fs.readFileSync(new URL('../tests/parameter-keys.json',import.meta.url)));
const text=pointer=>{const a=new Uint8Array(e.memory.buffer);let end=pointer;while(a[end])end++;return new TextDecoder().decode(a.subarray(pointer,end));};
const params=Array.from({length:e.dub_param_count()},(_,id)=>({id,key:keys[id],name:text(e.dub_param_name(id)),min:e.dub_param_lo(id),max:e.dub_param_hi(id),default:e.dub_param_value(id)}));
if(params.some(p=>!p.key))throw Error('parameter keys mismatch');
const pieces=Array.from({length:8},(_,i)=>{e.dub_piece(i);return {name:text(e.dub_piece_name(i)),params:params.map(p=>e.dub_param_value(p.id))};});
const metadata={params,pieces,modes:Array.from({length:8},(_,i)=>({name:text(e.dub_mode_name(i)),pool:e.dub_mode_pool(i)})),voices:[7,5,5,5].map((n,l)=>Array.from({length:n},(_,i)=>text(e.dub_voice_name(l,i)))),effects:Array.from({length:16},(_,i)=>text(e.dub_effect_name(i)))};
fs.writeFileSync(new URL('../dist/metadata.json',import.meta.url),JSON.stringify(metadata));console.log(params.length+' original controls and8 pieces exported');

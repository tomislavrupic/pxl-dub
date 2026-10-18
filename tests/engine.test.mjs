import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const bytes=readFileSync(new URL('../dist/engine.wasm',import.meta.url));
const module=await WebAssembly.compile(bytes);
assert.deepEqual(WebAssembly.Module.imports(module),[],'engine must run without host/WASI imports');
const e=new WebAssembly.Instance(module).exports;
e.dub_init(); e.dub_piece(0);e.dub_play(1);
const audio=new Int32Array(e.memory.buffer,e.dub_audio(),128);
let energy=0;const samples=[];
for(let i=0;i<300;++i){e.dub_render();for(const x of audio){assert.ok(Number.isFinite(x));energy+=x*x;samples.push(x);}}
assert.ok(energy>1e10,'browser engine silent');
const expected=readFileSync(new URL('./native-oracle.pcm',import.meta.url));
assert.equal(Buffer.from(new Int32Array(samples).buffer).compare(expected),0,'Wasm sound differs from native bridge');
e.dub_set_duck(0,0);e.dub_release(800);for(let i=0;i<100;++i)e.dub_render();
console.log('Wasm: no imports, finite audible render, exact native parity and duck controls passed');
const pointer=e.dub_chord_text(0,60,63,67,70);const memory=new Uint8Array(e.memory.buffer);let end=pointer;while(memory[end])end++;assert.equal(new TextDecoder().decode(memory.subarray(pointer,end)),'Cm7','chord label lost quality');

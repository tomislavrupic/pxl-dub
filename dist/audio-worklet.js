// SPDX-License-Identifier: GPL-3.0-only
class DubWorklet extends AudioWorkletProcessor {
  constructor(options) {
    super();this.e=new WebAssembly.Instance(options.processorOptions.module).exports;
    this.e.__wasm_call_ctors();this.e.dub_init();this.e.dub_piece(0);
    this.audio=new Int32Array(this.e.memory.buffer,this.e.dub_audio(),128);
    this.status=new Float32Array(this.e.memory.buffer,this.e.dub_status(),227);
    this.left=new Float32Array(512);this.right=new Float32Array(512);this.available=0;this.phase=1;
    this.ratio=44100/sampleRate;this.elapsed=0;this.generation=0;this.peaks=new Float32Array(7);this.envelopes=new Float32Array(7);
    this.pool=[new Float32Array(227),new Float32Array(227),new Float32Array(227)];
    this.port.onmessage=event=>this.message(event.data);
  }
  message(m) {
    if(Number.isInteger(m.generation))this.generation=m.generation;
    if(m.type==='buffer'){this.pool.push(new Float32Array(m.data));return;}
    if(m.type==='param')this.e.dub_set(m.index,m.value);
    else if(m.type==='duck')this.e.dub_set_duck(m.index,m.value);
    else if(m.type==='release')this.e.dub_release(m.value);
    else if(m.type==='tempo')this.e.dub_tempo(m.value);
    else if(m.type==='config')this.e.dub_config(m.key,m.value);
    else if(m.type==='play')this.e.dub_play(m.value?1:0);
    else if(m.type==='piece'){this.e.dub_piece(m.value);this.clearSource();}
    else if(m.type==='action'){this.e.dub_action(m.value);if(m.value===3){this.clearSource();this.envelopes.fill(0);this.peaks.fill(0);}}
    else if(m.type==='patch'){
      const p=m.value;this.e.dub_action(3);this.e.dub_piece(p.piece);
      p.params.forEach((v,i)=>this.e.dub_set(i,v));p.ducks.forEach((v,i)=>this.e.dub_set_duck(i,v));
      this.e.dub_release(p.recovery);this.e.dub_tempo(p.tempo);
      this.e.dub_config(0,p.mutes);this.e.dub_config(1,p.scale);this.e.dub_config(2,p.hold?1:0);
      if(p.pings){new Uint8Array(this.e.memory.buffer,this.e.dub_pings(),82).set(p.pings);this.e.dub_restore_pings();}
      this.e.dub_play(m.play?1:0);this.clearSource();
    }
  }
  clearSource(){this.available=0;this.phase=1;this.left.fill(0);this.right.fill(0);}
  render() {
    this.e.dub_render();
    for(let i=0;i<64;++i){this.left[this.available+i]=this.audio[i*2]/8388608;this.right[this.available+i]=this.audio[i*2+1]/8388608;}
    this.available+=64;this.e.dub_status();
    for(let i=0;i<7;++i)this.peaks[i]=Math.max(this.peaks[i],this.status[i]);
  }
  interpolate(buffer,i,t){const a=buffer[i-1],b=buffer[i],c=buffer[i+1],d=buffer[i+2];return b+.5*t*(c-a+t*(2*a-5*b+4*c-d+t*(3*(b-c)+d-a)));}
  process(inputs,outputs) {
    const out=outputs[0];if(!out||out.length<2)return true;
    for(let frame=0;frame<out[0].length;++frame){
      if(this.phase>=65){const used=Math.floor(this.phase)-1;this.left.copyWithin(0,used,this.available);this.right.copyWithin(0,used,this.available);this.available-=used;this.phase-=used;}
      const i=Math.floor(this.phase);while(this.available<i+3)this.render();
      const t=this.phase-i;out[0][frame]=this.interpolate(this.left,i,t);out[1][frame]=this.interpolate(this.right,i,t);this.phase+=this.ratio;
    }
    this.elapsed+=out[0].length;
    if(this.elapsed>=sampleRate/24){
      const decay=Math.exp(-this.elapsed/(sampleRate*.16));this.elapsed=0;
      for(let i=0;i<7;++i){this.envelopes[i]=Math.max(this.peaks[i],this.envelopes[i]*decay);this.peaks[i]=0;}
      if(this.pool.length){const snapshot=this.pool.pop();snapshot.set(this.status);snapshot.set(this.envelopes,0);this.port.postMessage({type:'status',generation:this.generation,data:snapshot.buffer},[snapshot.buffer]);}
    }
    return true;
  }
}
registerProcessor('pxl-dub',DubWorklet);

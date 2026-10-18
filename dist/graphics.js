// SPDX-License-Identifier: GPL-3.0-only
export class SignalGraphics {
 constructor(scope){this.scope=scope;this.glyphs=[];this.last=performance.now();this.updated=0;this.status=new Float32Array(227);this.gain=.708;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;requestAnimationFrame(t=>this.frame(t));}
 add(canvas,bus,kind,colour){this.glyphs.push({canvas,bus,kind,colour,amount:0,phase:0});}
 receive(data,gain){this.status.set(data);this.gain=gain;this.updated=performance.now();}
 context(canvas){const rect=canvas.getBoundingClientRect(),scale=Math.min(devicePixelRatio||1,2);if(!rect.width||!rect.height)return null;if(canvas.width!==Math.round(rect.width*scale)||canvas.height!==Math.round(rect.height*scale)){canvas.width=Math.round(rect.width*scale);canvas.height=Math.round(rect.height*scale)}const c=canvas.getContext('2d');c.setTransform(scale,0,0,scale,0,0);c.clearRect(0,0,rect.width,rect.height);return {c,w:rect.width,h:rect.height};}
 frame(now){const dt=Math.min(.25,(now-this.last)/1000);this.last=now;const live=now-this.updated<250;
  for(const g of this.glyphs){const level=live?(g.bus===6?Math.max(this.status[1],this.status[2]):this.status[g.bus])*this.gain:0;const target=Math.sqrt(Math.min(1,Math.max(0,level*8)));g.amount+=(target-g.amount)*(1-Math.exp(-dt/(target>g.amount?.065:.26)));if(g.amount<.0001&&target===0){g.amount=0;g.phase=0}else if(!this.reduced)g.phase=(g.phase+dt*g.amount*2.2)%(Math.PI*2);
   const view=this.context(g.canvas);if(!view)continue;const {c,w,h}=view;const a=this.reduced?0:g.amount,flex=a*2.4,wave=Math.sin(g.phase)*flex,x=2,y=h/2;c.strokeStyle=g.colour;c.globalAlpha=.35+g.amount*.32;c.lineWidth=.6;
   if(g.kind%4===0){for(let i=0;i<4;++i){c.beginPath();c.moveTo(x,y-5+i*3);c.bezierCurveTo(x+14,y-5+i*3+wave,x+18,y+flex*(i-1.5)*.5,x+34,y);c.stroke();}}
   else if(g.kind%4===1){for(let i=0;i<4;++i){c.beginPath();c.ellipse(x+i*5+8,y,8+wave*.35,5+flex*.35,0,0,Math.PI*2);c.stroke();}}
   else if(g.kind%4===2){c.beginPath();for(let i=0;i<=90;++i){const t=Math.PI*2*i/90,px=x+18+16*Math.sin(3*t+wave*.14),py=y+(6+flex*.45)*Math.sin(4*t);i?c.lineTo(px,py):c.moveTo(px,py)}c.stroke();}
   else for(let i=0;i<4;++i){c.beginPath();c.moveTo(x+i*8,y+5);c.quadraticCurveTo(x+i*8+4,y-8-flex*(.5+.5*Math.sin(g.phase-i*.6)),x+i*8+8,y+5);c.stroke();}
   const led=g.canvas.parentElement.querySelector('.module-led');if(led)led.style.opacity=.4+.6*g.amount;
  }
  const view=this.context(this.scope);if(view){const {c,w,h}=view;let peak=.025;for(let i=0;i<128;++i)peak=Math.max(peak,Math.abs(this.status[17+i]*this.gain));const boost=Math.max(1,Math.min(16,.75/peak));const gradient=c.createLinearGradient(0,0,w,0);gradient.addColorStop(0,'#c9e8a0');gradient.addColorStop(.4,'#84d7d4');gradient.addColorStop(.7,'#a999e1');gradient.addColorStop(1,'#c493ba');c.strokeStyle=gradient;c.lineWidth=.8;c.beginPath();for(let i=0;i<128;++i){const y=h/2-(live?this.status[17+i]*this.gain*boost:0)*h*.42;i?c.lineTo(i*w/127,y):c.moveTo(0,y)}c.stroke();}
  requestAnimationFrame(t=>this.frame(t));
 }
}

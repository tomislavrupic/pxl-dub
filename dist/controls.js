// SPDX-License-Identifier: GPL-3.0-only
export const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
export function knob({label,min,max,value,step=1,format=v=>String(v),change,reset=value,id}) {
 const root=el('label','knob'),name=el('span','knob-label',label),dial=el('span','dial');
 dial.append(el('span','dial-face'),el('span','dial-pointer'));
 const input=el('input','knob-input');input.type='range';Object.assign(input,{min,max,step,value});input.setAttribute('aria-label',label);if(id)input.dataset.control=id;
 const output=el('output','knob-value');dial.append(input);root.append(name,dial,output);
 const update=v=>{input.value=v;dial.style.setProperty('--angle',(-135+270*(v-min)/(max-min))+'deg');dial.style.setProperty('--value',100*(v-min)/(max-min));output.textContent=format(Number(v));input.setAttribute('aria-valuetext',output.textContent);};
 input.addEventListener('input',()=>{update(Number(input.value));change(Number(input.value));});
 let drag=null;input.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();input.focus();input.setPointerCapture(e.pointerId);drag={y:e.clientY,x:e.clientX,value:Number(input.value)};});
 input.addEventListener('pointermove',e=>{if(!drag)return;const raw=drag.value+(drag.y-e.clientY+(e.clientX-drag.x)*.4)*(max-min)/180;const v=Math.max(min,Math.min(max,Math.round(raw/step)*step));if(v!==Number(input.value)){update(v);change(v);}});
 input.addEventListener('pointerup',()=>{drag=null});input.addEventListener('pointercancel',()=>{drag=null});input.addEventListener('lostpointercapture',()=>{drag=null});
 input.addEventListener('dblclick',()=>{update(reset);change(reset)});update(value);return {root,input,update};
}
export function slider({label,min,max,value,step=1,format=v=>String(v),change,id,cls='pump-control'}) {
 const root=el('label',cls),name=el('span','',label),output=el('output',''),input=el('input');input.type='range';Object.assign(input,{min,max,value,step});input.setAttribute('aria-label',label);if(id)input.dataset.control=id;
 const update=v=>{input.value=v;input.style.setProperty('--slider-value',(100*(v-min)/(max-min))+'%');output.textContent=format(Number(v));input.setAttribute('aria-valuetext',output.textContent)};
 input.addEventListener('input',()=>{update(Number(input.value));change(Number(input.value))});root.append(name,output,input);update(value);return {root,input,update};
}

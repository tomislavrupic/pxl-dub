// SPDX-License-Identifier: GPL-3.0-only
const KEY='pxl-dub-patch-v1';
export function defaultPatch(m){return {version:1,name:'Untitled patch',piece:0,params:[...m.pieces[0].params],ducks:[100,100,100,100,100,100],recovery:130,tempo:122,mutes:0,scale:0,hold:false,output:-3,pings:null};}
export function validatePatch(p,m){
 const number=(v,min,max,integer=false)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max||(integer&&!Number.isInteger(v)))throw Error('Patch contains an invalid control value.');return v;};
 if(!p||typeof p!=='object'||p.version!==1)throw Error('This patch version is not supported.');
 if(!Array.isArray(p.params)||p.params.length!==m.params.length)throw Error('Patch controls are incomplete.');
 if(!Array.isArray(p.ducks)||p.ducks.length!==6)throw Error('Patch duck amounts are incomplete.');
 const params=p.params.map((v,i)=>number(v,m.params[i].min,m.params[i].max,true)),ducks=p.ducks.map(v=>number(v,0,100));
 let pings=null;if(p.pings!==null&&p.pings!==undefined){if(!Array.isArray(p.pings)||p.pings.length!==82)throw Error('Patch loops are incomplete.');pings=p.pings.map(v=>number(v,0,255,true));}
 if(typeof p.name!=='string'||typeof p.hold!=='boolean')throw Error('Patch information is invalid.');
 return {version:1,name:p.name.slice(0,64),piece:number(p.piece,0,7,true),params,ducks,recovery:number(p.recovery,20,800),tempo:number(p.tempo,30,320),mutes:number(p.mutes,0,31,true),scale:number(p.scale,0,4095,true),hold:p.hold,output:number(p.output,-48,6),pings};
}
export function parsePatch(text,m){if(typeof text!=='string'||text.length>65536)throw Error('Choose a PXL Dub patch smaller than64 KB.');return validatePatch(JSON.parse(text),m);}
export function savePatch(storage,p,m){try{storage.setItem(KEY,JSON.stringify(validatePatch(p,m)));return true;}catch{return false;}}
export function loadPatch(storage,m){try{const text=storage.getItem(KEY);return text?parsePatch(text,m):defaultPatch(m);}catch{return defaultPatch(m);}}

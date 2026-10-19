import {create} from 'zustand';
import {defaults,change,randomize,mutate,genomeKey,shortHash,parseGenome,type Genome,type Candidate,type Evaluation} from './engine';
import {SCHEMA,FAMILIES,type VarId,type Value,type Family} from './schema';
type Entry={genome:Genome;label:string;time:string};
interface LabState {genome:Genome;locks:VarId[];selected:VarId[];past:Entry[];future:Entry[];candidates:Candidate[];compare:string[];notice:string;storageError:string;
  setVariable:(id:VarId,value:Value)=>void;setSignature:(on:boolean)=>void;setFamily:(family:Family)=>void;setSeed:(seed:number)=>void;toggleLock:(id:VarId)=>void;toggleSelect:(id:VarId)=>void;
  resetVariable:(id:VarId)=>void;resetAll:()=>void;generate:(scope?:VarId[])=>void;mutation:()=>void;undo:()=>void;redo:()=>void;commit:(g:Genome,label:string)=>void;
  save:(name:string)=>string|undefined;load:(id:string)=>void;remove:(id:string)=>void;toggleCompare:(id:string)=>void;evaluate:(id:string,evaluation:Evaluation)=>void;announce:(text:string)=>void;
}
const key='ui-evolution-lab.phase0.v1';
const builtins:Candidate[]=FAMILIES.map((f,i)=>({id:`baseline-${i}`,name:`${f.short} / Baseline`,genome:defaults(f.id),createdAt:new Date().toISOString(),evaluations:[]}));
function loadStorage(){try{const raw=localStorage.getItem(key);if(!raw)return{};const data=JSON.parse(raw);return {genome:parseGenome(JSON.stringify(data.genome)),locks:Array.isArray(data.locks)?data.locks.filter((id:VarId)=>SCHEMA.some(d=>d.id===id)):[],candidates:Array.isArray(data.candidates)?data.candidates.slice(0,50).map((c:Candidate)=>{if(typeof c.id!=='string'||typeof c.name!=='string'||!Array.isArray(c.evaluations))throw new Error();return {...c,name:c.name.slice(0,80),genome:parseGenome(JSON.stringify(c.genome)),evaluations:c.evaluations.filter(e=>e&&['manual','axe'].includes(e.kind)).slice(-100)};}):builtins,compare:Array.isArray(data.compare)?data.compare.filter((x:unknown)=>typeof x==='string').slice(0,4):[]};}catch{return {storageError:'저장된 데이터를 읽지 못해 기본값으로 시작했습니다.'};}}
const initial=loadStorage();
export const useLab=create<LabState>((set,get)=>({genome:defaults(),locks:[],selected:[],past:[],future:[],candidates:builtins,compare:builtins.map(c=>c.id),notice:'',storageError:'',...initial,
  commit:(genome,label)=>{const s=get();if(JSON.stringify(s.genome)===JSON.stringify(genome))return;set({genome,past:[...s.past,{genome:s.genome,label,time:new Date().toISOString()}].slice(-80),future:[],notice:label});},
  setVariable:(id,value)=>{const s=get();if(s.locks.includes(id))return;s.commit(change(s.genome,id,value),`${id} ${SCHEMA.find(d=>d.id===id)?.name} 변경`);},
  setSignature:on=>{const s=get();s.commit({...s.genome,signature:on},`Signature ${on?'활성':'비활성'}`);},
  setFamily:family=>get().setVariable('A01',family),
  setSeed:seed=>{if(Number.isInteger(seed)&&seed>=0&&seed<=0xffffffff)set({genome:{...get().genome,seed}});},
  toggleLock:id=>set(s=>({locks:s.locks.includes(id)?s.locks.filter(x=>x!==id):[...s.locks,id]})),
  toggleSelect:id=>set(s=>({selected:s.selected.includes(id)?s.selected.filter(x=>x!==id):[...s.selected,id]})),
  resetVariable:id=>{const s=get();s.setVariable(id,id==='A01'?'apple-inspired':defaults(s.genome.family).variables[id]);},
  resetAll:()=>{const s=get();let g=defaults(s.genome.family,s.genome.seed);for(const id of s.locks)g=change(g,id,s.genome.variables[id]);s.commit(g,'잠금 외 변수 기본값 복원');},
  generate:ids=>{const s=get();s.commit(randomize(s.genome,s.genome.seed,ids,s.locks),'시드 기반 무작위 생성');},
  mutation:()=>{const s=get();s.commit(mutate(s.genome,s.genome.seed,4,s.locks),'4개 변수 유전자 변형');},
  undo:()=>{const s=get(),last=s.past.at(-1);if(!last)return;set({genome:last.genome,past:s.past.slice(0,-1),future:[...s.future,{genome:s.genome,label:last.label,time:new Date().toISOString()}],notice:'실행 취소'});},
  redo:()=>{const s=get(),last=s.future.at(-1);if(!last)return;set({genome:last.genome,future:s.future.slice(0,-1),past:[...s.past,{genome:s.genome,label:last.label,time:new Date().toISOString()}],notice:'다시 실행'});},
  save:name=>{const s=get();const duplicate=s.candidates.find(c=>genomeKey(c.genome)===genomeKey(s.genome));if(duplicate){set({notice:`동일한 유전자가 이미 있습니다: ${duplicate.name}`});return duplicate.id;}if(s.candidates.length>=50){set({notice:'최대 50개 후보를 저장할 수 있습니다. 기존 후보를 삭제하세요.'});return;}const id=`${shortHash(s.genome)}-${Date.now()}`;set({candidates:[...s.candidates,{id,name:name.trim().slice(0,80)||`Variant ${s.candidates.length+1}`,genome:structuredClone(s.genome),createdAt:new Date().toISOString(),evaluations:[]}],notice:'디자인 후보를 저장했습니다.'});return id;},
  load:id=>{const c=get().candidates.find(x=>x.id===id);if(c)get().commit(structuredClone(c.genome),`${c.name} 불러오기`);},
  remove:id=>set(s=>({candidates:s.candidates.filter(x=>x.id!==id),compare:s.compare.filter(x=>x!==id),notice:'저장된 후보 삭제'})),
  toggleCompare:id=>{const s=get();if(s.compare.includes(id))set({compare:s.compare.filter(x=>x!==id)});else if(s.compare.length<4)set({compare:[...s.compare,id]});else set({notice:'최대 4개까지 비교할 수 있습니다.'});},
  evaluate:(id,evaluation)=>set(s=>({candidates:s.candidates.map(c=>c.id===id?{...c,evaluations:[...c.evaluations,evaluation].slice(-100)}:c),notice:'평가 결과를 기록했습니다.'})),
  announce:notice=>set({notice})
}));
let lastSaved='';
useLab.subscribe(s=>{try{const serialized=JSON.stringify({genome:s.genome,locks:s.locks,candidates:s.candidates,compare:s.compare});if(serialized!==lastSaved){localStorage.setItem(key,serialized);lastSaved=serialized;}}catch{if(!s.storageError)useLab.setState({storageError:'기기 저장 공간이 부족하거나 저장이 차단되었습니다. JSON으로 내보내세요.'});}});

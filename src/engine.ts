import {SCHEMA,BY_ID,type VarId,type Value,type Family,type View,type Definition} from './schema';
export const SCHEMA_VERSION='phase0-1.0.0';
export interface Genome {version:1;schemaVersion:string;family:Family;signature:boolean;seed:number;variables:Record<VarId,Value>}
export type Evaluation={timestamp:string;kind:'manual'|'axe';score?:number;notes:string;violations?:number};
export interface Candidate {id:string;name:string;genome:Genome;createdAt:string;evaluations:Evaluation[]}
export function defaults(family:Family='apple-inspired',seed=12345):Genome {
  const variables=Object.fromEntries(SCHEMA.map(d=>[d.id,d.default])) as Genome['variables'];
  const patches:Record<Family,Partial<Genome['variables']>>={
    'apple-inspired':{},
    'material-inspired':{A02:'split',A07:'balanced',B01:'left',B02:'both',C02:'tonal',C05:'tinted',C06:'tinted',E08:28,F01:'tonal',F02:'rounded',G05:'solid',G06:'tinted',I01:'flat',H02:'ease'},
    experimental:{A02:'editorial',A12:'offset',B02:'both',C01:'orange',C02:'complementary',C05:'warm',D03:2.5,D04:800,D09:'uppercase',E08:4,E10:2,F01:'outlined',F02:'square',G05:'solid',G01:'feature',H02:'linear',I01:'flat'}
  };
  Object.assign(variables,patches[family],{A01:family});
  return {version:1,schemaVersion:SCHEMA_VERSION,family,signature:true,seed,variables};
}
export function inactiveReason(d:Definition,g:Genome,view?:View,viewportWidth?:number):string|undefined {
  if(view&&d.scope!=='all'&&d.scope!==view) return `${d.appliesTo} 화면에서 적용됩니다. 미리보기 탭을 전환하세요.`;
  if(!g.signature&&(d.id==='F08'||d.id==='F09')) return 'Signature를 켜면 커스텀 캡슐 형태를 조정할 수 있습니다.';
  if(viewportWidth!==undefined){
    const mobile=viewportWidth<Number(g.variables.J04),tablet=!mobile&&viewportWidth<1024;
    if(['J01','J05','J06'].includes(d.id)&&!mobile)return '모바일 폭에서 적용됩니다. 모바일 미리보기로 전환하세요.';
    if(d.id==='J02'&&!tablet)return '태블릿 폭에서 적용됩니다. 태블릿 미리보기로 전환하세요.';
    if(d.id==='J03'&&(mobile||tablet))return '1024px 이상 데스크톱 폭에서 적용됩니다.';
    if(mobile&&['B01','B09'].includes(d.id))return `모바일에서는 ${d.id==='B01'?'J05 모바일 메뉴':'J06 모바일 필터'}가 우선 적용됩니다.`;
    if(d.id==='G08'&&(mobile||tablet))return '현재 폭에서는 J01·J02가 열 수를 결정합니다. 데스크톱에서 조정하세요.';
  }
  for(const dep of d.dependencies) if(!dep.values.includes(g.variables[dep.id])) return dep.reason;
}
export function constraints(g:Genome):string[] {
  const errors:string[]=[];
  for(const d of SCHEMA) if(!d.options.some(o=>o.value===g.variables[d.id])) errors.push(`${d.id}: 허용되지 않은 값`);
  if(g.family!==g.variables.A01) errors.push('family와 A01 값이 다릅니다.');
  if(!Number.isInteger(g.seed)||g.seed<0||g.seed>0xffffffff) errors.push('seed는 0~4294967295 정수여야 합니다.');
  return errors;
}
export function parseGenome(input:string):Genome {
  if(input.length>100_000) throw new Error('JSON은 100KB 이하여야 합니다.');
  const obj:unknown=JSON.parse(input);
  if(!obj||typeof obj!=='object'||Array.isArray(obj)) throw new Error('유전자 객체가 필요합니다.');
  const g=obj as Partial<Genome>;
  if(Object.keys(g).some(k=>!['version','schemaVersion','family','signature','seed','variables'].includes(k))) throw new Error('알 수 없는 유전자 필드는 허용하지 않습니다.');
  if(g.version!==1||g.schemaVersion!==SCHEMA_VERSION) throw new Error(`version 1 / ${SCHEMA_VERSION} 스키마가 필요합니다.`);
  if(typeof g.signature!=='boolean'||!g.variables||typeof g.variables!=='object'||Array.isArray(g.variables)) throw new Error('signature·variables 형식이 올바르지 않습니다.');
  const keys=Object.keys(g.variables);
  if(keys.length!==120||keys.some(k=>!(k in BY_ID))) throw new Error('정확히 120개의 알려진 변수만 허용합니다.');
  const errors=constraints(g as Genome);
  if(errors.length) throw new Error(errors.slice(0,5).join('\n'));
  // Construct a fresh plain object; never merge untrusted prototype keys.
  return {version:1,schemaVersion:SCHEMA_VERSION,family:g.family!,signature:g.signature,seed:g.seed!,variables:Object.fromEntries(SCHEMA.map(d=>[d.id,g.variables![d.id]])) as Genome['variables']};
}
export function change(g:Genome,id:VarId,value:Value):Genome {
  if(!BY_ID[id].options.some(o=>o.value===value)) throw new Error(`${id} 도메인 위반`);
  return {...g,family:id==='A01'?value as Family:g.family,variables:{...g.variables,[id]:value}};
}
/** Mulberry32; finite schema order is part of the reproducibility contract. */
export function seededRandom(seed:number) {let a=seed>>>0;return ()=>{a|=0;a=a+0x6d2b79f5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
export function randomize(g:Genome,seed:number,ids:VarId[]=SCHEMA.map(d=>d.id),locks:VarId[]=[]):Genome {
  const random=seededRandom(seed);let next={...g,seed:seed>>>0,variables:{...g.variables}};
  // Always consume one PRNG sample per definition, even when locked or out of scope.
  for(const d of SCHEMA){const index=Math.floor(random()*d.options.length);if(ids.includes(d.id)&&!locks.includes(d.id)) next=change(next,d.id,d.options[index].value);}
  return next;
}
export function mutate(g:Genome,seed:number,count=4,locks:VarId[]=[]):Genome {
  const r=seededRandom(seed);const pool=SCHEMA.filter(d=>!locks.includes(d.id));
  const ids:VarId[]=[];while(pool.length&&ids.length<count){const i=Math.floor(r()*pool.length);ids.push(pool.splice(i,1)[0].id);}
  let next={...g,seed:seed>>>0,variables:{...g.variables}};
  for(const id of ids){const alternatives=BY_ID[id].options.filter(o=>o.value!==g.variables[id]);next=change(next,id,alternatives[Math.floor(r()*alternatives.length)].value);}
  return next;
}
export function genomeKey(g:Genome):string {return JSON.stringify([SCHEMA_VERSION,g.signature,SCHEMA.map(d=>g.variables[d.id])]);}
export function shortHash(g:Genome):string {let h=2166136261;for(const c of genomeKey(g)){h=Math.imul(h^c.charCodeAt(0),16777619);}return(h>>>0).toString(16).padStart(8,'0');}
export function combinationStats(defs=SCHEMA) {
  const exact=defs.reduce((total,d)=>total*BigInt(d.options.length),1n);
  const s=exact.toString(); const log10=defs.reduce((sum,d)=>sum+Math.log10(d.options.length),0);
  return {exact:s,digits:s.length,scientific:`${s[0]}.${s.slice(1,7)} × 10^${s.length-1}`,log10};
}
export function diff(a:Genome,b:Genome) {return SCHEMA.filter(d=>a.variables[d.id]!==b.variables[d.id]).map(d=>({id:d.id,name:d.name,a:a.variables[d.id],b:b.variables[d.id]}));}
export function candidatesCSV(candidates:Candidate[]) {
  const cell=(x:unknown)=>{const s=String(x??'');const safe=/^[=+\-@\t\r]/.test(s)?`'${s}`:s;return `"${safe.replaceAll('"','""')}"`;};
  return '\uFEFF'+[['id','name','createdAt','family','seed','evaluations','latestScore','notes',...SCHEMA.map(d=>d.id)],...candidates.map(c=>[c.id,c.name,c.createdAt,c.genome.family,c.genome.seed,c.evaluations.length,c.evaluations.at(-1)?.score??'',c.evaluations.at(-1)?.notes??'',...SCHEMA.map(d=>c.genome.variables[d.id])])].map(row=>row.map(cell).join(',')).join('\r\n');
}
export function download(name:string,content:string,type='application/json'){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export interface SearchStrategy {id:string;propose(parent:Genome,context:{seed:number;locks:VarId[];seen:Set<string>}):Genome|null}
export const randomSearch:SearchStrategy={id:'random-search',propose:(parent,c)=>{const next=randomize(parent,c.seed,undefined,c.locks);return c.seen.has(genomeKey(next))?null:next;}};
export interface EvaluationAdapter {id:string;evaluate(genome:Genome,signal?:AbortSignal):Promise<Evaluation>}

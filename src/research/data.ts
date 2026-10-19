import {parseGenome,genomeKey,type Genome} from '../engine';
import {sha256} from './hash';
import {BY_ID,type VarId} from '../schema';
import {validateConfig,defaultConfig,seedList} from './config';
import {ALGORITHMS,EVALUATION_VERSION,type EvaluationRecord,type Experiment} from './types';
export const CSV_COLUMNS=['experiment_id','algorithm','design_family','run_id','seed','candidate_id','genome_hash','genome_json','active_variables','evaluation_level','evaluation_version','objective','viewport','function_score','accessibility_score','layout_score','consistency_proxy_score','total_score','score_sources','eligible','constraint_violations','task_results','evaluation_duration_ms','cache_hit','timestamp','measurement_id','measurement_timestamp','evaluation_index','best_so_far','operator','reward','attempts','error','formulas','raw'] as const;
const cell=(x:unknown)=>{let s=x===null||x===undefined?'':typeof x==='object'?JSON.stringify(x):String(x);if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
export function recordsCSV(records:EvaluationRecord[]){return '\uFEFF'+[CSV_COLUMNS.join(','),...records.map(r=>CSV_COLUMNS.map(k=>cell(r[k])).join(','))].join('\r\n');}
export function tableCSV(rows:Record<string,unknown>[]){const keys=Object.keys(rows[0]??{});return '\uFEFF'+[keys.join(','),...rows.map(r=>keys.map(k=>cell(r[k])).join(','))].join('\r\n');}
export function migrateGenome(value:unknown):{genome:Genome;notes:string[]}{
 const raw=typeof value==='string'?JSON.parse(value):value;
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('유전자 객체가 필요합니다.');
 const g=raw as Record<string,unknown>,notes:string[]=[];
 if(g.schemaVersion!==undefined)return {genome:parseGenome(JSON.stringify(g)),notes};
 if(g.version!==1||!g.variables||typeof g.variables!=='object')throw new Error('지원하는 version 1 유전자 스키마 형식이 아닙니다.');
 if(Object.keys(g).some(k=>!['version','family','signature','seed','variables'].includes(k)))throw new Error('알 수 없는 유전자 필드가 있습니다.');
 notes.push('기존 version 1에 schemaVersion=phase0-1.0.0을 명시했습니다.');
 return {genome:parseGenome(JSON.stringify({...g,schemaVersion:'phase0-1.0.0',signature:g.signature??true})),notes};
}
export function parseExperiment(input:string):Experiment {
 if(input.length>80_000_000)throw new Error('실험 JSON은 80MB 이하여야 합니다.');const e=JSON.parse(input);
 if(e?.version!==2){if(e?.config?.objective==='synthetic-surrogate-v1'&&Array.isArray(e.records))return migratePhase1(e);throw new Error('Phase 2 실험 또는 Phase 1 synthetic JSON이 필요합니다.');}
 if(typeof e.experiment_id!=='string'||typeof e.name!=='string'||!e.config||!Array.isArray(e.records)||!Array.isArray(e.runs)||e.records.length>20000||e.runs.length>180||!['running','completed','stopped','cancelled','interrupted'].includes(e.status))throw new Error('실험 구조 또는 크기가 올바르지 않습니다.');
 const errors=validateConfig(e.config);if(errors.length)throw new Error(errors.join('\n'));
 const ids=new Set<string>(),positions=new Set<string>();
 for(const r of e.records){
  if(!r||typeof r!=='object'||typeof r.candidate_id!=='string'||ids.has(r.candidate_id)||r.experiment_id!==e.experiment_id||!ALGORITHMS.includes(r.algorithm)||!e.config.algorithms.includes(r.algorithm)||!e.config.families.includes(r.design_family)||r.genome_json?.family!==r.design_family||r.evaluation_version!==EVALUATION_VERSION||r.evaluation_level!==e.config.level||r.objective!==e.config.objective)throw new Error('평가 식별자·버전·수준이 일치하지 않습니다.');
  const position=`${r.run_id}/${r.evaluation_index}`;if(positions.has(position))throw new Error('반복 평가 순번이 중복되었습니다.');positions.add(position);
  ids.add(r.candidate_id);r.genome_json=parseGenome(JSON.stringify(r.genome_json));
  for(const key of ['function_score','accessibility_score','layout_score','consistency_proxy_score','total_score','best_so_far'])if(r[key]!==null&&(typeof r[key]!=='number'||!Number.isFinite(r[key])||r[key]<0||r[key]>100))throw new Error(`${key}: 0~100 또는 null이어야 합니다.`);
  const legacy=e.migration?.from==='phase1';
  if(!Number.isInteger(r.evaluation_index)||r.evaluation_index<1||r.evaluation_index>e.config.budget||(!legacy||r.evaluation_duration_ms!==null)&&(!Number.isFinite(r.evaluation_duration_ms)||r.evaluation_duration_ms<0)||typeof r.cache_hit!=='boolean'||typeof r.eligible!=='boolean'||!r.score_sources||!r.raw||!r.formulas||!Array.isArray(r.task_results)||!Array.isArray(r.constraint_violations)||typeof r.genome_hash!=='string'||typeof r.timestamp!=='string')throw new Error('평가 원자료 필드가 누락되었습니다.');
  if(r.genome_hash!==sha256(genomeKey(r.genome_json)))throw new Error('유전자 SHA-256이 실제 유전자와 다릅니다.');
  const expected=r.error?null:r.objective==='synthetic-surrogate-v1'?'Synthetic':r.evaluation_level===2?'Measured':'Proxy';
  if(r.score_sources.Q!==expected||r.evaluation_level===1&&r.function_score!==null)throw new Error('평가 출처 또는 미측정 값이 일치하지 않습니다.');
  if(typeof r.error!=='string'&&r.error!==null||!Number.isInteger(r.seed)||r.seed<0||r.seed>0xffffffff||typeof r.run_id!=='string'||typeof r.measurement_id!=='string'||!(legacy&&r.measurement_timestamp===null)&&typeof r.measurement_timestamp!=='string'||!Number.isFinite(Date.parse(r.timestamp))||!Number.isFinite(r.attempts)||r.attempts<0||r.attempts>2||r.reward!==null&&(!Number.isFinite(r.reward)||r.reward<0||r.reward>1))throw new Error('시드·시간·오류·보상 기록 형식이 올바르지 않습니다.');
  if(JSON.stringify(r.active_variables)!==JSON.stringify(e.config.activeVariables)||JSON.stringify(r.viewport)!==JSON.stringify(e.config.viewports)||typeof r.eligible!=='boolean'||r.constraint_violations.some((i:any)=>!i||!['minor','moderate','serious','critical'].includes(i.severity)||typeof i.message!=='string'||typeof i.selector!=='string'))throw new Error('변수 공간·화면·제약 원자료가 올바르지 않습니다.');
  if(r.error){if(r.eligible||[r.function_score,r.accessibility_score,r.layout_score,r.consistency_proxy_score,r.total_score].some(v=>v!==null))throw new Error('평가 실패에 점수를 할당할 수 없습니다.');}
  else if(r.objective==='synthetic-surrogate-v1'){
   if(r.raw.kind!=='synthetic'||[r.function_score,r.accessibility_score,r.layout_score,r.consistency_proxy_score].some(v=>v!==null))throw new Error('Synthetic은 실제 측정 항목을 만들 수 없습니다.');
  }else if(r.evaluation_level===1){
   if(r.raw.kind!=='static'||!Array.isArray(r.raw.rules)||!Array.isArray(r.raw.layoutRisk)||!Array.isArray(r.raw.contrast)||['A','L','C'].some(k=>r.score_sources[k]!=='Proxy'))throw new Error('Level 1 대리지표 원자료가 누락되었습니다.');
  }else{
   const b=r.raw.browser;
   if(r.raw.kind!=='browser'||b?.kind!=='playwright'||!b.environment||!Array.isArray(b.pageErrors)||!Array.isArray(b.views)||b.views.length!==e.config.viewports.length||['F','A','L'].some(k=>r.score_sources[k]!=='Measured')||r.score_sources.C!=='Proxy')throw new Error('Level 2에는 Playwright 실행환경과 실측 원자료가 필요합니다.');
   for(const view of b.views)if(!e.config.viewports.some((p:any)=>p.id===view.viewport?.id&&p.width===view.viewport.width&&p.height===view.viewport.height)||!Array.isArray(view.tasks)||view.tasks.length!==4||!view.tasks.every((t:any)=>typeof t.success==='boolean'&&t.source==='Measured'&&Number.isInteger(t.steps)&&t.steps>=0&&Number.isFinite(t.duration_ms)&&t.duration_ms>=0)||!Array.isArray(view.layout?.issues)||!Array.isArray(view.axe?.violations)||!Array.isArray(view.axe?.incomplete)||!Array.isArray(view.keyboard)||!view.reducedMotion||typeof view.screenshot!=='string')throw new Error('화면별 실측 원자료가 불완전합니다.');
  }
 }
 for(const run of e.runs)if(!run||typeof run.id!=='string'||!Array.isArray(run.curve)||!Array.isArray(run.arms)||!ALGORITHMS.includes(run.algorithm)||!['running','completed','stopped','cancelled'].includes(run.status))throw new Error('반복 결과 형식 오류');
 if(e.status==='running')e.status='interrupted';return e as Experiment;
}
// Phase 1 exports are historical Synthetic observations. Do not promote to measured data.
function migratePhase1(old:any):Experiment {
 const cfg=old.config,c=defaultConfig(cfg.family);c.algorithms=['random','ga','ucb'];c.budget=Number(cfg.budget);c.repetitions=Number(cfg.reps);c.seed=Number(cfg.seed)>>>0;c.seeds=seedList(c.seed,c.repetitions);c.activeCount=Number(cfg.nvars) as typeof c.activeCount;c.activeVariables=(cfg.keys as string[]).filter(k=>k in BY_ID) as VarId[];
 const legacyVariables=[...c.activeVariables];
 const legacySeed=(algorithm:string,rep:number)=>(c.seed+(rep-1)*100003+({random:1,ga:2,ucb:3}[algorithm]??0)*2654435761)>>>0;
 // Phase 1 requested 120 but silently omitted A01: restore as tracked, fixed family.
 if(c.activeCount===120&&c.activeVariables.length===119)c.activeVariables.push('A01');
 c.population=Number(cfg.pop);c.mutationRate=Number(cfg.rate);c.ucbC=Number(cfg.c);c.objective='synthetic-surrogate-v1';c.enforceAccessibility=false;c.maxEvaluations=20000;
 if(c.budget>2000||c.budget*c.repetitions*3>20000)throw new Error('Phase 1 대형 기록은 20,000행 이하로 나누어 가져오세요 (평가 예산 최대 2,000).');
 const errors=validateConfig(c);if(errors.length)throw new Error(errors.join('\n'));
 const id='phase1-import-'+crypto.randomUUID(),ts=new Date().toISOString();const e:Experiment={version:2,experiment_id:id,name:'Phase 1 · imported Synthetic',config:c,created_at:ts,updated_at:ts,status:old.stopped?'stopped':'completed',records:[],runs:[],elapsed_ms:Number(old.elapsedMs)||0,environment:{origin:'Phase 1 HTML export; original environment not recorded'},warnings:['원래 실행시각·평가시간·캐시 정보 미기록. 가져온 시각을 timestamp로 기록합니다.','Phase 1 UCB는 4개 연산자, Phase 2는 6개입니다. 알고리즘 버전이 다릅니다.'],migration:{from:'phase1',notes:['원래 합성 점수와 후보 유전자를 보존했습니다.','원래 알고리즘을 Phase 2 엔진으로 재개하지 않습니다. Phase 1의 120변수 선택은 실제 119변수였으며 원래 목적함수의 변수 목록을 raw에 보존합니다.','원래 genome 필드의 120 변수 객체에 version·계열 메타데이터를 복원했습니다.']}};
 for(const row of old.records){const vars=typeof row.genome==='string'?JSON.parse(row.genome):row.genome;const genome=parseGenome(JSON.stringify({version:1,schemaVersion:'phase0-1.0.0',signature:true,family:cfg.family,seed:c.seed,variables:vars}));if(!ALGORITHMS.includes(row.algorithm)||!Number.isFinite(row.score)||row.score<0||row.score>100||!Number.isInteger(row.evaluation)||row.evaluation<1||row.evaluation>c.budget)throw new Error('Phase 1 평가행 오류');
  const runId=`${cfg.family}/${row.algorithm}/${row.rep}`,candidateId=`${id}/${runId}/${row.evaluation}`;
  e.records.push({experiment_id:id,algorithm:row.algorithm,design_family:cfg.family,run_id:runId,seed:legacySeed(row.algorithm,row.rep),candidate_id:candidateId,genome_hash:sha256(genomeKey(genome)),genome_json:genome,active_variables:c.activeVariables,evaluation_level:1,evaluation_version:EVALUATION_VERSION,objective:c.objective,viewport:c.viewports,function_score:null,accessibility_score:null,layout_score:null,consistency_proxy_score:null,total_score:row.score,score_sources:{F:null,A:null,L:null,C:null,Q:'Synthetic'},constraint_violations:[],task_results:[],evaluation_duration_ms:null,cache_hit:false,timestamp:ts,eligible:true,error:null,raw:{kind:'synthetic',objective:c.objective,formula:'Imported Phase 1; not rerun',activeVariables:legacyVariables},formulas:{Q:'원래 Phase 1 synthetic-surrogate-v1 결과'},evaluation_index:row.evaluation,best_so_far:row.best,operator:null,reward:null,attempts:0,measurement_id:candidateId,measurement_timestamp:null});
 }
 for(const r of old.runs??[]){e.runs.push({id:`${cfg.family}/${r.algorithm}/${r.rep}`,algorithm:r.algorithm,family:cfg.family,seed:legacySeed(r.algorithm,r.rep),repetition:r.rep,curve:r.curve,best:r.best,bestCandidateId:e.records.filter(x=>x.algorithm===r.algorithm&&x.run_id.endsWith('/'+r.rep)).sort((a,b)=>b.total_score!-a.total_score!)[0]?.candidate_id??null,unique:r.unique,cacheHits:0,successful:r.curve.length,failed:0,ineligible:0,arms:[],status:r.curve.length===c.budget?'completed':'stopped',duration_ms:0});}return e;
}

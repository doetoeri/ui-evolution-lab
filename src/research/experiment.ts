import {defaults,genomeKey,shortHash,type Genome} from '../engine';
import {validateConfig} from './config';
import {failedEvaluation,proxyEvaluation,syntheticEvaluation,validateGenomeLevel0} from './evaluation';
import {normalizedReward,Optimizer} from './optimizer';
import {SEARCH_VERSION,type EvaluationPayload,type EvaluationRecord,type Evaluator,type Experiment,type ExperimentConfig,type RunResult} from './types';
export class ExperimentControl {stopRequested=false;abort=new AbortController();stop(){this.stopRequested=true;}cancel(){this.abort.abort();}}
export async function genomeSHA(g:Genome){const bytes=new TextEncoder().encode(genomeKey(g));const digest=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');}
export const localEvaluator:Evaluator={id:'local-static-v2',async evaluate(g,{config}){return config.objective==='synthetic-surrogate-v1'?syntheticEvaluation(g,config):proxyEvaluation(g,config);}};
export function cacheKey(g:Genome,c:ExperimentConfig,environment:string){return JSON.stringify([genomeKey(g),c.objective,c.evaluationVersion,c.activeVariables,c.viewports,c.weights,c.enforceAccessibility,environment]);}
interface Cached {payload:EvaluationPayload;id:string;timestamp:string;attempts:number}
function payloadFrom(r:EvaluationRecord):EvaluationPayload{return {scores:{F:r.function_score,A:r.accessibility_score,L:r.layout_score,C:r.consistency_proxy_score,Q:r.total_score},sources:r.score_sources,constraints:r.constraint_violations,eligible:r.eligible,raw:r.raw,formulas:r.formulas,error:r.error};}
export async function runExperiment(config:ExperimentConfig,evaluator:Evaluator,options:{control?:ExperimentControl;previous?:Experiment;id?:string;onUpdate?:(exp:Experiment)=>void|Promise<void>}={}):Promise<Experiment>{
 const errors=validateConfig(config);if(errors.length)throw new Error(errors.join('\n'));
 const control=options.control??new ExperimentControl(),previous=options.previous,started=performance.now(),priorElapsed=previous?.elapsed_ms??0,now=new Date().toISOString();
 if(previous&&JSON.stringify(previous.config)!==JSON.stringify(config))throw new Error('복원 시 설정을 변경할 수 없습니다. 새 실험으로 실행하세요.');
 if(previous&&previous.environment.search!==SEARCH_VERSION)throw new Error('검색 엔진 버전이 다릅니다. 이전 기록은 보존하고 새 실험을 시작하세요.');
 const experiment:Experiment={version:2,experiment_id:previous?.experiment_id??options.id??crypto.randomUUID(),name:previous?.name??`Experiment ${now.slice(0,16).replace('T',' ')}`,config:structuredClone(config),created_at:previous?.created_at??now,updated_at:now,status:'running',records:[],runs:[],elapsed_ms:priorElapsed,environment:{evaluator:evaluator.id,client:typeof navigator==='undefined'?'node':navigator.userAgent,app:'2.0.0',schema:'phase0-1.0.0',search:SEARCH_VERSION},warnings:['Q 가중치는 초기 연구 가설입니다.','자동 과제 시간은 사람의 사용성·과제 수행시간이 아닙니다.','CI는 탐색적 요약이며 알고리즘 우월성 검정이 아닙니다.']};
 const cache=new Map<string,Cached>();let halted=false;
 const update=async()=>{experiment.elapsed_ms=priorElapsed+performance.now()-started;experiment.updated_at=new Date().toISOString();await options.onUpdate?.(experiment);};
 for(const family of config.families){for(let rep=0;rep<config.repetitions;rep++){
  // Rotate a seeded, fixed algorithm order across repetitions (no performance-time adaptive scheduling).
  const offset=config.seeds[rep]%config.algorithms.length,order=[...config.algorithms.slice(offset),...config.algorithms.slice(0,offset)];
  for(const algorithm of order){
   const runId=`${family}/${algorithm}/${rep+1}`,runStart=performance.now();
   const run:RunResult={id:runId,algorithm,family,seed:config.seeds[rep],repetition:rep+1,curve:[],best:null,bestCandidateId:null,unique:0,cacheHits:0,successful:0,failed:0,ineligible:0,arms:[],status:'running',duration_ms:0};experiment.runs.push(run);
   const optimizer=new Optimizer(algorithm,defaults(family,run.seed),config,run.seed);
   for(let i=0;i<config.budget;i++){
    const old=previous?.records.find(r=>r.run_id===runId&&r.evaluation_index===i+1);
    if(!old&&(control.stopRequested||control.abort.signal.aborted)){halted=true;break;}
    const p=optimizer.propose(i),key=cacheKey(p.genome,config,evaluator.id),candidateId=`${experiment.experiment_id}/${runId}/${i+1}`;
    const tick=performance.now();let record:EvaluationRecord;
    if(old){
     if(genomeKey(old.genome_json)!==genomeKey(p.genome)||old.operator!==p.operator)throw new Error('복원 후보 순서가 일치하지 않습니다. 다른 엔진 버전 또는 손상된 기록입니다.');
     record=structuredClone(old);
    }else{
     const cached=config.cache?cache.get(key):undefined;let payload:EvaluationPayload,attempts=0;
     if(cached){payload=structuredClone(cached.payload);}else{
      const validation=validateGenomeLevel0(p.genome);
      if(validation.length)payload=failedEvaluation(p.genome,config,validation.join('; '));
      else{while(true){attempts++;try{payload=await evaluator.evaluate(p.genome,{candidateId,config,signal:control.abort.signal});break;}catch(e){if(control.abort.signal.aborted){halted=true;break;}if(attempts>config.retries){payload=failedEvaluation(p.genome,config,e instanceof Error?e.message:String(e));break;}}}}
      if(halted)break;
     }
     const q=payload!.scores,ts=new Date().toISOString(),measuredAt=payload!.raw.kind==='browser'?payload!.raw.browser.measuredAt:ts;
     record={experiment_id:experiment.experiment_id,algorithm,design_family:family,run_id:runId,seed:run.seed,candidate_id:candidateId,genome_hash:await genomeSHA(p.genome),genome_json:p.genome,active_variables:[...config.activeVariables],evaluation_level:config.level,evaluation_version:config.evaluationVersion,objective:config.objective,viewport:structuredClone(config.viewports),function_score:q.F,accessibility_score:q.A,layout_score:q.L,consistency_proxy_score:q.C,total_score:q.Q,score_sources:payload!.sources,constraint_violations:payload!.constraints,task_results:payload!.raw.kind==='browser'?payload!.raw.browser.views.flatMap(v=>v.tasks):[],evaluation_duration_ms:performance.now()-tick,cache_hit:!!cached,timestamp:ts,eligible:payload!.eligible,error:payload!.error,raw:payload!.raw,formulas:payload!.formulas,evaluation_index:i+1,best_so_far:null,operator:p.operator,reward:p.operator?normalizedReward(payload!.eligible?q.Q:null,p.parentScore):null,attempts:cached?0:attempts,measurement_id:cached?.id??candidateId,measurement_timestamp:cached?.timestamp??measuredAt};
    }
    if(config.cache&&!record.error&&!cache.has(key))cache.set(key,{payload:payloadFrom(record),id:record.measurement_id,timestamp:record.measurement_timestamp??record.timestamp,attempts:record.attempts});
    const fitness=record.eligible&&!record.error?record.total_score:null;optimizer.observe(p,fitness);
    if(fitness!==null&&(run.best===null||fitness>run.best)){run.best=fitness;run.bestCandidateId=record.candidate_id;}
    record.best_so_far=run.best;experiment.records.push(record);run.curve.push(run.best);run.unique=optimizer.seen.size;run.cacheHits+=Number(record.cache_hit);run.failed+=Number(!!record.error);run.successful+=Number(!record.error);run.ineligible+=Number(!record.eligible);run.arms=structuredClone(optimizer.arms);run.duration_ms=performance.now()-runStart;
    if(!old&&(config.level===2||i%8===0||i===config.budget-1)){await update();await new Promise<void>(r=>setTimeout(r,0));}
   }
   run.status=halted?(control.abort.signal.aborted?'cancelled':'stopped'):'completed';run.duration_ms=performance.now()-runStart;
   if(halted)break;
  }if(halted)break;
 }if(halted)break;}
 experiment.status=halted?(control.abort.signal.aborted?'cancelled':'stopped'):'completed';await update();return experiment;
}
export function experimentBest(exp:Experiment){return exp.records.filter(r=>r.eligible&&!r.error&&r.total_score!==null).sort((a,b)=>b.total_score!-a.total_score!)[0]??null;}

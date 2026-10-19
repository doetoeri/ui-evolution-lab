import {SCHEMA,type Family,type VarId} from '../schema';
import {EVALUATION_VERSION,VIEWPORTS,type ExperimentConfig} from './types';
export const PRIORITY:VarId[]=['A02','A07','A09','A12','B01','B02','B07','B09','C01','C02','C05','C06','D02','D03','E05','E08','E01','E02','E03','E11','F01','F02','F08','F09','G01','G02','G08','H01','H02','H03','I01','I05'];
export function activeVariables(count:number):VarId[]{return [...PRIORITY,...SCHEMA.map(d=>d.id).filter(id=>!PRIORITY.includes(id)&&id!=='A01'),'A01' as VarId].slice(0,count);}
export function seedList(seed:number,repetitions:number){return Array.from({length:repetitions},(_,i)=>(seed+i*100003)>>>0);}
export function defaultConfig(family:Family='apple-inspired'):ExperimentConfig{return {families:[family],algorithms:['random','ga','ucb'],activeCount:16,activeVariables:activeVariables(16),budget:100,repetitions:3,seed:12345,seeds:seedList(12345,3),population:12,mutationRate:.12,ucbC:1,level:1,objective:'static-proxy-v2',weights:{F:.4,L:.3,A:.2,C:.1},viewports:[VIEWPORTS[2]],enforceAccessibility:true,cache:true,retries:1,browserConcurrency:1,maxEvaluations:10000,evaluationVersion:EVALUATION_VERSION};}
export function validateConfig(c:ExperimentConfig):string[]{
 const e:string[]=[];const ints:[string,number,number,number][]=[['평가 예산',c.budget,1,c.level===2?30:2000],['반복',c.repetitions,1,20],['개체군',c.population,2,100],['시드',c.seed,0,0xffffffff],['전체 제한',c.maxEvaluations,1,20000]];
 for(const [n,x,min,max] of ints)if(!Number.isInteger(x)||x<min||x>max)e.push(`${n}: ${min}~${max} 정수`);
 if(![16,32,64,120].includes(c.activeCount)||c.activeVariables.length!==c.activeCount||new Set(c.activeVariables).size!==c.activeCount||c.activeVariables.some(id=>!SCHEMA.some(d=>d.id===id)))e.push('활성 변수 집합이 올바르지 않습니다.');
 if(!c.families.length||c.families.length>3||new Set(c.families).size!==c.families.length||c.families.some(f=>!['apple-inspired','material-inspired','experimental'].includes(f)))e.push('디자인 계열을 확인하세요.');
 if(!c.algorithms.length||c.algorithms.length>3||new Set(c.algorithms).size!==c.algorithms.length||c.algorithms.some(a=>!['random','ga','ucb'].includes(a)))e.push('알고리즘을 확인하세요.');
 if(![1,2].includes(c.level)||!['static-proxy-v2','browser-v2','synthetic-surrogate-v1'].includes(c.objective)||(c.level===2)!==(c.objective==='browser-v2'))e.push('평가 수준과 목적함수가 일치하지 않습니다.');
 if(c.evaluationVersion!==EVALUATION_VERSION)e.push('평가 함수 버전이 다릅니다.');
 if(!Number.isFinite(c.mutationRate)||c.mutationRate<0||c.mutationRate>1||!Number.isFinite(c.ucbC)||c.ucbC<0||c.ucbC>5)e.push('돌연변이 확률·UCB 계수를 확인하세요.');
 if(!c.viewports.length||c.viewports.length>3||new Set(c.viewports.map(v=>v.id)).size!==c.viewports.length||c.viewports.some(v=>!VIEWPORTS.some(b=>b.id===v.id&&b.width===v.width&&b.height===v.height)))e.push('지원하는 화면 크기를 선택하세요.');
 if(c.seeds.length!==c.repetitions||c.seeds.some(s=>!Number.isInteger(s)||s<0||s>0xffffffff))e.push('사전에 정한 시드 목록이 필요합니다.');
 if(!c.weights||Object.keys(c.weights).sort().join()!=='A,C,F,L'||Object.values(c.weights).some(w=>!Number.isFinite(w)||w<0)||Object.values(c.weights).reduce((a,b)=>a+b,0)<=0)e.push('가중치는 음수 없이 합계가 0보다 커야 합니다.');
 if(c.weights&&c.objective==='static-proxy-v2'&&c.weights.L+c.weights.A+c.weights.C<=0)e.push('Level 1은 미측정 F를 제외한 가중치 합이 0보다 커야 합니다.');
 if(![true,false].includes(c.enforceAccessibility)||![true,false].includes(c.cache)||![0,1].includes(c.retries)||![1,2].includes(c.browserConcurrency))e.push('제약·캐시·재시도·병렬 실행 옵션이 올바르지 않습니다.');
 if(c.budget*c.repetitions*c.algorithms.length*c.families.length>c.maxEvaluations)e.push('계획한 평가 수가 실험 전체 제한을 초과합니다.');
 if(c.level===2&&c.budget*c.repetitions*c.algorithms.length*c.families.length>270)e.push('Level 2는 실험당 최대 270회입니다. 먼저 소규모로 실행하세요.');
 return e;
}

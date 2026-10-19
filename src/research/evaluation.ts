import {constraints,inactiveReason,type Genome} from '../engine';
import {SCHEMA,BY_ID,type VarId} from '../schema';
import {tokenChecks} from '../tokens';
import type {BrowserRaw,EvaluationPayload,ExperimentConfig,Issue,RuleResult,ScoreSet,StaticRaw,Weights} from './types';
export const clamp=(n:number)=>Math.max(0,Math.min(100,n));
export function weighted(scores:ScoreSet,w:Weights):number|null {
 const parts=([['F',w.F],['L',w.L],['A',w.A],['C',w.C]] as const).filter(([k,v])=>scores[k]!==null&&v>0);
 const sum=parts.reduce((s,[,v])=>s+v,0);return sum?clamp(parts.reduce((s,[k,v])=>s+scores[k]!*v,0)/sum):null;
}
export function validateGenomeLevel0(g:Genome){return constraints(g);}
export function staticRaw(g:Genome,c:ExperimentConfig):StaticRaw {
 const v=g.variables,n=(id:VarId)=>Number(v[id]);
 const rule=(id:string,description:string,value:number,threshold:number,penalty:number):RuleResult=>({id,description,value,threshold,pass:value<=threshold,penalty:value<=threshold?0:penalty,source:'Proxy'});
 const spacing=[n('E02'),n('E03'),n('E04')].map(x=>Math.min(x%n('E01'),n('E01')-x%n('E01')));
 const rules=[rule('spacing-grid','컴포넌트·섹션 간격이 기본 간격 단위의 배수인지',spacing.filter(x=>x>.01).length,0,24),rule('type-leading','본문 행간이 1.4 이상인지',n('D06')<1.4?1:0,0,18),rule('heading-hierarchy','제목 크기가 본문 대비 1.5배 이상인지',n('D03')<1.5?1:0,0,20),rule('radius-coherence','버튼 형태와 카드 곡률의 극단적 불일치 여부',v.F02==='square'&&n('E08')>24?1:0,0,14),rule('density-space','조밀한 정보와 큰 간격의 조합 위험',v.A07==='compact'&&n('E04')>48?1:0,0,12),rule('motion-duration','기본 모션 400ms 초과 여부',n('H01'),400,12)];
 const layoutRisk=[rule('column-risk','데스크톱 카드 추정 폭이 210px보다 작은지',n('A03')/n('G08')-n('E03')<210&&v.G01!=='list'?1:0,0,30),rule('text-risk','큰 본문과 높은 상품 정보량 조합',n('D02')>=18&&v.G09==='full'?1:0,0,15),rule('page-padding','좁은 화면에서 큰 좌우 여백 위험',c.viewports.some(s=>s.width<500)&&n('A04')>24?1:0,0,30),rule('height-risk','입력 높이 대비 큰 본문 위험',n('D02')*n('D06')+12>n('E06')?1:0,0,25)];
 return {kind:'static',rules,layoutRisk,contrast:tokenChecks(g),inactiveVariables:c.activeVariables.map(id=>({id,reason:inactiveReason(BY_ID[id],g,'shop',c.viewports[0].width)})).filter((r):r is {id:VarId;reason:string}=>!!r.reason),missingMeasurements:['기능 과제 수행','실제 DOM 레이아웃','axe-core','키보드·모달','사람의 사용 편의성·미적 만족도']};
}
export function proxyEvaluation(g:Genome,c:ExperimentConfig):EvaluationPayload {
 const raw=staticRaw(g,c),C=clamp(100-raw.rules.reduce((s,r)=>s+r.penalty,0)),L=clamp(100-raw.layoutRisk.reduce((s,r)=>s+r.penalty,0)),A=100*raw.contrast.filter(r=>r.pass).length/raw.contrast.length;
 const scores:ScoreSet={F:null,L,A,C,Q:null};scores.Q=weighted(scores,c.weights);
 const issues:Issue[]=raw.contrast.filter(r=>!r.pass).map(r=>({id:'token-contrast',message:`토큰 대비 대리지표: ${r.name} ${r.ratio.toFixed(2)} < ${r.threshold}`,severity:'serious',source:'Proxy',selector:':tokens',mandatory:c.enforceAccessibility}));
 return {scores,sources:{F:null,A:'Proxy',L:'Proxy',C:'Proxy',Q:'Proxy'},constraints:issues,eligible:!issues.some(i=>i.mandatory),raw,formulas:{F:'미측정: null',A:'100 × 통과 토큰 대비 쌍 / 검사한 토큰 쌍 (DOM 아님)',L:'max(0, 100 − 레이아웃 위험 규칙 벌점 합)',C:'max(0, 100 − 토큰·간격·위계 규칙 벌점 합)',Q:'Level 1 Proxy: (wL×Lrisk + wA×Atoken + wC×C) / (wL+wA+wC); F 미측정으로 분모에서 제외'},error:null};
}
/** Exact Phase 1 rugged synthetic function, retained solely as an algorithm benchmark. */
export function syntheticScore(g:Genome,keys:VarId[]):number {
 let value=0,penalty=0;const vals:number[]=[];
 for(let i=0;i<keys.length;i++){const d=BY_ID[keys[i]],index=d.options.findIndex(o=>o.value===g.variables[keys[i]]);if(index<0){penalty+=20;vals.push(0);continue;}const x=d.options.length<=1?0:index/(d.options.length-1);vals.push(x);value+=1-Math.abs(x-((i*17+7)%13)/12);}
 for(let i=1;i<vals.length;i++)value+=.4*(1-Math.abs(vals[i]-vals[i-1]));
 for(let i=0;i<vals.length-3;i+=3)value+=.45*Math.cos((vals[i]*3+vals[i+3]*5)*Math.PI);
 return clamp(100*(value/(keys.length*1.55))-penalty);
}
export function syntheticEvaluation(g:Genome,c:ExperimentConfig):EvaluationPayload{return {scores:{F:null,A:null,L:null,C:null,Q:syntheticScore(g,c.activeVariables)},sources:{F:null,A:null,L:null,C:null,Q:'Synthetic'},constraints:[],eligible:true,raw:{kind:'synthetic',objective:'synthetic-surrogate-v1',formula:'Phase 1 index-distance + adjacent interaction + cosine epistasis; UI 품질 측정 아님',activeVariables:c.activeVariables},formulas:{Q:'100 × (Σ(1−|xi−ideali|)+0.4Σ(1−|xi−xi−1|)+0.45Σcos(π(3xi+5xi+3))) / (1.55×k)'},error:null};}
const penalty={minor:1,moderate:4,serious:12,critical:25};
export function browserEvaluation(g:Genome,c:ExperimentConfig,browser:BrowserRaw):EvaluationPayload {
 const proxy=proxyEvaluation(g,c),views=browser.views;
 if(views.length!==c.viewports.length||views.some(v=>!c.viewports.some(p=>p.id===v.viewport.id&&p.width===v.viewport.width&&p.height===v.viewport.height)))throw new Error('브라우저 측정 화면 크기가 요청과 다릅니다.');
 const tasks=views.flatMap(v=>v.tasks),F=100*tasks.filter(t=>t.success).length/Math.max(1,tasks.length);
 const aScores=views.map(v=>clamp(100-v.axe.violations.reduce((s,r)=>s+penalty[r.impact??'moderate']*r.nodes.length,0)-v.keyboard.filter(k=>!k.pass).length*20-v.touchTargets.length*2-(v.reducedMotion.pass?0:10)));
 const lScores=views.map(v=>clamp(100-v.layout.issues.reduce((s,r)=>s+penalty[r.severity],0)));
 const scores:ScoreSet={F,A:Math.min(...aScores),L:Math.min(...lScores),C:proxy.scores.C,Q:null};scores.Q=weighted(scores,c.weights);
 const constraints:Issue[]=[];
 for(const v of views){
  for(const t of v.tasks)if(!t.success)constraints.push({id:t.task_id,message:`${v.viewport.id}: ${t.error??'과제 실패'}`,severity:'critical',selector:':task',source:'Measured',mandatory:true,screenshot:t.screenshot??v.screenshot});
  for(const r of v.axe.violations)for(const n of r.nodes)constraints.push({id:r.id,message:`${v.viewport.id}: ${r.help}`,severity:r.impact??'moderate',selector:n.target.join(' '),rect:n.rect,source:'Measured',mandatory:c.enforceAccessibility&&['serious','critical'].includes(r.impact??''),screenshot:v.screenshot});
  for(const k of v.keyboard)if(!k.pass)constraints.push({id:k.id,message:`${v.viewport.id}: ${k.details}`,severity:'serious',selector:':keyboard',source:'Measured',mandatory:c.enforceAccessibility,screenshot:v.screenshot});
  for(const t of v.touchTargets)constraints.push({...t,mandatory:c.enforceAccessibility,screenshot:v.screenshot});
  if(!v.reducedMotion.pass)constraints.push({id:'reduced-motion',message:`${v.viewport.id}: reduced-motion 상태에서 ${v.reducedMotion.maxDurationMs}ms 모션`,severity:'serious',selector:':motion',source:'Measured',mandatory:c.enforceAccessibility,screenshot:v.screenshot});
 }
 if(browser.pageErrors.length)constraints.push({id:'runtime-error',message:browser.pageErrors.join('; '),severity:'critical',selector:':page',source:'Measured',mandatory:true});
 return {scores,sources:{F:'Measured',A:'Measured',L:'Measured',C:'Proxy',Q:'Measured'},constraints,eligible:!constraints.some(i=>i.mandatory),raw:{kind:'browser',browser,consistency:proxy.raw as StaticRaw},formulas:{F:'100 × 성공 과제 수 / 전체 과제 수; 화면별 동일 4과제',A:'min_viewport max(0,100−Σ(위반 노드×심각도 벌점)−20×키보드 실패−2×24px 미만 목표−10×Reduced Motion 실패)',L:'min_viewport max(0,100−Σ 레이아웃 위반 벌점)',C:proxy.formulas.C,Q:'(wF×F + wL×L + wA×A + wC×C) / Σw; 초기 .40/.30/.20/.10은 연구 가설',penalties:'minor=1, moderate=4, serious=12, critical=25; 필수 기능·접근성 실패는 Q와 별도로 제외'},error:null};
}
export function failedEvaluation(g:Genome,c:ExperimentConfig,error:string):EvaluationPayload {return {scores:{F:null,A:null,L:null,C:null,Q:null},sources:{F:null,A:null,L:null,C:null,Q:null},constraints:[{id:'evaluation-error',message:error,severity:'critical',mandatory:true,source:c.level===2?'Measured':'Proxy',selector:':runner'}],eligible:false,raw:staticRaw(g,c),formulas:{Q:'평가 실패: 점수 없음; 0점으로 대체하지 않음'},error};}

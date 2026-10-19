import {startResearchServer} from './research-server';
import {defaultConfig} from '../src/research/config';
import {browserEvaluation} from '../src/research/evaluation';
import {runExperiment} from '../src/research/experiment';
import {recordsCSV} from '../src/research/data';
import {summaryDocument} from '../src/research/statistics';
import {mkdirSync,writeFileSync,cpSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import assert from 'node:assert/strict';
import type {VarId} from '../src/schema';
import type {Evaluator} from '../src/research/types';
const root=mkdtempSync(join(tmpdir(),'uel-measured-optimization-'));cpSync(resolve('dist'),root,{recursive:true});const app=await startResearchServer({port:0,root,evidenceDir:'docs/phase2/evidence'});let passed=false,actual=0;
try{
 const config={...defaultConfig(),level:2 as const,objective:'browser-v2' as const,budget:4,repetitions:1,seeds:[12345],population:2,mutationRate:.25,activeVariables:[...Array.from({length:12},(_,i)=>`C${String(i+1).padStart(2,'0')}`),'D03','E08','F01','H01'] as VarId[]};
 const evaluator:Evaluator={id:'playwright-small-actual-v2',async evaluate(g,ctx){actual++;const raw=await app.runner.evaluate(g,ctx.config,ctx.candidateId,ctx.signal);return browserEvaluation(g,ctx.config,raw);}};
 const e=await runExperiment(config,evaluator,{id:'measured-small-optimization-phase2',onUpdate:e=>{console.log(`Measured optimization: ${e.records.length}/12 requested, ${actual} physical evaluations`);}});
 e.example='실제 Playwright 소규모 연결 검증: 3알고리즘 × 4요청 × 1반복 × 데스크톱. 16개 색상·형태·모션 변수, 개체군 2. 검정력·우월성 분석용 데이터가 아닙니다.';
 assert.equal(e.records.length,12);assert.ok(e.records.every(r=>r.raw.kind==='browser'||r.error!==null));assert.ok(e.runs.find(r=>r.algorithm==='ucb')!.arms.some(a=>a.n>0));assert.ok(e.records.some(r=>r.cache_hit));assert.equal(e.status,'completed');
 mkdirSync('examples',{recursive:true});writeFileSync('examples/measured-optimization.json',JSON.stringify(e,null,2));writeFileSync('examples/measured-optimization.csv',recordsCSV(e.records));writeFileSync('examples/measured-optimization-summary.json',JSON.stringify(summaryDocument(e),null,2));
 passed=true;console.log(`Measured optimization integration passed: 12 requests, ${actual} actual, ${e.records.filter(r=>r.error).length} infrastructure failures, ${e.records.filter(r=>!r.eligible).length} ineligible (retained)`);
}finally{mkdirSync('docs/phase2',{recursive:true});writeFileSync('docs/phase2/optimization-integration.json',JSON.stringify({passed,actualEvaluations:actual,at:new Date().toISOString()},null,2));await app.close();rmSync(root,{recursive:true,force:true});}

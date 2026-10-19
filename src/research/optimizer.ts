import {change,defaults,genomeKey,seededRandom,type Genome} from '../engine';
import {BY_ID,type VarId} from '../schema';
import type {Algorithm,Arm,ExperimentConfig} from './types';
export const OPERATOR_GROUPS=[
 {id:'color',label:'색상',groups:'C'},
 {id:'layout',label:'레이아웃',groups:'ABGJ'},
 {id:'typography',label:'타이포그래피',groups:'D'},
 {id:'components',label:'버튼·컴포넌트',groups:'F'},
 {id:'spacing',label:'간격·크기·재질',groups:'EI'},
 {id:'motion',label:'모션',groups:'H'},
] as const;
export function mutationPool(ids:VarId[],operator:string|null):VarId[]{const groups=OPERATOR_GROUPS.find(a=>a.id===operator)?.groups;return ids.filter(id=>id!=='A01'&&(!groups||groups.includes(id[0])));}
export function chooseArm(arms:Arm[],c:number):number {
 const unseen=arms.findIndex(a=>a.n===0);if(unseen>=0)return unseen;
 const t=arms.reduce((s,a)=>s+a.n,0);let best=0,value=-Infinity;
 arms.forEach((a,i)=>{const score=a.rewardSum/a.n+c*Math.sqrt(Math.log(Math.max(1,t))/a.n);if(score>value){value=score;best=i;}});return best;
}
export function normalizedReward(child:number|null,parent:number|null){return child===null?0:Math.max(0,Math.min(1,(child-(parent??0))/100));}
export function crossover(a:Genome,b:Genome,ids:VarId[],r:()=>number):Genome {let g={...a,variables:{...a.variables}};for(const id of ids){if(id==='A01')continue;if(r()<.5)g=change(g,id,b.variables[id]);}return g;}
export function mutation(g:Genome,ids:VarId[],r:()=>number,rate:number,operator:string|null):Genome {
 const pool=mutationPool(ids,operator);if(!pool.length)return g;let out=g,touched=false;
 const alter=(id:VarId)=>{const options=BY_ID[id].options.filter(o=>o.value!==out.variables[id]);out=change(out,id,options[Math.floor(r()*options.length)].value);touched=true;};
 for(const id of pool)if(r()<rate)alter(id);
 if(!touched)alter(pool[Math.floor(r()*pool.length)]);return out;
}
export interface Proposal {genome:Genome;operator:string|null;parentScore:number|null}
interface Member {genome:Genome;score:number|null;order:number}
export class Optimizer {
 readonly arms:Arm[];readonly seen=new Set<string>();private population:Member[]=[];private random:()=>number;private order=0;
 constructor(readonly algorithm:Algorithm,readonly baseline:Genome,readonly config:ExperimentConfig,seed:number){
  this.random=seededRandom(seed);this.arms=OPERATOR_GROUPS.filter(o=>mutationPool(config.activeVariables,o.id).length).map(o=>({id:o.id,label:o.label,n:0,rewardSum:0}));
 }
 private randomGenome():Genome {let g={...this.baseline,variables:{...this.baseline.variables}};for(const id of this.config.activeVariables){if(id==='A01')continue;const opts=BY_ID[id].options;g=change(g,id,opts[Math.floor(this.random()*opts.length)].value);}return g;}
 propose(index:number):Proposal {
  if(index===0)return {genome:{...this.baseline,variables:{...this.baseline.variables}},operator:null,parentScore:null};
  if(this.algorithm==='random'||index<this.config.population||!this.population.length)return {genome:this.randomGenome(),operator:null,parentScore:null};
  const rank=(m:Member)=>m.score??-Infinity;
  const tournament=()=>{const a=this.population[Math.floor(this.random()*this.population.length)],b=this.population[Math.floor(this.random()*this.population.length)];return rank(a)>=rank(b)?a:b;};
  const a=tournament(),b=tournament();const operator=this.algorithm==='ucb'&&this.arms.length?this.arms[chooseArm(this.arms,this.config.ucbC)].id:null;
  const cross=crossover(a.genome,b.genome,this.config.activeVariables,this.random);
  return {genome:mutation(cross,this.config.activeVariables,this.random,this.config.mutationRate,operator),operator,parentScore:a.score};
 }
 observe(p:Proposal,score:number|null){
  const arm=this.arms.find(a=>a.id===p.operator);if(arm){arm.n++;arm.rewardSum+=normalizedReward(score,p.parentScore);}
  const key=genomeKey(p.genome);this.seen.add(key);this.order++;
  // Ineligible/failed candidates are observations, never parents or elites.
  if(score===null)return;
  // Steady-state (μ+1) elitism: keep unique best μ; ties retain earlier candidate.
  const previous=this.population.find(x=>genomeKey(x.genome)===key);
  if(previous){if((score??-Infinity)>(previous.score??-Infinity))previous.score=score;return;}
  this.population.push({genome:p.genome,score,order:this.order});
  this.population.sort((a,b)=>(b.score??-Infinity)-(a.score??-Infinity)||a.order-b.order);this.population.length=Math.min(this.population.length,this.config.population);
 }
}

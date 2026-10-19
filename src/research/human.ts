import {seededRandom,type Genome} from '../engine';
export const HUMAN_TASKS=[{id:'search',description:'아크 데스크 램프를 검색하고 상세 정보를 여세요.'},{id:'filter',description:'10만원 이하인 그린 색상 상품을 찾으세요.'},{id:'cart',description:'아크 데스크 램프를 담고 장바구니 수량을 2개로 바꾸세요.'},{id:'sort',description:'전체 상품을 가격이 낮은 순서로 정렬하세요.'}] as const;
export interface HumanCandidate {id:string;name:string;genome:Genome}
export interface HumanResponse {candidate_id:string;task_id:string;success:boolean;duration_ms:number;satisfaction:number;comment:string;timestamp:string;source:'Human-rated'}
export interface HumanSession {id:string;version:1;consent:true;consent_at:string;order_seed:number;candidate_order:HumanCandidate[];responses:HumanResponse[];created_at:string;viewport:{width:number;height:number};instructions:string}
export function randomOrder<T>(items:T[],seed:number):T[]{const out=[...items],r=seededRandom(seed);for(let i=out.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
export function validateHumanResponse(r:HumanResponse){return typeof r.candidate_id==='string'&&typeof r.task_id==='string'&&typeof r.success==='boolean'&&Number.isFinite(r.duration_ms)&&r.duration_ms>=0&&Number.isInteger(r.satisfaction)&&r.satisfaction>=1&&r.satisfaction<=7&&typeof r.comment==='string'&&r.comment.length<=2000&&r.source==='Human-rated';}

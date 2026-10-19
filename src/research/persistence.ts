import type {Experiment} from './types';
export interface SavedItem {id:string;name:string;updated_at:string;status:string;records:number;level:number;objective:string}
const DB='ui-evolution-research-v2';
function open(){return new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{r.result.createObjectStore('experiments',{keyPath:'experiment_id'});r.result.createObjectStore('human',{keyPath:'id'});};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function action<T>(store:string,mode:IDBTransactionMode,fn:(s:IDBObjectStore)=>IDBRequest<T>):Promise<T>{const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction(store,mode),r=fn(tx.objectStore(store));let result:T;r.onsuccess=()=>{result=r.result;};tx.oncomplete=()=>{db.close();resolve(result);};tx.onerror=()=>{db.close();reject(tx.error);};tx.onabort=()=>{db.close();reject(tx.error??new Error('저장 중단'));};});}
export async function saveExperiment(e:Experiment){await action('experiments','readwrite',s=>s.put(e));}
export async function listExperiments():Promise<SavedItem[]>{const data=await action<Experiment[]>('experiments','readonly',s=>s.getAll());return data.map(e=>({id:e.experiment_id,name:e.name,updated_at:e.updated_at,status:e.status,records:e.records.length,level:e.config.level,objective:e.config.objective})).sort((a,b)=>b.updated_at.localeCompare(a.updated_at));}
export function loadExperiment(id:string){return action<Experiment|undefined>('experiments','readonly',s=>s.get(id));}
export function removeExperiment(id:string){return action('experiments','readwrite',s=>s.delete(id));}
export const saveHuman=(data:unknown)=>action('human','readwrite',s=>s.put(data));
export const loadHumans=()=>action<any[]>('human','readonly',s=>s.getAll());
export const removeHuman=(id:string)=>action('human','readwrite',s=>s.delete(id));

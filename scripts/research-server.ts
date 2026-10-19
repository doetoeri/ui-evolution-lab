import {createServer,type IncomingMessage} from 'node:http';
import {readFile,stat,mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import {randomBytes,createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {BrowserEvaluator} from './browser-evaluator';
import {parseGenome} from '../src/engine';
import {validateConfig} from '../src/research/config';
import {EVALUATION_VERSION} from '../src/research/types';
export async function startResearchServer(options:{port?:number;root?:string;evidenceDir?:string}={}){
 const root=resolve(options.root??'dist'),evidence=resolve(options.evidenceDir??'research-data/evidence');if(!existsSync(root+'/index.html'))throw new Error('먼저 npm run build 를 실행하세요.');await mkdir(evidence,{recursive:true});
 const appHash=createHash('sha256').update(await readFile(root+'/index.html')).digest('hex').slice(0,16),token=randomBytes(24).toString('hex');let runner:BrowserEvaluator,active=0;
 const origins=new Set(['null','http://localhost:4173','http://127.0.0.1:4173','http://localhost:4318','http://127.0.0.1:4318','https://ui-evolution-genome-lab.doeraji.chatgpt.site']);
 const mime:Record<string,string>={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2','.json':'application/json','.png':'image/png'};
 const server=createServer(async(req,res)=>{
  const origin=req.headers.origin;if(origin&&!origins.has(origin)){res.writeHead(403).end('허용되지 않은 Origin');return;}
  const headers:Record<string,string>={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
  if(origin){headers['Access-Control-Allow-Origin']=origin;headers['Vary']='Origin';}headers['Access-Control-Allow-Methods']='GET,POST,OPTIONS';headers['Access-Control-Allow-Headers']='Content-Type,X-Lab-Token';headers['Access-Control-Allow-Private-Network']='true';
  const json=(status:number,data:unknown)=>{res.writeHead(status,{...headers,'Content-Type':'application/json'}).end(JSON.stringify(data));};
  if(req.method==='OPTIONS'){res.writeHead(204,headers).end();return;}
  const url=new URL(req.url??'/','http://127.0.0.1');
  try{
   if(url.pathname==='/api/status'){
    try{const b=await runner.browser();json(200,{ready:true,version:EVALUATION_VERSION,appVersion:appHash,browser:b.version(),token,parallelLimit:2,active,environmentId:`${appHash}/${b.version()}/${process.platform}/${process.version}`});}catch(e){json(503,{ready:false,error:String(e),install:'npx playwright install chromium'});}return;
   }
   if(url.pathname==='/api/evaluate'&&req.method==='POST'){
    if(req.headers['x-lab-token']!==token){json(403,{error:'실행기 연결을 다시 확인하세요.'});return;}
    if(active>=2){json(429,{error:'브라우저 평가 실행 제한 (2개)'});return;}
    const chunks:Buffer[]=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>150000){json(413,{error:'요청 크기 제한 150KB'});return;}chunks.push(chunk);}
    const body=JSON.parse(Buffer.concat(chunks).toString('utf8')),genome=parseGenome(JSON.stringify(body.genome));const errors=validateConfig(body.config);if(errors.length||body.config.level!==2){json(400,{error:errors.join('; ')||'Level 2 요청만 허용합니다.'});return;}
    if(typeof body.candidateId!=='string'||body.candidateId.length>300){json(400,{error:'후보 ID 형식 오류'});return;}
    active++;const controller=new AbortController(),onClose=()=>{if(!res.writableEnded)controller.abort();};res.on('close',onClose);
    try{const data=await runner.evaluate(genome,body.config,body.candidateId,controller.signal);json(200,{data});}catch(e){if(!res.destroyed)json(500,{error:e instanceof Error?e.message:String(e)});}finally{active--;res.off('close',onClose);}return;
   }
   let path:string;
   if(url.pathname.startsWith('/api/evidence/')){const name=url.pathname.slice('/api/evidence/'.length);if(!/^[a-f0-9]{24}-(mobile|tablet|desktop)-(baseline|task-[1-4]-[a-z]+)\.png$/.test(name)){json(404,{error:'증거 파일 없음'});return;}path=resolve(evidence,name);if(!existsSync(path))path=resolve('docs/phase2/evidence',name);}
   else {path=resolve(root,'.'+decodeURIComponent(url.pathname));if(!path.startsWith(root+sep)&&path!==root){res.writeHead(403).end();return;}const info=await stat(path).catch(()=>null);if(!info||info.isDirectory())path=resolve(root,'index.html');}
   const data=await readFile(path);res.writeHead(200,{...headers,'Content-Type':mime[extname(path)]??'application/octet-stream'}).end(data);
  }catch(e){json(500,{error:e instanceof Error?e.message:String(e)});}
 });
 await new Promise<void>(r=>server.listen(options.port??4318,'127.0.0.1',r));const address=server.address();if(!address||typeof address==='string')throw new Error('실행기 주소 생성 실패');const baseURL=`http://127.0.0.1:${address.port}`;origins.add(baseURL);runner=new BrowserEvaluator(baseURL,evidence,appHash);
 return {server,runner,baseURL,token,async close(){await runner.close();await new Promise<void>(r=>server.close(()=>r()));}};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){const app=await startResearchServer();console.log(`UI Evolution Lab Phase 2: ${app.baseURL}\nPlaywright + axe-core · 로컬 전용 · API 키 불필요\n스크린샷: research-data/evidence (직접 내보낸 JSON의 후보 ID와 연결)`);for(const signal of ['SIGINT','SIGTERM'] as const)process.on(signal,()=>{void app.close().then(()=>process.exit(0));});}

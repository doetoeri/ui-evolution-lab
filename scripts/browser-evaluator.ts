import {chromium,type Browser,type BrowserContext,type Page,type Locator} from '@playwright/test';
import axe from 'axe-core';
import {existsSync,mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {platform} from 'node:os';
import {scanLayout,measureTouchTargets} from '../src/research/layout';
import {PRODUCTS,productColor} from '../src/data';
import {EVALUATION_VERSION,type BrowserRaw,type BrowserViewResult,type TaskResult,type KeyboardCheck,type ExperimentConfig,type Viewport,type AxeRule} from '../src/research/types';
import type {Genome} from '../src/engine';

const launchArgs=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--disable-gpu-sandbox'];
export class BrowserEvaluator {
 private browserPromise:Promise<Browser>|null=null;
 private availableContexts=2;private waiters:{resolve:()=>void;reject:(e:Error)=>void;signal?:AbortSignal;cancel:()=>void}[]=[];
 private async acquire(signal?:AbortSignal){if(signal?.aborted)throw new Error('취소됨');if(this.availableContexts>0){this.availableContexts--;return;}await new Promise<void>((resolve,reject)=>{const waiter={resolve,reject,signal,cancel:()=>{this.waiters=this.waiters.filter(x=>x!==waiter);reject(new Error('취소됨'));}};this.waiters.push(waiter);signal?.addEventListener('abort',waiter.cancel,{once:true});});}
 private release(){const next=this.waiters.shift();if(next){next.signal?.removeEventListener('abort',next.cancel);next.resolve();}else this.availableContexts++;}
 constructor(readonly baseURL:string,readonly evidenceDir:string,readonly appVersion='phase2-app-1.0.0') {mkdirSync(evidenceDir,{recursive:true});}
 async browser(){if(!this.browserPromise){const local=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH??(existsSync('.qa-browser/chromium')?resolve('.qa-browser/chromium'):undefined);this.browserPromise=chromium.launch({executablePath:local,args:local?launchArgs:[],headless:true}).catch(e=>{this.browserPromise=null;throw new Error(`Chromium 실행 실패. npx playwright install chromium 을 실행하세요. ${String(e).slice(0,300)}`);});}return this.browserPromise;}
 async close(){if(this.browserPromise){const b=await this.browserPromise.catch(()=>null);await b?.close();this.browserPromise=null;}}
 async evaluate(genome:Genome,config:ExperimentConfig,candidateId:string,signal?:AbortSignal,fixture?:string):Promise<BrowserRaw>{
  const browser=await this.browser(),pageErrors:string[]=[],views:BrowserViewResult[]=[];let userAgent='';
  for(let start=0;start<config.viewports.length;start+=config.browserConcurrency){
   const chunk=await Promise.all(config.viewports.slice(start,start+config.browserConcurrency).map(async viewport=>{
    if(signal?.aborted)throw new Error('취소됨');await this.acquire(signal);let context:BrowserContext|undefined;const cancel=()=>{void context?.close();};
    try{context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},deviceScaleFactor:1,colorScheme:'light',reducedMotion:'no-preference',locale:'ko-KR'});signal?.addEventListener('abort',cancel,{once:true});await context.addInitScript('window.__name = (fn) => fn;');const page=await context.newPage();page.setDefaultTimeout(5000);page.on('pageerror',e=>pageErrors.push(e.message));
     await page.addInitScript(({g,h,fixture})=>{(window as any).__UEL_EVALUATION__={genome:g,viewportHeight:h,fixture};},{g:genome,h:viewport.height,fixture});
     const result=await this.evaluateView(page,viewport,candidateId);userAgent=await page.evaluate(()=>navigator.userAgent);return result;
    }finally{signal?.removeEventListener('abort',cancel);await context?.close();this.release();}
   }));views.push(...chunk);
  }
  return {kind:'playwright',environment:{browser:browser.version(),platform:platform(),userAgent,deviceScaleFactor:1,appVersion:this.appVersion,runnerVersion:EVALUATION_VERSION,node:process.version},views,pageErrors,measuredAt:new Date().toISOString(),attempts:1};
 }
 private async open(page:Page){await page.goto(this.baseURL+'/?evaluation=1',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__UEL_EVALUATION_READY__===true);await page.evaluate(()=>document.fonts.ready);}
 private async shot(page:Page,id:string,viewport:string,suffix:string){const name=createHash('sha256').update(id).digest('hex').slice(0,24)+`-${viewport}-${suffix}.png`;await page.screenshot({path:join(this.evidenceDir,name),fullPage:true,animations:'disabled'});return `/api/evidence/${name}`;}
 private async filters(page:Page){
  const max=page.getByRole('spinbutton',{name:'최대 가격',exact:true});if(await max.isVisible().catch(()=>false))return;
  const trigger=page.getByRole('button',{name:/^(필터|필터 열기)$/}).filter({visible:true}).first();if(await trigger.count()){await trigger.click();await max.filter({visible:true}).first().waitFor({state:'visible'});}
 }
 private async closeFilters(page:Page){if(await page.getByRole('dialog',{name:'상품 필터',exact:true}).isVisible().catch(()=>false)){await page.keyboard.press('Escape');}}
 private async task(page:Page,id:string,candidateId:string,viewport:Viewport,work:(step:(s:string,f:()=>Promise<unknown>)=>Promise<void>)=>Promise<void>):Promise<TaskResult>{
  const start=performance.now(),assertions:string[]=[];let steps=0;
  try{await this.open(page);await work(async(s,f)=>{steps++;await f();assertions.push(s);});return {task_id:id,success:true,steps,duration_ms:performance.now()-start,error:null,assertions,source:'Measured'};}
  catch(e){return {task_id:id,success:false,steps,duration_ms:performance.now()-start,error:e instanceof Error?e.message:String(e),assertions,source:'Measured',screenshot:await this.shot(page,candidateId,viewport.id,id).catch(()=>undefined)};}
 }
 private async evaluateView(page:Page,viewport:Viewport,candidateId:string):Promise<BrowserViewResult>{
  const start=performance.now();await this.open(page);const layout=await page.evaluate(scanLayout),touchTargets=await page.evaluate(measureTouchTargets);
  await page.addScriptTag({content:axe.source});const rawAxe=await page.evaluate(async()=>{const result=await (window as any).axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});for(const rule of [...result.violations,...result.incomplete])for(const node of rule.nodes){try{const el=document.querySelector(node.target[0]),r=el?.getBoundingClientRect();if(r)node.rect={x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height};}catch{}}return result;});
  const convert=(rs:any[]):AxeRule[]=>rs.map(r=>({id:r.id,impact:r.impact,help:r.help,helpUrl:r.helpUrl,nodes:r.nodes.map((n:any)=>({target:n.target,html:n.html,failureSummary:n.failureSummary,rect:n.rect}))}));
  const screenshot=await this.shot(page,candidateId,viewport.id,'baseline');layout.issues.forEach(i=>i.screenshot=screenshot);
  const tasks:TaskResult[]=[];
  tasks.push(await this.task(page,'task-1-search',candidateId,viewport,async step=>{
   await this.filtersIfSearchHidden(page);await step('지정 상품 이름 검색',()=>page.getByRole('textbox',{name:'상품 검색',exact:true}).filter({visible:true}).first().fill('아크 데스크 램프'));await this.closeFilters(page);
   await step('지정 상품 1개와 상세 버튼 확인',async()=>{const items=page.getByRole('list',{name:'상품 목록'}).getByRole('listitem');if(await items.count()!==1)throw new Error('검색 결과가 1개가 아닙니다.');await page.getByRole('button',{name:'아크 데스크 램프 상세 보기',exact:true}).click();if(!await page.getByRole('dialog',{name:'아크 데스크 램프',exact:true}).isVisible())throw new Error('상세 창을 열 수 없습니다.');});
  }));
  tasks.push(await this.task(page,'task-2-filter',candidateId,viewport,async step=>{
   await step('필터 접근',()=>this.filters(page));await step('100,000원 이하',()=>page.getByRole('spinbutton',{name:'최대 가격',exact:true}).filter({visible:true}).first().fill('100000'));await step('그린 색상 선택',()=>page.getByRole('combobox',{name:'상품 색상',exact:true}).filter({visible:true}).first().selectOption('그린'));await this.closeFilters(page);
   await step('조건을 만족하는 모든 상품과 일치',async()=>{const names=await page.getByRole('list',{name:'상품 목록'}).getByRole('heading',{level:3}).allTextContents();const expected=PRODUCTS.filter(p=>p.price<=100000&&productColor(p)==='그린').map(p=>p.name);if(names.length!==expected.length||names.some(n=>!expected.includes(n)))throw new Error(`필터 결과 불일치: ${names.join(', ')}`);});
  }));
  tasks.push(await this.task(page,'task-3-cart',candidateId,viewport,async step=>{
   await step('지정 상품 담기',()=>page.getByRole('button',{name:'아크 데스크 램프 장바구니 담기',exact:true}).click());await step('장바구니 열기',()=>page.getByRole('button',{name:'장바구니 1개',exact:true}).click());
   const dialog=page.getByRole('dialog',{name:'장바구니',exact:true});await step('수량 2개로 변경',()=>dialog.getByRole('button',{name:'아크 데스크 램프 수량 늘리기',exact:true}).click());await step('수량·합계 확인',async()=>{if((await dialog.getByRole('status',{name:'아크 데스크 램프 수량',exact:true}).textContent())!=='2'||!(await dialog.textContent())?.includes('178,000'))throw new Error('수량 또는 합계가 올바르지 않습니다.');});
  }));
  tasks.push(await this.task(page,'task-4-sort',candidateId,viewport,async step=>{
   const sort=page.getByRole('combobox',{name:'상품 정렬',exact:true});if(!await sort.filter({visible:true}).first().isVisible().catch(()=>false))await this.filters(page);
   await step('가격 오름차순 선택',()=>sort.filter({visible:true}).first().selectOption('price-low'));await this.closeFilters(page);await step('모든 상품 가격 순서 검증',async()=>{const names=await page.getByRole('list',{name:'상품 목록'}).getByRole('heading',{level:3}).allTextContents();const expected=[...PRODUCTS].sort((a,b)=>a.price-b.price).map(p=>p.name);if(names.join('|')!==expected.join('|'))throw new Error(`정렬 불일치: ${names.join(', ')}`);});
  }));
  const keyboard=await this.keyboard(page);
  await page.emulateMedia({reducedMotion:'reduce'});await this.open(page);const reducedMotion=await page.evaluate(()=>{const els=[...document.querySelectorAll('[data-evaluation-root] *, .genome-overlay *')];let max=0;const ms=(s:string)=>s.split(',').map(v=>v.trim().endsWith('ms')?parseFloat(v):parseFloat(v)*1000);for(const el of els){const style=getComputedStyle(el);max=Math.max(max,...ms(style.transitionDuration),...ms(style.animationDuration));}return {pass:max<=1,maxDurationMs:max,sampled:els.length,source:'Measured' as const};});
  return {viewport,layout,axe:{violations:convert(rawAxe.violations),incomplete:convert(rawAxe.incomplete),passes:rawAxe.passes.length,version:axe.version},tasks,keyboard,touchTargets,reducedMotion,screenshot,duration_ms:performance.now()-start};
 }
 private async filtersIfSearchHidden(page:Page){if(!await page.getByRole('textbox',{name:'상품 검색',exact:true}).filter({visible:true}).first().isVisible().catch(()=>false))await this.filters(page);}
 private async keyboard(page:Page):Promise<KeyboardCheck[]>{
  const checks:KeyboardCheck[]=[];const check=async(id:string,fn:()=>Promise<string>)=>{try{checks.push({id,pass:true,details:await fn(),source:'Measured'});}catch(e){checks.push({id,pass:false,details:e instanceof Error?e.message:String(e),source:'Measured'});}};
  await this.open(page);
  await check('keyboard-tab-focus',async()=>{await page.keyboard.press('Tab');const focus=await page.evaluate(()=>{const el=document.activeElement as HTMLElement;const s=getComputedStyle(el);return {tag:el.tagName,visible:!!el.getClientRects().length,indicator:s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0||s.boxShadow!=='none'};});if(!focus.visible||focus.tag==='BODY'||!focus.indicator)throw new Error('첫 Tab 초점 또는 표시 실패');return 'Tab으로 실제 초점과 outline/box-shadow 확인';});
  const sw=page.getByRole('switch',{name:'새 소식 알림',exact:true});
  await check('keyboard-switch',async()=>{await sw.focus();const prev=await sw.getAttribute('aria-checked');await page.keyboard.press('Space');if(await sw.getAttribute('aria-checked')===prev)throw new Error('Space 토글 실패');return 'Space로 switch 상태 변경';});
  await check('keyboard-range',async()=>{await this.filters(page);const slider=page.getByRole('slider',{name:'가격 범위 최대',exact:true}).filter({visible:true}).first();await slider.focus();const prev=Number(await slider.getAttribute('aria-valuenow'));await page.keyboard.press('ArrowLeft');if(Number(await slider.getAttribute('aria-valuenow'))>=prev)throw new Error('방향키 슬라이더 실패');await this.closeFilters(page);return 'ArrowLeft로 range 최대 핸들 변경';});
  await check('modal-focus',async()=>{const trigger=page.getByRole('button',{name:'아크 데스크 램프 상세 보기',exact:true});await trigger.click();const modal=page.getByRole('dialog',{name:'아크 데스크 램프',exact:true});for(let i=0;i<5;i++){await page.keyboard.press('Tab');if(!await modal.evaluate(el=>el.contains(document.activeElement)))throw new Error('모달에서 Tab 초점 이탈');}await page.keyboard.press('Escape');await modal.waitFor({state:'hidden'});await page.waitForFunction(label=>document.activeElement?.getAttribute('aria-label')===label,'아크 데스크 램프 상세 보기',{timeout:1500});if(!await trigger.evaluate(el=>el===document.activeElement))throw new Error('트리거 초점 복귀 실패');return 'Tab 5회 트랩·Escape·초점 복귀';});
  return checks;
 }
}

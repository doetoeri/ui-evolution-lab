import {test,expect,type Page} from '@playwright/test';
import {SCHEMA,type VarId,type Value} from '../../src/schema';
import {defaults,change,type Genome} from '../../src/engine';
import {writeFileSync} from 'node:fs';
async function load(page:Page,g:Genome,gallery:boolean,mobile:boolean,tablet:boolean){
  await page.evaluate(genome=>localStorage.setItem('ui-evolution-lab.phase0.v1',JSON.stringify({genome,locks:[],candidates:[],compare:[]})),g);
  await page.reload({waitUntil:'domcontentloaded'});await expect(page.locator('.preview-device .genome-root')).toBeVisible();await expect(page.locator('.preview-device .genome-root')).toHaveAttribute('data-a01',g.family);
  if(gallery)await page.locator('.lab-navigation').getByRole('button',{name:'컴포넌트',exact:true}).click();
  if(mobile||tablet)await page.getByRole('button',{name:mobile?'모바일 390px':'태블릿 768px',exact:true}).click();
  await page.evaluate(()=>document.fonts.ready);await expect(page.locator('.preview-device-content')).toHaveCSS('zoom','1');
}
async function interact(page:Page,id:VarId){
  const root=page.locator('.preview-device .genome-root');
  if(id==='G07')await root.locator('.product-card').first().hover();
  if(['H04','H05','H06'].includes(id)){const target=id==='H05'?root.locator('.product-card').first():root.locator('.hero-copy .ui-button');await target.hover();if(id==='H06')await page.mouse.down();}
  if(['B04','H07'].includes(id))await root.getByRole('button',{name:'더보기',exact:true}).click();
  if(id==='H08')await root.getByRole('button',{name:'아크 데스크 램프 상세 보기',exact:true}).click();
  if(id==='H09')await root.getByRole('combobox',{name:'컴포넌트 상태'}).selectOption('Loading');
  if(['H10','C10'].includes(id))await root.getByRole('button',{name:'아크 데스크 램프 장바구니 담기'}).click();
  if(['F11','H11'].includes(id)){await root.getByRole('textbox',{name:'이메일',exact:true}).fill('invalid');await root.getByRole('button',{name:'형식 확인'}).click();}
}
async function fingerprint(page:Page){return page.evaluate(async()=>{
  const props=['color','background-color','background-image','display','visibility','position','min-width','min-height','width','height','padding','margin','font-family','font-size','font-weight','line-height','letter-spacing','text-align','text-transform','font-variant-numeric','text-wrap','border-radius','border-width','border-style','border-color','box-shadow','outline','grid-template-columns','flex-direction','order','transform','translate','scale','filter','backdrop-filter','fill','stroke-width','overflow','white-space','-webkit-line-clamp','animation-name','animation-duration','animation-delay','transition-duration','transition-timing-function'];
  const result:string[]=[];const roots=document.querySelectorAll('.preview-device .genome-root,.genome-overlay');
  if(!roots.length)throw new Error('Renderer has not mounted');for(const root of roots){const nodes=[root,...root.querySelectorAll('*')].filter(el=>el.tagName!=='path'&&el.tagName!=='line'&&el.tagName!=='ellipse'&&el.tagName!=='circle');
    for(const el of nodes){const css=getComputedStyle(el),rect=el.getBoundingClientRect();result.push(el.tagName,el.childElementCount?'':el.textContent??'',String(Math.round(rect.x)),String(Math.round(rect.y)),...props.map(p=>css.getPropertyValue(p)));for(const pseudo of ['::before','::after']){const c=getComputedStyle(el,pseudo);if(c.content!=='none')result.push(pseudo,...props.map(p=>c.getPropertyValue(p)));}}
  }const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(result)));return Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,'0')).join('');
});}
test('each of 120 variables changes actual rendered geometry, CSS, content or interaction feedback',async({page})=>{
  test.setTimeout(300000);await page.setViewportSize({width:2000,height:1200});await page.goto('/');await page.evaluate(()=>document.fonts.ready);const report:{id:string;different:boolean;scope:string;values:Value[]}[]=[];
  for(const def of SCHEMA){
    let g=defaults();if(!['H01','H02','H12','J11'].includes(def.id))g=change(g,'H01',0);for(const dep of def.dependencies)g=change(g,dep.id,dep.values[0]);
    if(def.id==='A05')g=change(g,'A03',720);
    if(['B04','H07'].includes(def.id))g=change(g,'B05','dropdown');
    if(['I02','I03'].includes(def.id)){g=change(g,'I01','translucent');g=change(g,'I08','grid');}
    if(def.id==='E12')g=change(g,'E11',.14);
    const gallery=def.scope==='gallery'||['F10','F11','F12','G12','H09','H11'].includes(def.id);
    const mobile=['J01','J05','J06','J08','J09'].includes(def.id),tablet=['J02','J04'].includes(def.id);
    let a=def.options[0].value,b=def.options[1].value;if(def.id==='J04')b=840;
    const prints:string[]=[];
    for(const value of [a,b]){
      await load(page,change(g,def.id,value),gallery,mobile,tablet);
        await page.mouse.move(0,0);await interact(page,def.id);
      // Wait for finite motion; computed animation/transition settings remain inspectable.
      await page.waitForTimeout(80);
      prints.push(await fingerprint(page));
      if(def.id==='H06')await page.mouse.up();
      if(['B04','H07','H08'].includes(def.id))await page.keyboard.press('Escape');
    }
    report.push({id:def.id,different:prints[0]!==prints[1],scope:gallery?'gallery':'shop',values:[a,b]});writeFileSync('docs/renderer-effect-results.json',JSON.stringify(report,null,2));if(report.length%12===0)console.log(`Rendered effects: ${report.length}/120`);
  }
  writeFileSync('docs/renderer-effect-results.json',JSON.stringify(report,null,2));
  expect(report.filter(r=>!r.different).map(r=>r.id),'Every declared variable must change an actual rendered property in its applicable scenario').toEqual([]);
});

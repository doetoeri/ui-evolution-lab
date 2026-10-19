import {chromium,expect} from '@playwright/test';
import {existsSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const file=resolve(process.argv[2]??'UI_Evolution_Lab.html');
const local=existsSync('.qa-browser/chromium')?resolve('.qa-browser/chromium'):undefined;
const browser=await chromium.launch({executablePath:local,args:local?['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader']:[],headless:true});
const page=await browser.newPage({viewport:{width:1600,height:1080}});const errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
  await page.goto(pathToFileURL(file).href);const root=page.locator('.preview-device .genome-root');await expect(root).toBeVisible();await page.evaluate(()=>document.fonts.ready);
  const shape=await root.locator('.signature-switch').first().evaluate(el=>{const handle=el.querySelector('.switch-thumb').getBoundingClientRect();return {ratio:handle.width/handle.height,track:getComputedStyle(el,'::before').backgroundColor,handle:getComputedStyle(el.querySelector('.switch-thumb')).backgroundColor};});
  expect(shape.ratio).toBeGreaterThan(1.25);expect(shape.track).toBe('rgb(7, 133, 252)');expect(shape.handle).toBe('rgb(255, 255, 255)');
  mkdirSync('docs/screenshots',{recursive:true});await page.screenshot({path:'docs/screenshots/standalone-browser.png',fullPage:true});
  const sw=root.getByRole('switch',{name:'새 소식 알림'});await sw.click();await expect(sw).not.toBeChecked();await sw.focus();await page.keyboard.press('Space');await expect(sw).toBeChecked();
  await root.getByRole('button',{name:'루프 라운지 체어 장바구니 담기'}).click();await root.getByRole('button',{name:'장바구니 1개'}).click();const cart=page.getByRole('dialog',{name:'장바구니',exact:true});
  await cart.getByRole('button',{name:'루프 라운지 체어 수량 늘리기'}).click();await cart.getByRole('button',{name:'루프 라운지 체어 수량 늘리기'}).click();await expect(cart.getByRole('alert')).toContainText('재고 2개');await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'axe-core로 화면 검사'}).click();await expect(page.locator('.audit-results')).toContainText('통과 규칙',{timeout:30000});const audit=await page.locator('.audit-results').innerText();expect(audit).toContain('0개 위반 유형');
  await page.locator('.lab-navigation').getByRole('button',{name:'컴포넌트',exact:true}).click();await expect(root.locator('[data-component]')).toHaveCount(29);expect(errors).toEqual([]);
  const result={passed:true,file:file.split('/').at(-1),timestamp:new Date().toISOString(),checks:{fileProtocol:true,signatureShape:shape,switchClickAndKeyboard:true,stockErrorVisibleInsideCart:true,componentCount:29,onDemandAxe:audit,uncaughtErrors:errors}};
  writeFileSync('docs/standalone-results.json',JSON.stringify(result,null,2)+'\n');process.stdout.write(JSON.stringify({passed:true,components:29,axeViolations:0,errors}));
}finally{await browser.close();}

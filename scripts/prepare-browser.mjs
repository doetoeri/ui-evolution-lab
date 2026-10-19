// Optional Linux CI fallback when the Playwright browser CDN is unavailable.
import {createReadStream,createWriteStream,mkdirSync,chmodSync,existsSync,unlinkSync} from 'node:fs';
import {createBrotliDecompress} from 'node:zlib';
import {pipeline} from 'node:stream/promises';
import {createRequire} from 'node:module';
import {dirname,resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
const require=createRequire(import.meta.url);
const bin=resolve(dirname(require.resolve('@sparticuz/chromium')),'../bin');
const output=resolve('.qa-browser');mkdirSync(output,{recursive:true});
for(const name of ['chromium','fonts.tar','swiftshader.tar']){
  const dest=join(output,name);
  await pipeline(createReadStream(join(bin,`${name}.br`)),createBrotliDecompress(),createWriteStream(dest));
  if(name.endsWith('.tar')){const target=name==='fonts.tar'?join(output,'fonts'):output;mkdirSync(target,{recursive:true});const p=spawnSync('tar',['--no-same-owner','--no-same-permissions','-xf',dest,'-C',target],{stdio:'inherit'});if(p.status!==0)throw new Error(`extract ${name} failed`);unlinkSync(dest);}
}
chmodSync(join(output,'chromium'),0o755);
process.stdout.write(`Chromium extracted to ${output}/chromium\n`);

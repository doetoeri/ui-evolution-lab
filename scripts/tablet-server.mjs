import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const port=Number(process.env.PORT||4173);
createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost');let p=resolve(root,'.'+decodeURIComponent(u.pathname));if(p!==root&&!p.startsWith(root+sep)){res.writeHead(403).end();return;}let s;try{s=await stat(p)}catch{}if(s?.isDirectory())p=resolve(p,'index.html');else if(!s?.isFile()){if(extname(p)){res.writeHead(404).end();return;}p=resolve(root,'index.html');}const data=await readFile(p);res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2'})[extname(p)]||'application/octet-stream'});res.end(data)}catch(e){res.writeHead(500).end(String(e))}}).listen(port,'127.0.0.1',()=>console.log('Tablet Level 1: http://127.0.0.1:'+port));

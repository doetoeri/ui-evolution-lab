import {useEffect,useState} from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import {defaults,parseGenome,type Genome} from '../engine';
import {GenomeSurface} from '../GenomeSurface';
import {Shop} from '../Shop';
import {Gallery} from '../Gallery';
declare global {interface Window {__UEL_EVALUATION__?:{genome:Genome;viewportHeight:number;view?:'shop'|'gallery';fixture?:string};__UEL_EVALUATION_READY__?:boolean}}
export function EvaluationPage(){
 const [{genome,error}]=useState(()=>{try{return {genome:window.__UEL_EVALUATION__?parseGenome(JSON.stringify(window.__UEL_EVALUATION__.genome)):defaults(),error:''};}catch(e){return {genome:defaults(),error:String(e)};}});
 useEffect(()=>{let live=true;document.fonts.ready.then(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{if(live)window.__UEL_EVALUATION_READY__=true;})));return()=>{live=false;};},[]);
 const fixture=window.__UEL_EVALUATION__?.fixture;
 return <Tooltip.Provider><div data-evaluation-root="true" className="evaluation-page">{error?<p role="alert">{error}</p>:<GenomeSurface genome={genome} viewportHeight={window.__UEL_EVALUATION__?.viewportHeight??innerHeight}>{window.__UEL_EVALUATION__?.view==='gallery'?<Gallery/>:<Shop/>}</GenomeSurface>}
  {fixture==='broken'&&<div className="known-errors-fixture"><div data-layout-peers style={{position:'relative',height:80}}><button style={{position:'absolute',left:0,top:0,width:120,height:44}}>첫 번째 버튼</button><button style={{position:'absolute',left:60,top:10,width:120,height:44}}>겹친 버튼</button></div><button aria-label="화면 밖 버튼" style={{position:'absolute',left:'calc(100vw + 40px)',top:100,width:100,height:44}}>화면 밖</button><button aria-label="작은 목표" style={{width:12,height:12,padding:0,minHeight:0,minWidth:0}}>x</button><div style={{width:40,height:10,overflow:'hidden'}}><h3 style={{whiteSpace:'nowrap',margin:0}}>의도하지 않은 잘린 텍스트</h3></div><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'/%3E"/><button aria-label="" style={{width:44,height:44}}/></div>}
  {fixture==='intentional'&&<div data-layout-peers style={{position:'relative',height:80}}><div data-layout-intentional style={{position:'absolute',left:0,width:100,height:60,background:'#ccc'}}>장식</div><div data-layout-intentional style={{position:'absolute',left:50,width:100,height:60,background:'#ddd'}}>의도된 중첩</div></div>}
 </div></Tooltip.Provider>;
}

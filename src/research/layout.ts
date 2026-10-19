import type {LayoutResult,Issue,Rect} from './types';
/** Runs inside the evaluated browser. Only declared peer groups are checked for overlaps.
 * Decorative descendants/ancestor containment and explicit intentional clips are excluded. */
export function scanLayout():LayoutResult {
 const issues:Issue[]=[];let ignoredIntentional=0,inspected=0;
 const rect=(e:Element):Rect=>{const r=e.getBoundingClientRect();return {x:Math.round(r.x+scrollX),y:Math.round(r.y+scrollY),width:Math.round(r.width),height:Math.round(r.height)};};
 const selector=(e:Element)=>{if(e.id)return `#${CSS.escape(e.id)}`;const label=e.getAttribute('aria-label');if(label)return `${e.tagName.toLowerCase()}[aria-label="${CSS.escape(label)}"]`;const parts:string[]=[];let p:Element|null=e;for(let i=0;p&&i<5;i++,p=p.parentElement){const tag=p.tagName.toLowerCase(),siblings=p.parentElement?[...p.parentElement.children].filter(n=>n.tagName===p!.tagName):[];parts.unshift(`${tag}${siblings.length>1?`:nth-of-type(${siblings.indexOf(p)+1})`:''}`);if(p.classList.contains('shop'))break;}return parts.join(' > ');};
 const visible=(e:Element)=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>1&&r.height>1&&!e.closest('[aria-hidden="true"],.sr-only');};
 const add=(id:string,e:Element,message:string,severity:Issue['severity']='moderate',related?:Element)=>{const key=`${id}:${selector(e)}`;if(issues.some(x=>`${x.id}:${x.selector}`===key))return;issues.push({id,selector:selector(e),rect:rect(e),message,severity,source:'Measured',relatedSelector:related?selector(related):undefined});};
 const doc=document.documentElement,root=document.querySelector('[data-evaluation-root]')??document.body;
 if(doc.scrollWidth>doc.clientWidth+2)add('horizontal-scroll',root,`수평 넘침 ${doc.scrollWidth-doc.clientWidth}px`,'serious');
 const required=[...root.querySelectorAll('h1,h2,h3,button,input:not([type="hidden"]),select,[role="slider"],[data-layout-essential]')].filter(visible);
 for(const e of required){inspected++;const r=e.getBoundingClientRect(),style=getComputedStyle(e);
  if(r.left< -2||r.right>innerWidth+2)add('outside-horizontal',e,`필수 요소가 화면 좌우 경계를 벗어남 (${Math.round(r.left)}…${Math.round(r.right)})`,'serious');
  if((style.position==='fixed'||style.position==='sticky')&&(r.top< -2||r.bottom>innerHeight+2))add('fixed-outside',e,'고정 요소가 화면 경계를 벗어남','serious');
  const text=[...e.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE&&n.textContent?.trim());
  if(text.length&&!e.matches('input,select')){
   for(const node of text){const range=document.createRange();range.selectNodeContents(node);for(const tr of [...range.getClientRects()]){
    let parent:Element|null=e;while(parent&&parent!==root.parentElement){const ps=getComputedStyle(parent),pr=parent.getBoundingClientRect();
     if(/hidden|clip/.test(ps.overflowX+' '+ps.overflowY)&&(tr.right>pr.right+3||tr.left<pr.left-3||tr.bottom>pr.bottom+3||tr.top<pr.top-3)){
      if(parent.hasAttribute('data-layout-intentional')||ps.textOverflow==='ellipsis'||ps.webkitLineClamp!=='none'&&Number(ps.webkitLineClamp)>0)ignoredIntentional++;else add('text-clipped',e,'텍스트가 overflow 경계에서 잘림','moderate',parent);break;
     }parent=parent.parentElement;
    }
   }range.detach();}
  }
  const interact=e.matches('button,input,select,[role="slider"]')&&!e.hasAttribute('disabled')&&!e.closest('[aria-disabled="true"]');
  if(interact&&r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth){
   const x=r.left+r.width/2,y=r.top+r.height/2,hit=document.elementFromPoint(x,y);
   if(hit&&hit!==e&&!e.contains(hit)&&!hit.contains(e)){
    const hs=getComputedStyle(hit);add(hs.position==='fixed'||hs.position==='sticky'?'fixed-obstruction':'not-clickable',e,'클릭 지점이 다른 요소에 가려짐','serious',hit);
   }
  }
 }
 const groups=[...root.querySelectorAll('[data-layout-peers],.product-grid,.shop-header-actions,.catalog-heading,.preference-controls,.quantity-controls,.filters-content')].filter(visible);
 for(const group of groups){const children=[...group.children].filter(visible);for(let i=0;i<children.length;i++)for(let j=i+1;j<children.length;j++){
  const a=children[i],b=children[j],ar=a.getBoundingClientRect(),br=b.getBoundingClientRect();const w=Math.min(ar.right,br.right)-Math.max(ar.left,br.left),h=Math.min(ar.bottom,br.bottom)-Math.max(ar.top,br.top);
  if(w>3&&h>3&&w*h>32){if(a.hasAttribute('data-layout-intentional')||b.hasAttribute('data-layout-intentional'))ignoredIntentional++;else add('peer-overlap',a,`동일 그룹 요소 겹침 ${Math.round(w)}×${Math.round(h)}px`,'serious',b);}
 }}
 return {issues,inspected,ignoredIntentional,scrollWidth:doc.scrollWidth,clientWidth:doc.clientWidth,scanVersion:'annotated-peers-v2'};
}
export function measureTouchTargets():Issue[]{
 const result:Issue[]=[],root=document.querySelector('[data-evaluation-root]')??document.body;
 for(const e of root.querySelectorAll('button,a[href],input:not([type="hidden"]),select,[role="switch"],[role="checkbox"],[role="radio"],[role="slider"]')){
  const r=e.getBoundingClientRect(),s=getComputedStyle(e);if(s.display==='none'||s.visibility==='hidden'||r.width<1||r.height<1||e.closest('[aria-hidden="true"],.sr-only'))continue;
  // Label wrapping is part of the effective target, native input need not itself fill it.
  const label=e.closest('label'),lr=label?.getBoundingClientRect();const w=Math.max(r.width,lr?.width??0),h=Math.max(r.height,lr?.height??0);
  if(w<24||h<24)result.push({id:'target-size',message:`24px 미만 클릭 영역 ${Math.round(w)}×${Math.round(h)}px; 간격 예외는 수동 검토`,severity:'moderate',source:'Measured',selector:e.getAttribute('aria-label')??e.textContent?.trim().slice(0,80)??e.tagName,rect:{x:r.x+scrollX,y:r.y+scrollY,width:w,height:h}});
 }return result;
}

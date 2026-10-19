import type {CSSProperties} from 'react';
import type {Genome} from './engine';
export function hslToRgb(h:number,s:number,l:number):[number,number,number] {
  s/=100;l/=100;const a=s*Math.min(l,1-l);const f=(n:number)=>{const k=(n+h/30)%12;return l-a*Math.max(-1,Math.min(k-3,9-k,1));};return[f(0),f(8),f(4)].map(x=>Math.round(255*x)) as [number,number,number];
}
export function luminance(rgb:number[]){const c=rgb.map(n=>{n/=255;return n<=0.04045?n/12.92:((n+0.055)/1.055)**2.4;});return .2126*c[0]+.7152*c[1]+.0722*c[2];}
export function contrast(a:number[],b:number[]){const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
const rgb=(a:number[])=>`rgb(${a.join(' ')})`;
export function designTokens(g:Genome,systemDark=false,reduced=false) {
  const v=g.variables;const n=(id:keyof typeof v)=>Number(v[id]);
  const hue={blue:211,violet:264,teal:173,orange:24}[v.C01 as string]??211;
  const dark=v.C11==='dark'||(v.C11==='system'&&systemDark);
  const primary=hslToRgb(hue,n('C04'),n('C03'));
  const primaryInk=contrast(primary,[255,255,255])>=4.5?[255,255,255]:[0,0,0];
  const secondaryHue=v.C02==='complementary'?(hue+180)%360:v.C02==='analogous'?(hue+35)%360:hue;
  const surface=hslToRgb(v.C06==='white'?220:hue,v.C06==='white'?dark?12:0:v.C06==='tinted'?dark?18:65:12,dark?(v.C06==='contrast'?25:15):(v.C06==='contrast'?91:v.C06==='tinted'?96:100));
  const canvas=hslToRgb(v.C05==='warm'?36:hue,v.C05==='neutral'?dark?9:20:v.C05==='tinted'?dark?20:50:30,dark?9:v.C05==='neutral'?97:95);
  const ink=dark?[244,246,252]:[23,29,43];
  const muted=dark?[185,194,210]:[83,96,117];
  const enhanced=v.J12==='enhanced'||v.J12==='outline';
  const border=hslToRgb(hue,dark?12:15,dark?(enhanced?75:v.C09==='soft'?31:v.C09==='medium'?57:72):(enhanced?32:v.C09==='soft'?88:v.C09==='medium'?55:38));
  const duration=reduced||v.J11==='reduce'?0:v.J11==='essential'?Math.min(n('H01'),100):n('H01');
  const density=v.A07==='compact'?.75:v.A07==='spacious'?1.3:1;
  const font={sans:'"Noto Sans KR Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", sans-serif',serif:'Georgia, "Noto Serif KR", "Batang", "Noto Sans KR Variable", serif',mono:'"SFMono-Regular", Consolas, "Noto Sans KR Variable", monospace'}[v.D01 as string];
  const tonal=hslToRgb(hue,dark?42:85,dark?23:93);
  const secondary=hslToRgb(secondaryHue,60,dark?72:36);
  const accent=hslToRgb((secondaryHue+48)%360,65,dark?72:34);
  const success=v.C10==='semantic'?(dark?'#6fe0ae':'#087745'):v.C10==='brand'?rgb(primary):rgb(ink);
  const error=v.C10==='semantic'?(dark?'#ffb1b1':'#b42332'):v.C10==='brand'?rgb(primary):rgb(ink);
  const style:CSSProperties & Record<string,string|number>={
    '--primary':rgb(primary),'--on-primary':rgb(primaryInk),'--secondary':rgb(secondary),'--accent':rgb(accent),'--tonal':rgb(tonal),'--canvas':rgb(canvas),'--surface':rgb(surface),'--surface-rgb':surface.join(' '),'--ink':rgb(ink),'--muted':rgb(muted),'--subtle':rgb(n('C08')>2?(dark?[169,181,201]:[96,106,125]):muted),'--meta-ink':rgb(n('C08')>3?(dark?[156,173,198]:[104,113,131]):muted),'--border':rgb(border),'--success':success,'--error':error,
    '--content-max':`${n('A03')}px`,'--page-pad':`${n('A04')}px`,'--page-margin-start':v.A05==='end'?'auto':v.A05==='center'?'auto':'0','--page-margin-end':v.A05==='start'?'auto':v.A05==='center'?'auto':'0','--density':density,'--hero-ratio':`${n('A08')}%`,
    '--nav-height':`${n('B03')}px`,'--font':font??'sans-serif','--font-size':`${n('D02')}px`,'--heading-size':`${n('D02')*n('D03')}px`,'--heading-weight':n('D04'),'--body-weight':n('D05'),'--leading':n('D06'),'--tracking':`${n('D07')}em`,'--text-align':String(v.D08),'--meta-size':`${n('D12')===2?.9:n('D12')===3?.8:.72}em`,'--card-title-size':`${n('D12')===2?1.05:n('D12')===3?1.15:1.3}em`,
    '--space-unit':`${n('E01')}px`,'--component-pad':`${n('E02')*density}px`,'--component-gap':`${n('E03')*density}px`,'--section-gap':`${n('E04')*density}px`,'--button-height':`${n('E05')}px`,'--input-height':`${n('E06')}px`,'--card-min-height':`${n('E07')}px`,'--radius':`${n('E08')}px`,'--chip-radius':n('E09')>=50?'999px':`${n('E08')}px`,'--field-radius':n('E09')===100?'999px':`${n('E08')}px`,'--border-width':`${n('E10')}px`,'--shadow-alpha':n('E11'),'--shadow-blur':`${n('E12')}px`,
    '--button-radius':v.F02==='pill'?'999px':v.F02==='rounded'?`${Math.max(8,n('E08')*.65)}px`:'3px','--toggle-width':v.F08==='wide-pill'?'86px':v.F08==='compact-pill'?'62px':'74px','--toggle-handle':v.F08==='wide-pill'?'43px':v.F08==='compact-pill'?'29px':'35px','--slider-thumb-width':v.F09==='long-pill'?'46px':v.F09==='flat-pill'?'36px':'32px','--slider-thumb-height':v.F09==='flat-pill'?'18px':'24px',
    '--image-ratio':String(v.G02),'--card-border-style':String(v.G05),'--card-bg':v.G06==='transparent'?'transparent':v.G06==='tinted'?rgb(tonal):rgb(surface),'--columns':n('G08'),
    '--duration':`${duration}ms`,'--easing':v.H02==='spring'?'cubic-bezier(.22,1,.36,1)':v.H02==='linear'?'linear':'cubic-bezier(.2,0,0,1)','--color-duration':`${reduced?0:v.C12==='instant'?0:v.C12==='fade'?160:450}ms`,
    '--surface-alpha':v.I01==='translucent'?n('I02')/100:1,'--backdrop-blur':`${v.I01==='translucent'?n('I03'):0}px`,'--depth':n('I05'),'--surface-highlight':v.I04==='top'?'inset 0 1px 0 rgb(255 255 255 / .5)':v.I04==='edge'?'inset 0 0 0 1px rgb(255 255 255 / .5)':'inset 0 0 0 transparent','--edge-highlight':v.I06==='brand'?rgb(primary):v.I06==='subtle'?rgb(border):'transparent',
    '--canvas-gradient':v.I07==='radial'?`radial-gradient(ellipse at top right, ${rgb(tonal)}, transparent 70%)`:v.I07==='linear'?`linear-gradient(125deg, ${rgb(canvas)}, ${rgb(tonal)})`:'linear-gradient(transparent,transparent)','--canvas-pattern':v.I08==='dots'?`radial-gradient(${rgb(border)} 1px, transparent 1px)`:v.I08==='grid'?`linear-gradient(${rgb(border)} 1px, transparent 1px), linear-gradient(90deg, ${rgb(border)} 1px, transparent 1px)`:'linear-gradient(transparent,transparent)','--pattern-size':v.I08==='grid'?'32px 32px':'16px 16px','--icon-size':`${n('I12')}px`,'--icon-stroke':v.I11==='bold'?2.8:1.75,'--icon-fill':v.I11==='duotone'?rgb(tonal):'none','--touch-target':`${n('J07')}px`,
  };
  return {style,dark,reduced:duration===0,palette:{primary:rgb(primary),onPrimary:rgb(primaryInk),surface:rgb(surface),canvas:rgb(canvas),ink:rgb(ink),muted:rgb(muted),border:rgb(border),secondary:rgb(secondary),accent:rgb(accent)},contrast:{primary:contrast(primary,primaryInk),body:contrast(surface,ink),muted:contrast(surface,muted),border:contrast(surface,border)}};
}
export function tokenCSS(g:Genome,systemDark=false,reduced=false){return ':root {\n'+Object.entries(designTokens(g,systemDark,reduced).style).map(([key,value])=>`  ${key}: ${value};`).join('\n')+'\n}';}
export function tokenChecks(g:Genome,systemDark=false) {const t=designTokens(g,systemDark);return[{name:'본문 / 표면',ratio:t.contrast.body,threshold:4.5},{name:'보조 텍스트 / 표면',ratio:t.contrast.muted,threshold:4.5},{name:'버튼 전경 / 기본색',ratio:t.contrast.primary,threshold:4.5},{name:'입력 경계 / 표면',ratio:t.contrast.border,threshold:3}].map(x=>({...x,pass:x.ratio>=x.threshold}));}

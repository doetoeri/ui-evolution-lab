import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import type {Genome} from './engine';
import {designTokens} from './tokens';
import {SCHEMA} from './schema';
export const GenomeContext=createContext<Genome|null>(null);
export function useGenome(){const g=useContext(GenomeContext);if(!g)throw new Error('GenomeSurface required');return g;}
export function useMedia(query:string){const [matches,setMatches]=useState(()=>window.matchMedia?.(query).matches??false);useEffect(()=>{const m=window.matchMedia?.(query);if(!m)return;setMatches(m.matches);const fn=()=>setMatches(m.matches);m.addEventListener('change',fn);return()=>m.removeEventListener('change',fn);},[query]);return matches;}
export function useGenomeTheme(g:Genome){const dark=useMedia('(prefers-color-scheme: dark)'),reduced=useMedia('(prefers-reduced-motion: reduce)');const tokens=designTokens(g,dark,reduced);const attrs=Object.fromEntries(SCHEMA.map(d=>[`data-${d.id.toLowerCase()}`,g.variables[d.id]]));return {className:`genome ${g.family} ${g.signature?'signature-on':'signature-off'} ${tokens.dark?'theme-dark':''} ${tokens.reduced?'motion-reduced':''}`,style:tokens.style,...attrs,'data-dark':tokens.dark,'data-signature':g.signature};}
export function ThemedOverlay({children}:{children:ReactNode}){const g=useGenome(),theme=useGenomeTheme(g);return <div {...theme} className={`${theme.className} genome-overlay`}>{children}</div>;}
export function GenomeSurface({genome,children,className='',viewportHeight=800}:{genome:Genome;children:ReactNode;className?:string;viewportHeight?:number}){
  const ref=useRef<HTMLDivElement>(null);const [size,setSize]=useState({width:1200,height:800});const theme=useGenomeTheme(genome);const breakpoint=Number(genome.variables.J04);
  useEffect(()=>{if(!ref.current||typeof ResizeObserver==='undefined')return;const o=new ResizeObserver(entries=>{const {width,height}=entries[0].contentRect;setSize({width,height});});o.observe(ref.current);return()=>o.disconnect();},[]);
  const tier=size.width<breakpoint?'mobile':size.width<1024?'tablet':'desktop';
  return <GenomeContext.Provider value={genome}><div ref={ref} {...theme} className={`${theme.className} genome-root ${className}`} data-tier={tier} data-orientation={size.width>viewportHeight?'landscape':'portrait'} data-testid="genome-surface"><div className="genome-page">{children}</div></div></GenomeContext.Provider>;
}

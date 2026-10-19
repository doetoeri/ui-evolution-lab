import {forwardRef,useId,useRef,useState,type ButtonHTMLAttributes,type ReactNode} from 'react';
import * as Switch from '@radix-ui/react-switch';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Radio from '@radix-ui/react-radio-group';
import * as Slider from '@radix-ui/react-slider';
import * as Tooltip from '@radix-ui/react-tooltip';
import {Check,Minus,LoaderCircle} from 'lucide-react';
export const Button=forwardRef<HTMLButtonElement,ButtonHTMLAttributes<HTMLButtonElement>&{variant?:'primary'|'secondary'|'tonal'|'outline';loading?:boolean;icon?:ReactNode}>(({children,variant='primary',loading,icon,className='',disabled,...props},ref)=><button ref={ref} type="button" className={`ui-button ${variant} ${className}`} disabled={disabled||loading} aria-busy={loading||undefined} {...props}>{loading?<LoaderCircle className="spin" aria-hidden/>:icon?<span className="button-icon">{icon}</span>:null}<span>{children}</span></button>);
Button.displayName='Button';
export const IconButton=forwardRef<HTMLButtonElement,ButtonHTMLAttributes<HTMLButtonElement>&{label:string}>(({label,children,className='',...props},ref)=><button type="button" ref={ref} aria-label={label} title={label} className={`icon-button ${className}`} {...props}>{children}</button>);
IconButton.displayName='IconButton';
export function PillSwitch({label,checked,onChange,disabled,description}:{label:string;checked:boolean;onChange:(value:boolean)=>void;disabled?:boolean;description?:string}){
  const id=useId();return <div className="switch-row"><div className="switch-label"><label htmlFor={id}>{label}</label>{description&&<small id={`${id}-hint`}>{description}</small>}</div><Switch.Root id={id} className="signature-switch" checked={checked} onCheckedChange={onChange} disabled={disabled} aria-describedby={description?`${id}-hint`:undefined}><Switch.Thumb className="switch-thumb"><span aria-hidden>{checked?<Check size={12}/>:<Minus size={12}/>}</span></Switch.Thumb></Switch.Root></div>;
}
export function PillCheckbox({label,checked,onChange,disabled}:{label:string;checked:boolean;onChange:(value:boolean)=>void;disabled?:boolean}){
  const id=useId();return <div className="choice-row"><Checkbox.Root id={id} className="pill-checkbox" checked={checked} onCheckedChange={value=>onChange(value===true)} disabled={disabled}><Checkbox.Indicator forceMount className="check-indicator">{checked?<Check size={14}/>:<Minus size={12}/>}</Checkbox.Indicator></Checkbox.Root><label htmlFor={id}>{label}</label></div>;
}
export function PillRadioGroup({label,value,onChange,options,disabled,orientation='vertical'}:{label:string;value:string;onChange:(value:string)=>void;options:{value:string;label:string}[];disabled?:boolean;orientation?:'vertical'|'horizontal'}) {
  const id=useId();return <Radio.Root aria-label={label} className={`pill-radio-group ${orientation}`} value={value} onValueChange={onChange} disabled={disabled} orientation={orientation}>{options.map((o,i)=><div className="choice-row" key={o.value}><Radio.Item id={`${id}-${i}`} value={o.value} className="pill-radio"><Radio.Indicator className="radio-indicator"/></Radio.Item><label htmlFor={`${id}-${i}`}>{o.label}</label></div>)}</Radio.Root>;
}
export function Segmented({label,value,onChange,options,disabled}:{label:string;value:string;onChange:(v:string)=>void;options:{value:string;label:string;icon?:ReactNode}[];disabled?:boolean}) {
  const index=options.findIndex(o=>o.value===value);
  return <Radio.Root className="segmented" aria-label={label} value={value} onValueChange={onChange} orientation="horizontal" disabled={disabled} style={{'--segments':options.length,'--segment-index':Math.max(0,index)} as React.CSSProperties}><span aria-hidden className="segment-handle"/>{options.map(o=><Radio.Item value={o.value} key={o.value} className="segment-item">{o.icon}<span>{o.label}</span></Radio.Item>)}</Radio.Root>;
}
export function PillSlider({label,values,onChange,min=0,max=100,step=1,unit='',disabled,showValues=true}:{label:string;values:number[];onChange:(values:number[])=>void;min?:number;max?:number;step?:number;unit?:string;disabled?:boolean;showValues?:boolean}){
  const [active,setActive]=useState(0);const refs=useRef<(HTMLSpanElement|null)[]>([]);const id=useId();
  return <div className="slider-field"><div className="slider-label"><span id={id}>{label}</span>{showValues&&<output>{values.map(v=>v.toLocaleString('ko-KR')+unit).join(' — ')}</output>}</div><Slider.Root className="signature-slider" aria-labelledby={id} value={values} onValueChange={onChange} min={min} max={max} step={step} minStepsBetweenThumbs={0} disabled={disabled}><Slider.Track className="slider-track"><Slider.Range className="slider-range"/></Slider.Track>{values.map((_,i)=><Slider.Thumb key={i} ref={el=>{refs.current[i]=el;}} aria-label={values.length===1?label:`${label} ${i===0?'최소':'최대'}`} aria-valuetext={`${values[i].toLocaleString('ko-KR')}${unit}`} className="slider-thumb" onFocus={()=>setActive(i)} onPointerDown={()=>setActive(i)} style={{zIndex:active===i?3:2}}><span aria-hidden/></Slider.Thumb>)}</Slider.Root>{values.length>1&&<div className="range-endpoints"><button type="button" disabled={disabled} onClick={()=>{setActive(0);refs.current[0]?.focus();}}>최소 핸들</button><small>겹친 핸들도 선택 후 방향키로 조절</small><button type="button" disabled={disabled} onClick={()=>{setActive(1);refs.current[1]?.focus();}}>최대 핸들</button></div>}</div>;
}
export function Tip({text,children}:{text:string;children:ReactNode}){return <Tooltip.Root delayDuration={250}><Tooltip.Trigger asChild>{children}</Tooltip.Trigger><Tooltip.Portal><Tooltip.Content className="ui-tooltip" sideOffset={7}>{text}<Tooltip.Arrow/></Tooltip.Content></Tooltip.Portal></Tooltip.Root>;}

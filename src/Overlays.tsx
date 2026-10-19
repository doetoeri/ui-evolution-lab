import {useId,useRef,type ReactNode} from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Popover from '@radix-ui/react-popover';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import {X,ChevronRight,Check} from 'lucide-react';
import {ThemedOverlay} from './GenomeSurface';
import {IconButton} from './controls';
export function Modal({open,onOpenChange,title,description,children,drawer=false}:{open:boolean;onOpenChange:(open:boolean)=>void;title:string;description:string;children:ReactNode;drawer?:boolean}){
  const returnFocus=useRef<HTMLElement|null>(null);
  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal><ThemedOverlay><Dialog.Overlay className="dialog-backdrop"/><Dialog.Content className={`ui-dialog ${drawer?'ui-drawer':''}`} onOpenAutoFocus={()=>{returnFocus.current=document.activeElement instanceof HTMLElement?document.activeElement:null;}} onCloseAutoFocus={event=>{if(returnFocus.current?.isConnected){event.preventDefault();returnFocus.current.focus();}}}><header><div><Dialog.Title>{title}</Dialog.Title><Dialog.Description>{description}</Dialog.Description></div><Dialog.Close asChild><IconButton label="닫기"><X/></IconButton></Dialog.Close></header><div className="dialog-body">{children}</div></Dialog.Content></ThemedOverlay></Dialog.Portal></Dialog.Root>;
}
export function LabPopover({trigger,children,label}:{trigger:ReactNode;children:ReactNode;label:string}){
  const id=useId();return <Popover.Root><Popover.Trigger asChild>{trigger}</Popover.Trigger><Popover.Portal><ThemedOverlay><Popover.Content className="ui-popover menu-enter" aria-labelledby={id} sideOffset={8} collisionPadding={12}><div className="popover-heading"><strong id={id}>{label}</strong><Popover.Close asChild><IconButton label="팝오버 닫기"><X size={16}/></IconButton></Popover.Close></div>{children}<Popover.Arrow className="popover-arrow"/></Popover.Content></ThemedOverlay></Popover.Portal></Popover.Root>;
}
export function CategoryMenu({trigger,depth,onChoose}:{trigger:ReactNode;depth:number;onChoose:(v:string)=>void}) {
  const item=(value:string)=><Dropdown.Item key={value} className="menu-item" onSelect={()=>onChoose(value)}>{value}</Dropdown.Item>;
  return <Dropdown.Root><Dropdown.Trigger asChild>{trigger}</Dropdown.Trigger><Dropdown.Portal><ThemedOverlay><Dropdown.Content className="dropdown-content menu-enter" sideOffset={8} collisionPadding={12}>{item('전체')}{depth===1?['데스크','오디오','리빙'].map(item):<Dropdown.Sub><Dropdown.SubTrigger className="menu-item">컬렉션 <ChevronRight size={16}/></Dropdown.SubTrigger><Dropdown.Portal><ThemedOverlay><Dropdown.SubContent className="dropdown-content menu-enter" sideOffset={5}>{item('데스크')}{item('오디오')}{depth===2?item('리빙'):<Dropdown.Sub><Dropdown.SubTrigger className="menu-item">공간 <ChevronRight size={16}/></Dropdown.SubTrigger><Dropdown.Portal><ThemedOverlay><Dropdown.SubContent className="dropdown-content menu-enter" sideOffset={5}>{item('리빙')}</Dropdown.SubContent></ThemedOverlay></Dropdown.Portal></Dropdown.Sub>}</Dropdown.SubContent></ThemedOverlay></Dropdown.Portal></Dropdown.Sub>}<Dropdown.Separator className="menu-separator"/><Dropdown.Item className="menu-item" disabled><Check size={14}/> 로컬 데모</Dropdown.Item></Dropdown.Content></ThemedOverlay></Dropdown.Portal></Dropdown.Root>;
}

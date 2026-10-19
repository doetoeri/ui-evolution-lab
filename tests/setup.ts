import '@testing-library/jest-dom/vitest';
import {cleanup} from '@testing-library/react';
import {afterEach,vi} from 'vitest';
afterEach(cleanup);
Object.defineProperty(window,'matchMedia',{writable:true,value:vi.fn().mockImplementation(query=>({matches:false,media:query,onchange:null,addListener:vi.fn(),removeListener:vi.fn(),addEventListener:vi.fn(),removeEventListener:vi.fn(),dispatchEvent:vi.fn()}))});
global.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}};
Element.prototype.scrollIntoView=vi.fn();
Element.prototype.hasPointerCapture=vi.fn(()=>false);Element.prototype.setPointerCapture=vi.fn();Element.prototype.releasePointerCapture=vi.fn();
if(!window.PointerEvent)window.PointerEvent=MouseEvent as typeof PointerEvent;

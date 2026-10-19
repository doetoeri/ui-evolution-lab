import {beforeEach,describe,it,expect} from 'vitest';
import {useLab} from '../src/store';
import {defaults,genomeKey} from '../src/engine';
beforeEach(()=>{useLab.setState({genome:defaults(),past:[],future:[],locks:[],selected:[],candidates:[],compare:[],notice:''});});
describe('workspace state',()=>{
  it('changes, undoes and redoes the complete genome',()=>{useLab.getState().setVariable('E08',28);expect(useLab.getState().genome.variables.E08).toBe(28);useLab.getState().undo();expect(useLab.getState().genome.variables.E08).toBe(20);useLab.getState().redo();expect(useLab.getState().genome.variables.E08).toBe(28);});
  it('locks direct edits, reset and random mutation',()=>{const s=useLab.getState();s.toggleLock('E08');s.setVariable('E08',4);s.generate();s.resetVariable('E08');expect(useLab.getState().genome.variables.E08).toBe(20);});
  it('clears redo after a divergent edit and caps undo history',()=>{const s=useLab.getState();s.setVariable('E08',4);s.undo();s.setVariable('E08',28);expect(useLab.getState().future).toHaveLength(0);for(let i=0;i<100;i++)useLab.getState().setVariable('E08',i%2?4:28);expect(useLab.getState().past).toHaveLength(80);});
  it('saves unique presets, loads them, records evaluations and exports stable identities',()=>{const s=useLab.getState();const id=s.save('Alpha')!;s.save('duplicate');expect(useLab.getState().candidates).toHaveLength(1);s.setVariable('E08',28);s.load(id);expect(genomeKey(useLab.getState().genome)).toBe(genomeKey(defaults()));s.evaluate(id,{timestamp:'now',kind:'manual',score:8,notes:'readable'});expect(useLab.getState().candidates[0].evaluations[0].score).toBe(8);});
  it('limits comparison to four and removes deleted candidates from selection',()=>{const s=useLab.getState();for(let i=0;i<5;i++){s.setVariable('D04',[500,600,700,800][i%4]);s.setVariable('D02',i===4?18:14);const id=useLab.getState().save(`candidate ${i}`)!;s.toggleCompare(id);}expect(useLab.getState().compare).toHaveLength(4);const id=useLab.getState().compare[0];s.remove(id);expect(useLab.getState().compare).not.toContain(id);});
});

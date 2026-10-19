import {describe,it,expect} from 'vitest';
import {filterProducts,updateCart} from '../src/shop-model';
describe('shared functional shop',()=>{
  it('searches Korean and English, combines category and range, sorts prices',()=>{expect(filterProducts('헤드폰',[],[0,300000],'featured').map(p=>p.id)).toEqual([2]);expect(filterProducts('ARC',[],[0,300000],'featured').map(p=>p.id)).toEqual([1]);expect(filterProducts('',[],[0,100000],'featured',false,'그린').map(p=>p.id)).toEqual([6]);expect(filterProducts('',[],[0,300000],'price-low',true).map(p=>p.price)).toEqual([38000,45000,69000,89000,159000,249000]);expect(filterProducts('',['오디오'],[0,100000],'featured').map(p=>p.id)).toEqual([3]);expect(filterProducts('',['오디오','데스크'],[0,300000],'price-low').map(p=>p.price)).toEqual([45000,69000,89000,159000]);});
  it('enforces inventory, supports quantity change and removes zero quantities',()=>{let cart=updateCart({},4,1).cart;cart=updateCart(cart,4,1).cart;expect(cart[4]).toBe(2);const failed=updateCart(cart,4,1);expect(failed.error).toMatch('재고');expect(failed.cart).toBe(cart);cart=updateCart(cart,4,-1).cart;expect(cart[4]).toBe(1);cart=updateCart(cart,4,-1).cart;expect(cart[4]).toBeUndefined();});
  it('does not mutate the source cart on successful changes',()=>{const source={1:1},next=updateCart(source,1,1);expect(source).toEqual({1:1});expect(next.cart).toEqual({1:2});});
});

import {PRODUCTS,productColor,type Product} from './data';
export type Sort='featured'|'price-low'|'price-high'|'name';
export function filterProducts(query:string,categories:string[],range:number[],sort:Sort,reverse=false,color='전체'):Product[]{
  let result=PRODUCTS.filter(p=>(!categories.length||categories.includes(p.category))&&(color==='전체'||productColor(p)===color)&&`${p.name} ${p.english} ${p.category}`.toLowerCase().includes(query.toLowerCase().trim())&&p.price>=range[0]&&p.price<=range[1]);
  if(sort==='price-low')result.sort((a,b)=>a.price-b.price);else if(sort==='price-high')result.sort((a,b)=>b.price-a.price);else if(sort==='name')result.sort((a,b)=>a.name.localeCompare(b.name,'ko'));
  if(reverse&&sort==='featured')result=result.reverse();return result;
}
export function updateCart(cart:Record<number,number>,id:number,amount:number):{cart:Record<number,number>;error?:string}{
  const p=PRODUCTS.find(p=>p.id===id);if(!p)return {cart,error:'존재하지 않는 상품입니다.'};
  const q=(cart[id]??0)+amount;if(q>p.stock)return {cart,error:`${p.name}: 재고 ${p.stock}개를 초과했습니다.`};
  const next={...cart};if(q<=0)delete next[id];else next[id]=q;return {cart:next};
}

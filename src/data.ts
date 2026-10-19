export type Category='전체'|'데스크'|'오디오'|'리빙';
export interface Product {id:number;name:string;english:string;category:Category;price:number;color:string;kind:'lamp'|'headphones'|'speaker'|'chair'|'clock'|'vase';tag:string;stock:number;description:string}
export const PRODUCTS:Product[]=[
  {id:1,name:'아크 데스크 램프',english:'Arc desk lamp',category:'데스크',price:89000,color:'#e7eaf8',kind:'lamp',tag:'Best seller',stock:8,description:'빛의 방향을 자유롭게. 작업 공간을 부드러운 빛으로 채우는 조명.'},
  {id:2,name:'폼 무선 헤드폰',english:'Form headphones',category:'오디오',price:159000,color:'#e4eee9',kind:'headphones',tag:'New',stock:5,description:'몰입이 필요한 순간을 위한 균형 잡힌 사운드와 가벼운 착용감.'},
  {id:3,name:'오브 미니 스피커',english:'Orb mini speaker',category:'오디오',price:69000,color:'#f6eade',kind:'speaker',tag:'Popular',stock:12,description:'작은 구체에 담긴 풍성한 소리. 책상 위 작은 음악의 시작.'},
  {id:4,name:'루프 라운지 체어',english:'Loop lounge chair',category:'리빙',price:249000,color:'#e6e8ee',kind:'chair',tag:'Limited',stock:2,description:'몸의 곡선을 따르는 구조와 편안한 질감. 나만의 휴식 공간.'},
  {id:5,name:'모멘트 탁상시계',english:'Moment desk clock',category:'데스크',price:45000,color:'#eee7f2',kind:'clock',tag:'New',stock:9,description:'시간을 읽는 새로운 방식. 단정한 숫자와 조용한 움직임.'},
  {id:6,name:'플로 세라믹 화병',english:'Flow ceramic vase',category:'리빙',price:38000,color:'#e6eeed',kind:'vase',tag:'Restock',stock:7,description:'손끝으로 느껴지는 매트한 질감과 자연스러운 선의 조화.'},
];
export const won=(n:number)=>new Intl.NumberFormat('ko-KR',{style:'currency',currency:'KRW',maximumFractionDigits:0}).format(n);
export const PRODUCT_COLORS=['라벤더','그린','샌드','그레이'] as const;
export function productColor(p:Product){return ({1:'라벤더',2:'그린',3:'샌드',4:'그레이',5:'라벤더',6:'그린'} as Record<number,string>)[p.id];}

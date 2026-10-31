const decimal=new Intl.NumberFormat('pt-PT',{maximumFractionDigits:1});
export function formatCount(value:number):string{
 if(value<1000)return String(value);
 const thousands=Math.round(value/100)/10;
 return thousands>=1000?`${decimal.format(value/1000000)}M`:`${decimal.format(thousands)}K`;
}

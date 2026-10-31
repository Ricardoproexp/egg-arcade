import {createFileRoute} from '@tanstack/react-router';
export const Route=createFileRoute('/pesquisar')({validateSearch:(search:Record<string,unknown>)=>({q:typeof search['q']==='string'?search['q'].slice(0,100):''}),head:()=>({meta:[{title:'Pesquisar utilizadores · Egg Arcade'}]}),component:()=>null});

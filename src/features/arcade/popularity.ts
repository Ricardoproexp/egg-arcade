import {accountKey} from './account-storage';
import { useEffect, useState } from 'react';
export const POPULARITY_POINTS = { comment: 1, minute: 1, gift: 10 } as const;
const KEY='omlet-live-popularity-v1';
export function parsePopularity(raw:string|null):Record<string,number>{
 try{const data=JSON.parse(raw??'{}');if(!data||typeof data!=='object'||Array.isArray(data))return {};return Object.fromEntries(Object.entries(data).filter(([id,v])=>/^s[0-4]$/.test(id)&&Number.isSafeInteger(v)&&Number(v)>=0)) as Record<string,number>;}catch{return {}}
}
export function rankLives<T extends {id:string;audience:number;popularity:number}>(lives:T[],extra:Record<string,number>){
 return [...lives].sort((a,b)=>(b.audience+b.popularity+(extra[b.id]??0))-(a.audience+a.popularity+(extra[a.id]??0))||a.id.localeCompare(b.id));
}
export function usePopularity(){
 const [key]=useState(()=>accountKey(KEY));
 const [extra,setExtra]=useState<Record<string,number>>(()=>{try{return parsePopularity(localStorage.getItem(key))}catch{return {}}});
 const [saveError,setSaveError]=useState(false);
 useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(extra));setSaveError(false)}catch{setSaveError(true)}},[extra]);
 const award=(id:string,event:keyof typeof POPULARITY_POINTS)=>setExtra(s=>({...s,[id]:Math.min(Number.MAX_SAFE_INTEGER,(s[id]??0)+POPULARITY_POINTS[event])}));
 return {extra,award,saveError};
}

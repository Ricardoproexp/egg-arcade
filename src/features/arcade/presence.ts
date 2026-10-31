import {useEffect,useState} from 'react';
import {readAccounts,readSession} from './accounts';

const PREFIX='arcade-presence-v1:';
const CHANGED='arcade-presence-changed';
const TTL=90_000;

// Presence is shared between tabs of this browser, like the local account registry.
export function isAccountOnline(id:string|undefined,now=Date.now()):boolean{
 if(!id)return false;
 try{
  const account=readAccounts().find(a=>`account:${a.id}`===id);
  if(!account)return false;
  for(let i=0;i<localStorage.length;i++){
   const key=localStorage.key(i);
   if(!key?.startsWith(PREFIX))continue;
   try{
    const entry=JSON.parse(localStorage.getItem(key)??'null');
    if(entry?.id===account.id&&entry.revision===account.revision&&typeof entry.at==='number'&&now-entry.at>=0&&now-entry.at<TTL)return true;
   }catch{/* Ignore a malformed presence record. */}
  }
 }catch{/* Unavailable storage cannot confirm presence. */}
 return false;
}
export function usePublishPresence(){
 useEffect(()=>{
  const key=PREFIX+crypto.randomUUID();
  function clear(){try{localStorage.removeItem(key)}catch{}window.dispatchEvent(new Event(CHANGED))}
  function heartbeat(){
   try{
    const session=readSession();
    if(!session||!navigator.onLine){clear();return}
    localStorage.setItem(key,JSON.stringify({id:session.id,revision:session.revision,at:Date.now()}));
    window.dispatchEvent(new Event(CHANGED));
   }catch{clear()}
  }
  heartbeat();const timer=setInterval(heartbeat,20_000);
  window.addEventListener('online',heartbeat);window.addEventListener('offline',clear);
  window.addEventListener('pagehide',clear);window.addEventListener('pageshow',heartbeat);
  return()=>{clearInterval(timer);window.removeEventListener('online',heartbeat);window.removeEventListener('offline',clear);window.removeEventListener('pagehide',clear);window.removeEventListener('pageshow',heartbeat);clear()};
 },[]);
}
export function useAccountOnline(id:string|undefined){
 const [online,setOnline]=useState(()=>isAccountOnline(id));
 useEffect(()=>{
  const refresh=()=>setOnline(isAccountOnline(id));
  refresh();const timer=setInterval(refresh,10_000);
  window.addEventListener('storage',refresh);window.addEventListener(CHANGED,refresh);
  return()=>{clearInterval(timer);window.removeEventListener('storage',refresh);window.removeEventListener(CHANGED,refresh)};
 },[id]);
 return online;
}

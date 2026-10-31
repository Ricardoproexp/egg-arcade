import {useRouter} from '@tanstack/react-router';
import type {ReactNode} from 'react';
export function BackLink({fallback='/',className='',children,'aria-label':label='Voltar'}:{fallback?:string;className?:string;children:ReactNode;'aria-label'?:string}){
 const router=useRouter();
 return <a href={fallback} className={className} aria-label={label} onClick={event=>{
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  if(router.history.canGoBack())router.history.back();
  else void router.navigate({href:fallback,replace:true});
 }}>{children}</a>;
}

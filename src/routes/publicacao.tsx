import {createFileRoute} from '@tanstack/react-router';
export const Route=createFileRoute('/publicacao')({
 validateSearch:(search:Record<string,unknown>):{post?:string|undefined}=>({post:typeof search['post']==='string'?search['post']:undefined}),
 head:()=>({meta:[{title:'Publicação · Egg Arcade'},{name:'description',content:'Publicação e comentários da comunidade.'}]}),
 component:()=>null,
});

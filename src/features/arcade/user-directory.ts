import {readAccounts,readSession} from './accounts';
import {STORAGE_KEY,type Post} from './store';
import {streams} from './media';
export type PublicUser={id:string;name:string;username:string;avatar?:string|undefined;banner?:string|undefined;bio:string;game:string;posts:Post[]};
export function localUsers():PublicUser[]{
 return readAccounts().map(readPublicAccount);
}
function readPublicAccount(account:ReturnType<typeof readAccounts>[number]):PublicUser{
  let data:any={};try{data=JSON.parse(localStorage.getItem(`${STORAGE_KEY}:account:${account.id}`)??'{}')}catch{}
  const profile=data?.profile??{};
  const safeImage=(value:unknown)=>typeof value==='string'&&/^data:image\/(jpeg|png|webp);base64,/.test(value)?value:undefined;
  return {id:`account:${account.id}`,name:typeof profile.name==='string'?profile.name:account.username,username:account.username,avatar:safeImage(profile.avatar),banner:safeImage(profile.banner),bio:typeof profile.bio==='string'?profile.bio:'',game:typeof profile.game==='string'?profile.game:'',posts:Array.isArray(data.posts)?data.posts.filter((p:Post)=>p.own&&typeof p.id==='string'&&typeof p.text==='string').map((p:Post)=>({...p,id:`account:${account.id}:${p.id}`,author:account.username,handle:account.username,own:false})):[]};
}
export function publicUsers():PublicUser[]{return [...localUsers(),...streams.map(s=>({id:s.id,name:s.creator,username:s.creator.toLowerCase().replace(/\s+/g,''),avatar:s.avatar,banner:s.image,bio:s.description,game:s.game,posts:[]}))]}
export function findLocalUser(id:string|undefined){if(!id)return undefined;try{const account=readAccounts().find(a=>`account:${a.id}`===id||a.username===id.replace(/^name:/,''));return account?readPublicAccount(account):undefined}catch{return undefined}}
export function publicPost(id:string|undefined){if(!id?.startsWith('account:'))return undefined;try{const account=readAccounts().find(a=>id.startsWith(`account:${a.id}:`));return account?readPublicAccount(account).posts.find(p=>p.id===id):undefined}catch{return undefined}}
export function isMyPublicProfile(id:string|undefined){try{return id===`account:${readSession()?.id}`}catch{return false}}
export function searchUsers(users:PublicUser[],query:string){const normalize=(v:string)=>v.trim().replace(/^@/,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const q=normalize(query);return q?users.filter(u=>normalize(u.name).includes(q)||normalize(u.username).includes(q)):[]}

import {STORAGE_KEY,type State} from './store';
import {useEffect,useState} from 'react';
import {validGroupPhoto,type Conversation} from './chat-model';
import {readAccounts,readSession} from './accounts';

export const MAX_GROUP_MEMBERS=50;
export type ChatActor={id:string;name:string};
export function chatActor(state:State):ChatActor{
 try{const session=readSession();if(session)return {id:`account:${session.id}`,name:state.profile.name}}catch{}
 return {id:`local:${state.profile.handle}`,name:state.profile.name};
}
export function mutualFriends(state:State){
 const following=[...new Set(state.followed)].filter(name=>!state.blockedChatUsers.includes(name)&&name!==state.profile.name&&name!==state.profile.handle);
 let accounts:ReturnType<typeof readAccounts>=[];let ownUsername=state.profile.handle;
 try{accounts=readAccounts();ownUsername=readSession()?.name??ownUsername}catch{}
 return following.filter(name=>{
  const account=accounts.find(a=>a.username===name);
  if(!account)return state.followers.includes(name);
  try{
   const other=JSON.parse(localStorage.getItem(`${STORAGE_KEY}:account:${account.id}`)??'null');
   return Array.isArray(other?.followed)&&other.followed.some((n:unknown)=>n===ownUsername||n===state.profile.handle||n===state.profile.name);
  }catch{return false}
 }).sort((a,b)=>a.localeCompare(b,'pt'));
}
export function useChatFriends(state:State,withoutChats=false){
 const read=()=>withoutChats?newChatFriends(state):mutualFriends(state);
 const [friends,setFriends]=useState(read);
 useEffect(()=>{const refresh=()=>setFriends(read());refresh();window.addEventListener('storage',refresh);return()=>window.removeEventListener('storage',refresh)},[state,withoutChats]);
 return friends;
}
export function newChatFriends(state:State){return mutualFriends(state).filter(name=>!state.conversations.some(t=>t.kind==='private'&&t.members.includes(name)))}
export function matchesContact(name:string,query:string){
 const normalize=(s:string)=>s.trim().replace(/^@/,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 return normalize(name).includes(normalize(query));
}
export function isGroupAdmin(group:Conversation,actor:ChatActor){return group.kind==='group'&&group.createdBy===actor.id}

export function createGroup(state:State,actor:ChatActor,id:string,name:string,members:string[],avatar?:string):State{
 const friends=mutualFriends(state),selected=[...new Set(members)];
 if(!name.trim()||name.trim().length>60||selected.length<2||selected.length>=MAX_GROUP_MEMBERS||selected.some(m=>!friends.includes(m))||state.conversations.some(t=>t.id===id)||(avatar&&!validGroupPhoto(avatar)))return state;
 const group:Conversation={id,name:name.trim(),kind:'group',members:selected,createdBy:actor.id,createdByName:actor.name,accepted:true,hasHistory:false,followsMe:false,messages:[],...(avatar?{avatar}:{})};
 return {...state,conversations:[...state.conversations,group]};
}
export function editGroup(state:State,actor:ChatActor,id:string,changes:{name:string;avatar:string}):State{
 const group=state.conversations.find(t=>t.id===id);
 if(!group||!isGroupAdmin(group,actor)||!changes.name.trim()||changes.name.trim().length>60||(changes.avatar&&!validGroupPhoto(changes.avatar)))return state;
 const updated={...group,name:changes.name.trim()};
 if(changes.avatar)updated.avatar=changes.avatar;else delete updated.avatar;
 return {...state,conversations:state.conversations.map(t=>t.id===id?updated:t)};
}
export function addGroupMembers(state:State,actor:ChatActor,id:string,names:string[]):State{
 const group=state.conversations.find(t=>t.id===id),friends=mutualFriends(state);
 if(!group||!isGroupAdmin(group,actor)||!names.length||names.some(n=>!friends.includes(n)))return state;
 const members=[...new Set([...group.members,...names])];
 if(members.length>=MAX_GROUP_MEMBERS)return state;
 return {...state,conversations:state.conversations.map(t=>t.id===id?{...t,members}:t)};
}
export function removeGroupMember(state:State,actor:ChatActor,id:string,name:string):State{
 const group=state.conversations.find(t=>t.id===id);
 if(!group||!isGroupAdmin(group,actor)||!group.members.includes(name))return state;
 return {...state,conversations:state.conversations.map(t=>t.id===id?{...t,members:t.members.filter(m=>m!==name)}:t)};
}
export function leaveGroup(state:State,actor:ChatActor,id:string):State{
 const group=state.conversations.find(t=>t.id===id);
 if(!group||group.kind!=='group'||isGroupAdmin(group,actor))return state;
 return {...state,conversations:state.conversations.filter(t=>t.id!==id)};
}
export const GROUP_REPORT_REASONS=['Spam ou publicidade','Assédio ou intimidação','Conteúdo impróprio','Fraude ou burla','Outro motivo'] as const;
export function reportGroup(state:State,actor:ChatActor,id:string,reason:string,details:string):State{
 const group=state.conversations.find(t=>t.id===id);
 if(!group||group.kind!=='group'||isGroupAdmin(group,actor)||!GROUP_REPORT_REASONS.some(r=>r===reason))return state;
 return {...state,groupReports:[...(state.groupReports??[]).filter(r=>r.groupId!==id),{groupId:id,groupName:group.name,reason,details:details.trim().slice(0,500),createdAt:new Date().toISOString()}]};
}

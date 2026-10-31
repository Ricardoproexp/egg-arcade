import type {ChatAttachment} from './chat-attachments';
export type ChatMessage={id:string;text:string;author:string;own?:boolean;attachment?:ChatAttachment};
export type Conversation={id:string;name:string;kind:'private'|'group';members:string[];followsMe:boolean;hasHistory:boolean;accepted:boolean;messages:ChatMessage[];createdBy?:string;createdByName?:string;avatar?:string};
export const initialConversations:Conversation[]=[];
export function isMessageRequest(t:Conversation,followed:string[]){
 return !t.accepted && !(t.kind==='private'&&t.followsMe&&t.hasHistory&&followed.includes(t.members[0]??''));
}
export function receiveMessage(threads:Conversation[],sender:string,text:string,followed:string[],blocked:string[],followsMe:boolean):Conversation[]{
 if(blocked.includes(sender)||!text.trim())return threads;
 const found=threads.find(t=>t.kind==='private'&&t.members[0]===sender);
 const msg={id:crypto.randomUUID(),author:sender,text:text.trim().slice(0,1000)};
 if(found)return threads.map(t=>t.id===found.id?{...t,followsMe,messages:[...t.messages,msg]}:t);
 return [...threads,{id:crypto.randomUUID(),name:sender,kind:'private',members:[sender],followsMe,hasHistory:false,accepted:false,messages:[msg]}];
}
export function validGroupPhoto(value:unknown):value is string{return typeof value==='string'&&/^data:image\/(jpeg|png|webp);base64,/.test(value)&&value.length<=3_000_000}
export function cleanConversations(value:unknown):Conversation[]{
 if(!Array.isArray(value))return structuredClone(initialConversations);
 return value.filter((t):t is Conversation=>!!t&&typeof t.id==='string'&&typeof t.name==='string'&&['private','group'].includes(t.kind)&&Array.isArray(t.members)&&(t.kind==='group'||t.members.length>0)&&t.members.every((m:unknown)=>typeof m==='string')&&typeof t.followsMe==='boolean'&&typeof t.hasHistory==='boolean'&&typeof t.accepted==='boolean'&&Array.isArray(t.messages)&&t.messages.every((m:ChatMessage)=>!!m&&typeof m.id==='string'&&typeof m.text==='string'&&typeof m.author==='string'&&(m.own===undefined||typeof m.own==='boolean'))).map(t=>{
 const clean={...t,members:[...new Set(t.members)]};
 if(typeof clean.createdBy!=='string')delete clean.createdBy;
 if(typeof clean.createdByName!=='string')delete clean.createdByName;
 if(!validGroupPhoto(clean.avatar))delete clean.avatar;
 return clean;
 });
}

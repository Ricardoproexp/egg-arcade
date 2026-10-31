import {cleanReleaseState} from './release-state';
import {accountKey} from './account-storage';
import type {ChatAttachment} from './chat-attachments';
import {initialConversations,cleanConversations,type Conversation} from './chat-model';
import { useEffect, useState } from 'react';
export const games = ['Minecraft', 'PUBG Mobile', 'Free Fire', 'Mobile Legends', 'Roblox'] as const;
export type Post = { id: string; author: string; handle: string; game: string; text: string; image?: string; likes: number; time: string; own?: boolean };
export type Community = { id: string; name: string; game: string; description: string; members: string };
export type Room = { id: string; name: string; game: string };
export type Message = { id: string; text: string; own: boolean; author: string; attachment?: ChatAttachment; replyTo?: string; replyAuthor?: string; gift?: {name:string;handle:string} };
export type State = { groupReports: {groupId:string;groupName:string;reason:string;details:string;createdAt:string}[]; reports: {postId:string;reason:string;createdAt:string}[]; conversations: Conversation[]; blockedChatUsers: string[]; profile: { name: string; handle: string; bio: string; game: string; avatar?: string; banner?: string }; posts: Post[]; liked: string[]; saved: string[]; followed: string[]; followers: string[]; joined: string[]; comments: Record<string, Message[]>; communities: Community[]; rooms: Room[]; messages: Record<string, Message[]>; readNotifications: boolean };
export const defaults: State = {
 groupReports: [], reports: [], conversations: [], blockedChatUsers: [],
 profile: {name:'Player One',handle:'playerone',bio:'',game:'Minecraft'},
 posts: [], liked: [], saved: [], followed: [], followers: [], joined: [], comments: {},
 communities: [], rooms: [], messages: {}, readNotifications:true,
};
export const STORAGE_KEY = 'omlet-recreation-v1';
export function parseState(raw: string | null): State {
 if (!raw) return structuredClone(defaults);
 try { const s = JSON.parse(raw); if (!s || typeof s !== 'object' || !s.profile || typeof s.profile.name !== 'string' || !Array.isArray(s.posts) || !s.posts.every((p: Post) => p && typeof p.id === 'string' && typeof p.text === 'string')) return structuredClone(defaults);
 const result = { ...structuredClone(defaults), ...s, profile: { ...defaults.profile, ...s.profile } } as State;
 for (const k of ['liked','saved','followed','joined','communities','rooms'] as const) if (!Array.isArray(result[k])) return structuredClone(defaults);
 for (const k of ['messages','comments'] as const) if (!result[k] || typeof result[k] !== 'object' || !Object.values(result[k]).every(Array.isArray)) return structuredClone(defaults);
 for(const field of ['avatar','banner'] as const){const value=result.profile[field];if(value!==undefined&&(typeof value!=='string'||!/^data:image\/(jpeg|png|webp);base64,/.test(value)||value.length>3000000))delete result.profile[field];}
 result.reports=Array.isArray(s.reports)?s.reports.filter((r:any)=>r&&typeof r.postId==='string'&&typeof r.reason==='string'&&typeof r.createdAt==='string'):[];
 result.groupReports=Array.isArray(s.groupReports)?s.groupReports.filter((r:any)=>r&&typeof r.groupId==='string'&&typeof r.groupName==='string'&&typeof r.reason==='string'&&typeof r.details==='string'&&typeof r.createdAt==='string'):[];
 result.conversations=cleanConversations(s.conversations);
 result.followers=[...new Set(Array.isArray(s.followers)?s.followers.filter((v:unknown)=>typeof v==='string'):result.conversations.filter(t=>t.kind==='private'&&t.followsMe).flatMap(t=>t.members))] as string[];
 if(s.conversations===undefined){for(const room of result.rooms){const history=result.messages[room.id];if(history?.some(m=>m?.own)&&typeof room.name==='string')result.conversations.push({id:`legacy:${room.id}`,name:room.name,kind:'group',members:[room.name],followsMe:false,hasHistory:true,accepted:true,messages:history});}}

 result.blockedChatUsers=Array.isArray(s.blockedChatUsers)?s.blockedChatUsers.filter((v:unknown)=>typeof v==='string'):[];
 return cleanReleaseState(result); } catch { return structuredClone(defaults); }
}
export function writeState(state: State,key=accountKey(STORAGE_KEY)): boolean { try { localStorage.setItem(key, JSON.stringify(state)); return true; } catch { return false; } }
export const toggle = (items: string[], id: string) => items.includes(id) ? items.filter(x => x !== id) : [...items, id];
export const uid = () => crypto.randomUUID();
export const validImage = (file: Pick<File, 'size' | 'type'>) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && file.size <= 2 * 1024 * 1024;
export function useArcadeStore() {
 const [key]=useState(()=>accountKey(STORAGE_KEY));
 const [state, setState] = useState<State>(() => structuredClone(defaults));
 const [ready, setReady] = useState(false); const [storageError, setStorageError] = useState(false);
 useEffect(() => { try { setState(parseState(localStorage.getItem(key))); } catch { setStorageError(true); } setReady(true); }, []);
 useEffect(() => { if (ready) setStorageError(!writeState(state,key)); }, [state, ready]);
 return { state, setState, storageError };
}

export function deleteOwnPost(state:State,id:string):State{if(!state.posts.some(p=>p.id===id&&p.own))return state;const comments={...state.comments};delete comments[id];return {...state,posts:state.posts.filter(p=>p.id!==id),liked:state.liked.filter(v=>v!==id),saved:state.saved.filter(v=>v!==id),comments};}

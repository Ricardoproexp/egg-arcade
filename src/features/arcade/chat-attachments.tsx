import {accountKey} from './account-storage';
import {useEffect,useState} from 'react';
export type ChatAttachment={id:string;name:string;kind:'image'|'video'};
export const attachmentTypes='image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm';
export function validChatAttachment(file:File){return attachmentTypes.split(',').includes(file.type)&&file.size>0&&file.size<=25*1024*1024}
function openMedia(name=accountKey('arcade-chat-media-v1')):Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const request=indexedDB.open(name,1);request.onupgradeneeded=()=>request.result.createObjectStore('files');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})}
export async function saveChatAttachment(file:File):Promise<ChatAttachment>{
 if(!validChatAttachment(file))throw new Error('Ficheiro inválido');
 const db=await openMedia(),id=crypto.randomUUID();
 try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction('files','readwrite');tx.objectStore('files').put(file,id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}finally{db.close()}
 return {id,name:file.name,kind:file.type.startsWith('image/')?'image':'video'};
}
async function loadMedia(id:string,legacy=false):Promise<Blob>{const db=await openMedia(legacy?'arcade-chat-media-v1':accountKey('arcade-chat-media-v1'));try{return await new Promise((resolve,reject)=>{const request=db.transaction('files','readonly').objectStore('files').get(id);request.onsuccess=()=>request.result instanceof Blob?resolve(request.result):reject(new Error('Ficheiro indisponível'));request.onerror=()=>reject(request.error)})}catch(error){if(!legacy&&localStorage.getItem(accountKey('arcade-legacy-media'))==='true')return loadMedia(id,true);throw error}finally{db.close()}}
export function ChatMedia({attachment,file}:{attachment?:ChatAttachment;file?:File}){
 const [url,setUrl]=useState(''),[failed,setFailed]=useState(false);
 useEffect(()=>{let active=true,objectUrl='';setUrl('');setFailed(false);const source=file?Promise.resolve(file):attachment?loadMedia(attachment.id):Promise.reject();source.then(blob=>{if(active){objectUrl=URL.createObjectURL(blob);setUrl(objectUrl)}}).catch(()=>{if(active)setFailed(true)});return()=>{active=false;if(objectUrl)URL.revokeObjectURL(objectUrl)}},[attachment?.id,file]);
 const name=file?.name??attachment?.name??'Anexo',kind=file?(file.type.startsWith('image/')?'image':'video'):attachment?.kind;
 if(failed)return <small role="status">Este anexo já não está disponível.</small>;
 if(!url)return <small role="status">A carregar anexo…</small>;
 return kind==='video'?<video className="chat-media" src={url} controls playsInline preload="metadata" aria-label={name}/>:<a href={url} target="_blank" rel="noreferrer" aria-label={`Abrir imagem: ${name}`}><img className="chat-media" src={url} alt={name}/></a>;
}

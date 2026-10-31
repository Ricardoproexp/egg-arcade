import {findLocalUser} from './user-directory';
import {useState,type Dispatch,type SetStateAction} from 'react';
import {MessageCircle,Send} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {streams} from './media';
import {UserLink} from './profile-links';
import {followLabel,followAction} from './relationships';
import {type State,uid} from './store';
export type PreviewTarget={name:string;own:boolean;compose?:boolean};
export function ProfilePreview({target,state,setState,close,follow,storageError}:{target:PreviewTarget;state:State;setState:Dispatch<SetStateAction<State>>;close:()=>void;follow:(name:string)=>void;storageError:boolean}){
 const {name,own}=target;
 const [compose,setCompose]=useState(!!target.compose),[draft,setDraft]=useState(''),[sent,setSent]=useState(false);
 const localUser=findLocalUser(name);
 const creator=streams.find(s=>s.creator===name);
 const handle=own?state.profile.handle:state.posts.find(p=>!p.own&&p.author===name)?.handle??name.toLowerCase().replace(/\s+/g,'');
 const photo=own?state.profile.avatar:localUser?.avatar??creator?.avatar;
 const blocked=state.blockedChatUsers.includes(name);
 function send(){const text=draft.trim();if(!text||own||blocked)return;const message={id:uid(),text:text.slice(0,1000),author:state.profile.name,own:true};setState(s=>{
  if(s.blockedChatUsers.includes(name))return s;
  const existing=s.conversations.find(t=>t.kind==='private'&&t.members[0]===name);
  return {...s,conversations:existing?s.conversations.map(t=>t.id===existing.id?{...t,accepted:true,hasHistory:true,messages:[...t.messages,message]}:t):[...s.conversations,{id:uid(),name,kind:'private',members:[name],followsMe:s.followers.includes(name),hasHistory:true,accepted:true,messages:[message]}]};
 });setDraft('');setSent(true)}
 return <Dialog open onOpenChange={open=>{if(!open)close()}}><DialogContent className="arcade-dialog profile-preview"><DialogTitle>Perfil de {name}</DialogTitle><DialogDescription>Consulta o perfil e conversa sem sair desta página.</DialogDescription>
 <div className="profile-preview-identity">{photo?<img src={photo} alt={`Foto de ${name}`}/>:<span className="avatar">{name.slice(0,2).toUpperCase()}</span>}<div><strong>{name}</strong><span>@{handle.replace(/^@+/,'')}</span></div></div>
 <p className="profile-preview-bio">{own?state.profile.bio:localUser?.bio??creator?.description??'Este utilizador ainda não tem uma descrição.'}</p>
 <div className="profile-preview-actions">{!own&&<><Button aria-label={followAction(state,name)} aria-pressed={state.followed.includes(name)} onClick={()=>follow(name)}>{followLabel(state,name)}</Button><Button variant="secondary" disabled={blocked} onClick={()=>setCompose(true)}><MessageCircle/>Mensagem</Button></>}<span onClick={close}><UserLink name={name} own={own}>Ver perfil completo</UserLink></span></div>
 {blocked&&<p role="status">Este utilizador está bloqueado.</p>}
 {compose&&!own&&!blocked&&<form className="profile-preview-compose" onSubmit={e=>{e.preventDefault();send()}}><label>Mensagem para @{handle}<textarea autoFocus aria-label={`Mensagem para ${name}`} value={draft} onChange={e=>{setDraft(e.target.value);setSent(false)}} maxLength={1000} rows={3} required placeholder="Escreve uma mensagem…"/></label><Button type="submit" disabled={!draft.trim()}><Send/>Enviar mensagem</Button></form>}
 {storageError?<p role="alert">Não foi possível guardar as alterações. Tenta novamente.</p>:sent&&<p role="status">Mensagem guardada na conversa com {name}.</p>}
 </DialogContent></Dialog>
}

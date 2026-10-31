import {NewChatPage,type CreateChatMode} from './new-chat-page';
import {GroupDetails} from './group-details';
import {GroupPortrait} from './chat-people';
import {isGroupAdmin,chatActor} from './chat-groups';
import {ChatMedia,attachmentTypes,validChatAttachment,saveChatAttachment} from './chat-attachments';
import {UserLink,UserAvatar} from './profile-links';
import {useEffect,useRef,useState,type Dispatch,type SetStateAction} from 'react';
import {Link} from '@tanstack/react-router';
import {MailOpen,MessageCircle,Hash,Plus,Send,Check,ShieldX,ArrowLeft,ImagePlus,X,MoreHorizontal} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {type State,uid} from './store';
import {isMessageRequest} from './chat-model';
type Tab='messages'|'channels'|'requests';
function messagePreview(text:string){const characters=Array.from(new Intl.Segmenter('pt',{granularity:'grapheme'}).segment(text),part=>part.segment);return characters.slice(0,30).join('')+(characters.length>30?'...':'')}
export function ChatPage({state,setState,search,initialView,rememberView,createMode,onCreateMode,onCreateBack,storageError=false}:{createMode?:CreateChatMode|null;onCreateMode?:(mode:CreateChatMode|null)=>void;onCreateBack?:()=>void;storageError?:boolean;state:State;setState:Dispatch<SetStateAction<State>>;search:string;initialView?:{tab:Tab;selected:string|null};rememberView?:(view:{tab:Tab;selected:string|null})=>void}){
 const [tab,setTab]=useState<Tab>(initialView?.tab??'messages'),[selected,setSelected]=useState<string|null>(initialView?.selected??null),[draft,setDraft]=useState(''),[notice,setNotice]=useState('');
 const [localCreateMode,setLocalCreateMode]=useState<CreateChatMode|null>(null),[groupDetails,setGroupDetails]=useState(false);
 const creating=createMode===undefined?localCreateMode:createMode;
 const setCreating=(mode:CreateChatMode|null)=>{setLocalCreateMode(mode);onCreateMode?.(mode)};
 const end=useRef<HTMLDivElement>(null),page=useRef<HTMLElement>(null),fileInput=useRef<HTMLInputElement>(null);
 const [attachment,setAttachment]=useState<File|null>(null),[uploadError,setUploadError]=useState(''),[sending,setSending]=useState(false);
 useEffect(()=>{rememberView?.({tab,selected})},[tab,selected,rememberView]);
 const activeThread=useRef(selected);activeThread.current=selected;
 useEffect(()=>{setAttachment(null);setUploadError('')},[selected]);
 function chooseAttachment(file?:File){if(!file)return;if(!validChatAttachment(file)){setUploadError('Escolhe uma imagem JPEG, PNG, WebP ou GIF, ou um vídeo MP4/WebM, até 25 MB.');return}setAttachment(file);setUploadError('')}
 const actor=chatActor(state);
 const available=state.conversations.filter(t=>!t.members.some(m=>state.blockedChatUsers.includes(m)));
 const requests=available.filter(t=>isMessageRequest(t,state.followed));
 const q=search.trim().toLocaleLowerCase('pt-PT');
 const joined=state.communities.filter(c=>state.joined.includes(c.id));
 const entries=tab==='channels'?joined.map(c=>({id:`channel:${c.id}`,name:c.name,subtitle:'# geral · comunidade',preview:messagePreview(state.messages[`channel:${c.id}`]?.at(-1)?.text??''),kind:'channel'})):available.filter(t=>tab==='requests'?isMessageRequest(t,state.followed):!isMessageRequest(t,state.followed)).map(t=>({id:t.id,name:t.name,subtitle:t.kind==='group'?`${t.members.length+1} membros${isGroupAdmin(t,actor)?' · És administrador':''}`:'Mensagem privada',preview:messagePreview(t.messages.at(-1)?.text??''),kind:t.kind,avatar:t.avatar}));
 const visible=entries.filter(t=>(t.name+' '+t.subtitle).toLocaleLowerCase('pt-PT').includes(q));
 const entry=entries.find(t=>t.id===selected);
 const thread=state.conversations.find(t=>t.id===entry?.id);
 const request=!!thread&&isMessageRequest(thread,state.followed);
 const messages=entry?.kind==='channel'?(state.messages[entry.id]??[]):thread?.messages??[];
 const fullScreen=!!entry||!!creating;
 useEffect(()=>{
  if(!fullScreen||!page.current)return;
  const element=page.current,viewport=window.visualViewport,previousOverflow=document.body.style.overflow;
  const previousFocus=document.activeElement as HTMLElement|null;
  const update=()=>{element.style.setProperty('--chat-height',`${viewport?.height??window.innerHeight}px`);element.style.setProperty('--chat-top',`${viewport?.offsetTop??0}px`)};
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&!document.querySelector('[role=dialog]')){if(creating){if(creating==='group')setCreating('direct');else if(onCreateBack)onCreateBack();else setCreating(null)}else if(groupDetails)setGroupDetails(false);else setSelected(null)}};
  document.body.style.overflow='hidden';update();
  element.querySelector<HTMLButtonElement>('.chat-flow-header button,.chat-back')?.focus({preventScroll:true});
  viewport?.addEventListener('resize',update);viewport?.addEventListener('scroll',update);window.addEventListener('resize',update);window.addEventListener('keydown',escape);
  return()=>{document.body.style.overflow=previousOverflow;viewport?.removeEventListener('resize',update);viewport?.removeEventListener('scroll',update);window.removeEventListener('resize',update);window.removeEventListener('keydown',escape);element.style.removeProperty('--chat-height');element.style.removeProperty('--chat-top');if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true})};
 },[fullScreen,creating,groupDetails]);
 useEffect(()=>{const log=end.current?.parentElement;if(log)log.scrollTop=log.scrollHeight},[selected,messages.length]);
 function changeTab(next:Tab){setTab(next);setSelected(null);setDraft('');setNotice('')}
 function select(id:string){setSelected(id);setDraft('');setNotice('')}
 function accept(){if(!thread)return;setState(s=>({...s,conversations:s.conversations.map(t=>t.id===thread.id?{...t,accepted:true,hasHistory:true}:t)}));setTab('messages');setNotice('Solicitação aceite. Já podes responder.')}
 function remove(block=false){if(!thread)return;setState(s=>({...s,conversations:s.conversations.filter(t=>t.id!==thread.id),blockedChatUsers:block?[...new Set([...s.blockedChatUsers,...thread.members])]:s.blockedChatUsers}));setSelected(null);setNotice(block?'Utilizador bloqueado.':'Solicitação recusada.')}
 async function send(){const text=draft.trim();if(!entry||request||sending||(!text&&!attachment))return;const id=entry.id;setSending(true);setUploadError('');try{const media=attachment?await saveChatAttachment(attachment):undefined;const message={id:uid(),text:(text||(media?.kind==='video'?'Vídeo':'Imagem')).slice(0,1000),author:state.profile.name,own:true,...(media?{attachment:media}:{})};setState(s=>{
  if(entry.kind==='channel'){if(!s.communities.some(c=>`channel:${c.id}`===id&&s.joined.includes(c.id)))return s;return {...s,messages:{...s.messages,[id]:[...(s.messages[id]??[]),message]}}}
  return {...s,conversations:s.conversations.map(t=>t.id===id&&!isMessageRequest(t,s.followed)&&!t.members.some(m=>s.blockedChatUsers.includes(m))?{...t,hasHistory:true,messages:[...t.messages,message]}:t)};
 });if(activeThread.current===id){setDraft('');setAttachment(null)}}catch{if(activeThread.current===id)setUploadError('Não foi possível guardar o anexo. Verifica o espaço disponível e tenta novamente.')}finally{setSending(false)}}
 function openCreated(id:string){setTab('messages');select(id);setCreating(null)}
 if(creating)return <section ref={page} className="chat-page chat-fullscreen"><NewChatPage state={state} setState={setState} mode={creating} onMode={setCreating} onBack={()=>onCreateBack?onCreateBack():setCreating(null)} onOpen={openCreated} storageError={storageError}/></section>;
 if(groupDetails&&thread?.kind==='group')return <section ref={page} className="chat-page chat-fullscreen"><GroupDetails key={thread.id} group={thread} state={state} setState={setState} storageError={storageError} onBack={()=>setGroupDetails(false)} onLeft={()=>{setGroupDetails(false);setSelected(null);setNotice('Saíste do grupo.')}}/></section>;
 return <section ref={page} className={`chat-page ${fullScreen?'chat-fullscreen':''}`}>
 <div className="page-heading"><div><h1>Chat</h1><p>A tua equipa. As tuas conversas.</p></div><Button aria-label="Criar Chat" onClick={()=>setCreating('direct')}><Plus/>Criar Chat</Button></div>
 <div className="chat-tabs" role="tablist" aria-label="Categorias do chat">{([{id:'messages',label:'Mensagens',icon:MessageCircle},{id:'channels',label:'Canais',icon:Hash},{id:'requests',label:'Solicitações de mensagem',icon:MailOpen}] as const).map(t=><button key={t.id} id={`chat-tab-${t.id}`} role="tab" aria-selected={tab===t.id} aria-controls="chat-panel" tabIndex={tab===t.id?0:-1} className={tab===t.id?'active':''} title={t.label} aria-label={t.label} onClick={()=>changeTab(t.id)} onKeyDown={e=>{const tabs:Tab[]=['messages','channels','requests'];if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?tabs[0]:e.key==='End'?tabs[2]:tabs[(tabs.indexOf(t.id)+(e.key==='ArrowRight'?1:2))%3];changeTab(next!);document.getElementById(`chat-tab-${next}`)?.focus()}}}><t.icon/><span>{t.id==='requests'?'Solicitações':t.label}</span>{t.id==='requests'&&requests.length>0&&<span className="request-count">{requests.length}</span>}</button>)}</div>
 {tab==='requests'&&<p className="request-explanation">Sem seguimento dos dois lados ou sem conversa anterior, as mensagens ficam aqui. Aceita uma solicitação para permitir a conversa.</p>}
 {storageError&&<p role="alert" className="chat-flow-error">Não foi possível guardar as alterações. Tenta novamente.</p>}
 {notice&&<p className="local-note" role="status">{notice}</p>}
 <div id="chat-panel" role="tabpanel" aria-labelledby={`chat-tab-${tab}`} className={`chat-workspace ${entry?'has-selection':''}`}>
 <div className="conversation-list" aria-label={tab==='channels'?'Canais das tuas comunidades':tab==='requests'?'Solicitações':'Conversas'}>{visible.map(t=><div key={t.id} className={`conversation-entry ${selected===t.id?'active':''}`}>{t.kind==='private'?<UserAvatar name={t.name}/>:t.kind==='group'?<GroupPortrait name={t.name} photo={'avatar' in t&&typeof t.avatar==='string'?t.avatar:undefined}/>:<span className="conversation-avatar"><Hash/></span>}<span>{t.kind==='private'?<strong><UserLink name={t.name}/></strong>:<strong>{t.name}</strong>}<button className="conversation-open" aria-label={`Abrir conversa: ${t.name}`} aria-pressed={selected===t.id} onClick={()=>select(t.id)}><small className="conversation-preview">{t.preview||'Ainda sem mensagens'}</small></button></span></div>)}{!visible.length&&<div className="chat-empty"><MailOpen/><h3>{q?'Sem resultados':tab==='channels'?'Ainda não entraste em comunidades':tab==='requests'?'Sem solicitações':'Ainda não tens conversas'}</h3><p>{q?'Experimenta outra pesquisa.':tab==='channels'?'Entra numa comunidade para veres o seu canal aqui.':tab==='requests'?'Novas solicitações vão aparecer aqui.':'Cria uma conversa privada ou um grupo.'}</p>{tab==='channels'&&!q&&<Link to="/comunidades">Explorar comunidades</Link>}</div>}</div>
 <section className="conversation-pane">{entry?<><header><Button variant="ghost" size="icon" className="chat-back" aria-label="Voltar à lista de conversas" onClick={()=>setSelected(null)}><ArrowLeft/></Button>{entry.kind==='private'?<UserAvatar name={entry.name}/>:entry.kind==='group'?<GroupPortrait name={entry.name} photo={thread?.avatar}/>:<span className="conversation-avatar"><Hash/></span>}<div><strong>{entry.kind==='private'?<UserLink name={entry.name}/>:entry.name}</strong><small>{entry.subtitle}</small></div>{entry.kind==='group'&&<Button variant="ghost" size="icon" aria-label="Detalhes do grupo" onClick={()=>setGroupDetails(true)}><MoreHorizontal/></Button>}</header><div className="conversation-messages">{messages.map(m=><div key={m.id} className={`chat-message ${m.own?'own':''}`}><small><UserLink name={m.author} own={!!m.own}/></small><p>{m.text}</p>{m.attachment&&<ChatMedia attachment={m.attachment}/>}</div>)}{!messages.length&&<p className="local-note">Ainda não há mensagens. Começa a conversa.</p>}<div ref={end}/></div>{!request&&attachment&&<div className="chat-attachment-preview"><ChatMedia file={attachment}/><span>{attachment.name}</span><Button variant="ghost" size="icon" aria-label="Remover anexo" disabled={sending} onClick={()=>setAttachment(null)}><X/></Button></div>}{uploadError&&<p className="chat-upload-error" role="alert">{uploadError}</p>}{request?<div className="request-actions"><Button onClick={accept}><Check/>Aceitar</Button><Button variant="secondary" onClick={()=>remove()}>Recusar</Button><Button variant="outline" onClick={()=>remove(true)}><ShieldX/>Bloquear</Button></div>:<form className="message-form" onSubmit={e=>{e.preventDefault();send()}}><input ref={fileInput} type="file" accept={attachmentTypes} aria-label="Selecionar imagem ou vídeo" hidden onChange={e=>{chooseAttachment(e.target.files?.[0]);e.target.value=''}}/><Button type="button" variant="ghost" size="icon" aria-label="Adicionar imagem ou vídeo" disabled={sending} onClick={()=>fileInput.current?.click()}><ImagePlus/></Button><input aria-label="Mensagem" value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Escreve uma mensagem…" maxLength={1000}/><Button type="submit" size="icon" aria-label="Enviar mensagem" disabled={sending||(!draft.trim()&&!attachment)}><Send/></Button></form>}</>:<div className="chat-empty"><MessageCircle/><h3>{tab==='channels'?'Escolhe um canal':tab==='requests'?'Escolhe uma solicitação':'Escolhe uma conversa'}</h3><p>As mensagens aparecem aqui.</p></div>}</section>
 </div>

 </section>
}

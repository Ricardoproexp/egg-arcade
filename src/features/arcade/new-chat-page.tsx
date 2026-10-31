import {useEffect,useRef,useState,type Dispatch,type SetStateAction} from 'react';
import {ArrowLeft,Users,Plus,ArrowRight,X,ShieldCheck,MessageCircle} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useChatFriends,newChatFriends,createGroup,chatActor,MAX_GROUP_MEMBERS} from './chat-groups';
import {PeopleSearch,PeopleList,PhotoPicker} from './chat-people';
import {readGroupPhoto} from './group-photo';
import {uid,type State} from './store';
export type CreateChatMode='direct'|'group';
export function NewChatPage({state,setState,mode,onMode,onBack,onOpen,storageError=false}:{state:State;setState:Dispatch<SetStateAction<State>>;mode:CreateChatMode;onMode:(mode:CreateChatMode)=>void;onBack:()=>void;onOpen:(id:string)=>void;storageError?:boolean}){
 const [query,setQuery]=useState(''),[selected,setSelected]=useState<string[]>([]),[name,setName]=useState(''),[photo,setPhoto]=useState(''),[pending,setPending]=useState(false),[error,setError]=useState('');
 const version=useRef(0),opening=useRef(false);
 useEffect(()=>()=>{version.current++},[]);
 const friends=useChatFriends(state,mode==='direct');
 const members=selected.filter(person=>friends.includes(person));
 function changeMode(next:CreateChatMode){setQuery('');setError('');onMode(next)}
 async function upload(file:File){const current=++version.current;setPending(true);setError('');try{const image=await readGroupPhoto(file);if(current===version.current)setPhoto(image)}catch(e){if(current===version.current)setError((e as Error).message)}finally{if(current===version.current)setPending(false)}}
 function select(person:string){
  if(mode==='group'){setSelected(old=>old.includes(person)?old.filter(n=>n!==person):[...old,person]);return}
  if(opening.current||!newChatFriends(state).includes(person))return;opening.current=true;
  const id=uid();setState(s=>newChatFriends(s).includes(person)?{...s,conversations:[...s.conversations,{id,name:person,kind:'private',members:[person],accepted:true,hasHistory:false,followsMe:true,messages:[]}]}:s);onOpen(id);
 }
 function submit(){
  const id=uid(),actor=chatActor(state);
  if(opening.current||pending||storageError)return;
  if(createGroup(state,actor,id,name,members,photo)===state){setError('Escolhe pelo menos 2 amigos e um nome para o grupo.');return}
  opening.current=true;setState(s=>createGroup(s,actor,id,name,members,photo));onOpen(id);
 }
 return <section className="chat-flow-page" aria-label={mode==='group'?'Criar grupo':'Criar Chat'}>
  <header className="chat-flow-header"><Button variant="ghost" size="icon" aria-label={mode==='group'?'Voltar a Criar Chat':'Voltar ao Chat'} onClick={()=>mode==='group'?changeMode('direct'):onBack()}><ArrowLeft/></Button><div><h1>{mode==='group'?'Criar grupo':'Criar Chat'}</h1><p>{mode==='group'?'Junta a tua equipa.':'Uma boa conversa começa aqui.'}</p></div>{mode==='direct'&&<Button variant="outline" className="create-group-top" onClick={()=>changeMode('group')}><Users/>Criar grupo</Button>}</header>
  <div className="chat-flow-search"><PeopleSearch value={query} onChange={setQuery}/></div>
  {storageError&&<p className="chat-flow-error" role="alert">Não foi possível guardar as alterações. Tenta novamente.</p>}
  <div className="chat-flow-body">
   {mode==='group'&&<div className="group-setup-card"><PhotoPicker name={name} photo={photo} pending={pending} onUpload={upload} onRemove={()=>setPhoto('')}/><label className="chat-field">Nome do grupo<span><input aria-label="Nome do grupo" value={name} maxLength={60} placeholder="Ex.: Squad da noite" onChange={e=>setName(e.target.value)}/><small>{name.length}/60</small></span></label><p className="group-role-note"><ShieldCheck/>Serás o administrador deste grupo.</p></div>}
   <div className="chat-people-heading"><h2>{mode==='group'?'Escolhe os membros':'Os teus amigos'}</h2><span>{mode==='group'?`${members.length} selecionados`:friends.length}</span></div>
   {mode==='group'&&members.length>0&&<div className="selected-friends" aria-label="Membros selecionados">{members.map(person=><button type="button" key={person} onClick={()=>select(person)} aria-label={`Desselecionar ${person}`}>{person}<X/></button>)}</div>}
   {mode==='direct'&&<p className="chat-section-hint">Amigos com quem ainda não tens uma conversa.</p>}
   <PeopleList people={friends} query={query} selected={members} multiple={mode==='group'} limitReached={members.length>=MAX_GROUP_MEMBERS-1} onSelect={select} empty={mode==='group'?'A tua equipa começa com amigos':'Sem novas conversas por iniciar'}/>
  </div>
  {mode==='group'?<footer className="chat-flow-footer">{error&&<p role="alert">{error}</p>}<p>{members.length<2?'Seleciona pelo menos 2 amigos.':`${members.length+1} membros, incluindo tu · máximo ${MAX_GROUP_MEMBERS}`}</p><Button onClick={submit} disabled={pending||storageError||!name.trim()||members.length<2}><Plus/>{pending?'A preparar foto…':'Criar grupo'}<ArrowRight/></Button></footer>:<footer className="chat-flow-footer chat-flow-footnote"><MessageCircle/><span>As tuas conversas existentes continuam na página Chat.</span></footer>}
 </section>;
}

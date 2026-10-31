import {useEffect,useRef,useState,type Dispatch,type SetStateAction} from 'react';
import {ArrowLeft,ShieldCheck,UserPlus,LogOut,Flag,UserMinus,Check,Users} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {type State} from './store';
import {type Conversation} from './chat-model';
import {chatActor,isGroupAdmin,editGroup,useChatFriends,addGroupMembers,removeGroupMember,leaveGroup,reportGroup,GROUP_REPORT_REASONS,MAX_GROUP_MEMBERS} from './chat-groups';
import {ContactPortrait,GroupPortrait,PeopleSearch,PeopleList,PhotoPicker} from './chat-people';
import {readGroupPhoto} from './group-photo';
export function GroupDetails({group,state,setState,onBack,onLeft,storageError=false}:{group:Conversation;state:State;setState:Dispatch<SetStateAction<State>>;onBack:()=>void;onLeft:()=>void;storageError?:boolean}){
 const actor=chatActor(state),admin=isGroupAdmin(group,actor);
 const [name,setName]=useState(group.name),[photo,setPhoto]=useState(group.avatar??''),[pending,setPending]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [adding,setAdding]=useState(false),[query,setQuery]=useState(''),[selected,setSelected]=useState<string[]>([]);
 const [confirm,setConfirm]=useState<{kind:'remove';name:string}|{kind:'leave'}|null>(null),[reporting,setReporting]=useState(false),[reason,setReason]=useState<string>(GROUP_REPORT_REASONS[0]),[details,setDetails]=useState('');
 const version=useRef(0);useEffect(()=>()=>{version.current++},[]);
 const candidates=useChatFriends(state).filter(n=>!group.members.includes(n));
 const chosen=selected.filter(n=>candidates.includes(n));
 const changed=name.trim()!==group.name||photo!==(group.avatar??'');
 async function upload(file:File){const current=++version.current;setPending(true);setError('');try{const value=await readGroupPhoto(file);if(current===version.current)setPhoto(value)}catch(e){if(current===version.current)setError((e as Error).message)}finally{if(current===version.current)setPending(false)}}
 function save(){if(pending||!admin||storageError)return;const changes={name,avatar:photo};if(editGroup(state,actor,group.id,changes)===state){setError('Escreve um nome válido para o grupo.');return}setState(s=>editGroup(s,actor,group.id,changes));setError('');setNotice('Grupo atualizado.')}
 function add(){if(storageError||!chosen.length)return;setState(s=>addGroupMembers(s,actor,group.id,chosen));setAdding(false);setSelected([]);setQuery('');setNotice('Membros adicionados.')}
 function confirmAction(){
  if(!confirm||storageError)return;
  if(confirm.kind==='leave'){setState(s=>leaveGroup(s,actor,group.id));setConfirm(null);onLeft()}
  else{const member=confirm.name;setState(s=>removeGroupMember(s,actor,group.id,member));setConfirm(null);setNotice(`${member} foi removido do grupo.`)}
 }
 function submitReport(){if(storageError)return;setState(s=>reportGroup(s,actor,group.id,reason,details));setReporting(false);setNotice('Registo guardado. O serviço de moderação está indisponível.')}
 return <section className="chat-flow-page group-details-page" aria-label={adding?'Adicionar membros':'Detalhes do grupo'}>
  <header className="chat-flow-header"><Button variant="ghost" size="icon" aria-label={adding?'Voltar aos detalhes':'Voltar à conversa'} onClick={()=>adding?setAdding(false):onBack()}><ArrowLeft/></Button><div><h1>{adding?'Adicionar membros':'O teu grupo'}</h1><p>{adding?`${group.members.length+1}/${MAX_GROUP_MEMBERS} membros`:admin?'Um espaço para a tua equipa.':'Conversas, jogos e bons momentos.'}</p></div>{!adding&&admin&&<span className="group-admin-tag"><ShieldCheck/>Admin</span>}</header>
  {adding&&<div className="chat-flow-search"><PeopleSearch value={query} onChange={setQuery}/></div>}
  {storageError&&<p role="alert" className="chat-flow-error">Não foi possível guardar as alterações. Tenta novamente.</p>}
  <div className="chat-flow-body">
   {adding?<><div className="chat-people-heading"><h2>Convidar amigos</h2><span>{chosen.length} selecionados</span></div><PeopleList people={candidates} query={query} selected={chosen} multiple limitReached={chosen.length+group.members.length+1>=MAX_GROUP_MEMBERS} onSelect={person=>setSelected(old=>old.includes(person)?old.filter(n=>n!==person):[...old,person])} empty="Todos os amigos disponíveis já estão no grupo"/></>:<>
    {admin?<form className="group-setup-card" onSubmit={e=>{e.preventDefault();save()}}><PhotoPicker name={name} photo={photo} pending={pending} onUpload={upload} onRemove={()=>setPhoto('')}/><label className="chat-field">Nome do grupo<span><input aria-label="Nome do grupo" value={name} maxLength={60} required onChange={e=>setName(e.target.value)}/><small>{name.length}/60</small></span></label><Button type="submit" disabled={!changed||!name.trim()||pending||storageError}><Check/>Guardar alterações</Button>{error&&<p role="alert">{error}</p>}</form>:<div className="group-identity-card"><GroupPortrait name={group.name} photo={group.avatar}/><h2>{group.name}</h2><span>{group.members.length+1} membros</span></div>}
    {notice&&!storageError&&<p role="status" className="group-notice">{notice}</p>}
    <div className="chat-people-heading"><h2>Membros <span>{group.members.length+1}</span></h2>{admin&&<Button variant="ghost" disabled={group.members.length+1>=MAX_GROUP_MEMBERS} onClick={()=>{setAdding(true);setNotice('')}}><UserPlus/>Adicionar</Button>}</div>
    <div className="group-member-list"><div className="group-member-row"><ContactPortrait name={state.profile.name}/><span><strong>Tu</strong><small>{admin?'Criador do grupo':'Membro'}</small></span>{admin&&<span className="group-admin-tag"><ShieldCheck/>Admin</span>}</div>{group.members.map(person=><div key={person} className="group-member-row"><ContactPortrait name={person}/><span><strong>{person}</strong><small>{!admin&&person===group.createdByName?'Administrador':'Membro'}</small></span>{!admin&&person===group.createdByName?<span className="group-admin-tag"><ShieldCheck/>Admin</span>:admin?<Button variant="ghost" size="icon" aria-label={`Remover ${person} do grupo`} onClick={()=>setConfirm({kind:'remove',name:person})}><UserMinus/></Button>:null}</div>)}</div>
    {admin?<p className="group-role-note"><ShieldCheck/>Só tu podes editar este grupo e gerir os seus membros.</p>:<div className="group-member-actions"><Button variant="outline" onClick={()=>setReporting(true)}><Flag/>Denunciar grupo</Button><Button variant="outline" className="group-danger" onClick={()=>setConfirm({kind:'leave'})}><LogOut/>Sair do grupo</Button></div>}
   </>}
  </div>
  {adding&&<footer className="chat-flow-footer"><p>{chosen.length?'Os amigos selecionados serão adicionados ao grupo.':'Seleciona quem queres convidar.'}</p><Button disabled={!chosen.length||storageError} onClick={add}><UserPlus/>Adicionar{chosen.length?` (${chosen.length})`:''}</Button></footer>}
  <Dialog open={!!confirm} onOpenChange={open=>{if(!open)setConfirm(null)}}><DialogContent className="arcade-dialog group-confirm"><DialogTitle>{confirm?.kind==='leave'?'Sair do grupo?':`Remover ${confirm?.kind==='remove'?confirm.name:''}?`}</DialogTitle><DialogDescription>{confirm?.kind==='leave'?'A conversa será removida da tua lista.':`Este membro deixará de fazer parte de ${group.name}. Podes adicioná-lo novamente mais tarde.`}</DialogDescription><div className="group-confirm-actions"><Button variant="outline" onClick={()=>setConfirm(null)}>Cancelar</Button><Button className="group-danger-solid" disabled={storageError} onClick={confirmAction}>{confirm?.kind==='leave'?'Sair do grupo':'Remover membro'}</Button></div></DialogContent></Dialog>
  <Dialog open={reporting} onOpenChange={setReporting}><DialogContent className="arcade-dialog"><DialogTitle>Denunciar grupo</DialogTitle><DialogDescription>O serviço de moderação está indisponível. Podes guardar um registo da ocorrência.</DialogDescription><form className="arcade-form group-report-form" onSubmit={e=>{e.preventDefault();submitReport()}}><label>Motivo<select value={reason} onChange={e=>setReason(e.target.value)}>{GROUP_REPORT_REASONS.map(r=><option key={r}>{r}</option>)}</select></label><label>Mais detalhes (opcional)<textarea value={details} onChange={e=>setDetails(e.target.value)} maxLength={500} rows={3} placeholder="Conta-nos o que aconteceu…"/></label><Button type="submit" disabled={storageError}><Flag/>Guardar registo</Button></form></DialogContent></Dialog>
 </section>;
}

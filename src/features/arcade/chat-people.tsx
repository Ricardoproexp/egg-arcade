import {useMemo} from 'react';
import {Users,Search,UserRound,Check,ChevronRight,Camera,X} from 'lucide-react';
import {findLocalUser} from './user-directory';
import {streams} from './media';
import {matchesContact} from './chat-groups';
import {Button} from '@/components/ui/button';
export function ContactPortrait({name}:{name:string}){
 const photo=useMemo(()=>findLocalUser(name)?.avatar??streams.find(s=>s.creator===name)?.avatar,[name]);
 return photo?<img className="chat-person-photo" src={photo} alt=""/>:<span className="chat-person-photo initials" aria-hidden="true">{name.slice(0,2).toUpperCase()}</span>;
}
export function GroupPortrait({name,photo}:{name:string;photo?:string|undefined}){return photo?<img className="chat-group-photo" src={photo} alt={`Foto de ${name}`}/>:<span className="chat-group-photo" aria-hidden="true"><Users/></span>}
export function PeopleSearch({value,onChange}:{value:string;onChange:(value:string)=>void}){return <label className="chat-people-search"><Search aria-hidden="true"/><input type="search" aria-label="Pesquisar amigos" placeholder="Pesquisar por nome ou @username" value={value} maxLength={100} onChange={e=>onChange(e.target.value)}/>{value&&<button type="button" aria-label="Limpar pesquisa de amigos" onClick={()=>onChange('')}><X/></button>}</label>}
export function PeopleList({people,query,selected,onSelect,multiple=false,limitReached=false,empty='Ainda não há amigos disponíveis.'}:{people:string[];query:string;selected:string[];onSelect:(name:string)=>void;multiple?:boolean;limitReached?:boolean;empty?:string}){
 const filtered=people.filter(name=>matchesContact(name,query));
 return <div className="chat-people-list">{filtered.map(name=><button type="button" key={name} className={`chat-person-row ${selected.includes(name)?'selected':''}`} role={multiple?'checkbox':undefined} aria-checked={multiple?selected.includes(name):undefined} aria-label={multiple?name:`Conversar com ${name}`} disabled={multiple&&limitReached&&!selected.includes(name)} onClick={()=>onSelect(name)}><ContactPortrait name={name}/><span className="chat-person-name"><strong>{name}</strong><small>Seguem-se mutuamente</small></span>{multiple?<span className="chat-person-check" aria-hidden="true">{selected.includes(name)&&<Check/>}</span>:<ChevronRight aria-hidden="true"/>}</button>)}{!filtered.length&&<div className="chat-people-empty"><UserRound/><h3>{query?'Nenhum amigo encontrado':empty}</h3><p>{query?'Experimenta outro nome.':'Os amigos aparecem aqui quando se seguem um ao outro.'}</p></div>}</div>;
}
export function PhotoPicker({name,photo,pending,onUpload,onRemove}:{name:string;photo:string;pending:boolean;onUpload:(file:File)=>void;onRemove:()=>void}){return <div className="group-photo-picker"><label className="group-photo-upload"><GroupPortrait name={name||'grupo'} photo={photo}/><span className="group-photo-badge"><Camera/></span><input type="file" accept="image/jpeg,image/png,image/webp" aria-label="Foto do grupo" disabled={pending} onChange={e=>{const file=e.target.files?.[0];if(file)onUpload(file);e.target.value=''}}/></label><div><strong>{pending?'A preparar foto…':'Foto do grupo'}</strong><small>JPEG, PNG ou WebP · até 2 MB</small>{photo&&<Button type="button" variant="ghost" disabled={pending} onClick={onRemove}>Remover foto</Button>}</div></div>}

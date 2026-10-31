import {useEffect,useState} from 'react';
import {Link} from '@tanstack/react-router';
import {Search,ChevronRight} from 'lucide-react';
import {publicUsers,searchUsers,type PublicUser} from './user-directory';
import {readSession} from './accounts';
export function UserSearch({query,onOpenProfile}:{query:string;onOpenProfile?:(user:string|undefined)=>void}){
 const [ownId]=useState(()=>`account:${readSession()?.id}`);
 const [users,setUsers]=useState<PublicUser[]>([]),[error,setError]=useState(false);
 useEffect(()=>{function refresh(){try{setUsers(publicUsers());setError(false)}catch{setError(true)}}refresh();window.addEventListener('storage',refresh);return()=>window.removeEventListener('storage',refresh)},[]);
 const results=searchUsers(users,query);
 return <section className="user-search-page">{error?<p role="alert">Não foi possível carregar os utilizadores. Tenta novamente.</p>:!query.trim()?<div className="user-search-empty"><Search/><p>Quem procuras?</p></div>:<><p role="status" className="user-search-count">{results.length?`${results.length} ${results.length===1?'utilizador encontrado':'utilizadores encontrados'}`:'Nenhum utilizador encontrado.'}</p><div className="user-search-results">{results.map(user=><Link key={user.id} to="/perfil" search={{user:user.id===ownId?undefined:user.id}} onClick={event=>{if(onOpenProfile&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey&&event.button===0){event.preventDefault();onOpenProfile(user.id===ownId?undefined:user.id)}}} className="user-search-result" aria-label={`Ver perfil de @${user.username}`}>{user.avatar?<img src={user.avatar} alt=""/>:<span className="avatar">{user.name.slice(0,2).toUpperCase()}</span>}<div><strong>{user.name}</strong><span>@{user.username}</span></div><ChevronRight/></Link>)}</div></>}</section>;
}

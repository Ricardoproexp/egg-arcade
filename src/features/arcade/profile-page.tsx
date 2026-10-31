import {useAccountOnline} from './presence';
import {readSession} from './accounts';
import {findLocalUser,isMyPublicProfile} from './user-directory';
import {BackLink} from './back-link';
import {formatCount} from './format-count';
import {WalletPanel} from './wallet-panel';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {followLabel,followAction} from './relationships';
import {useState,type ReactNode} from 'react';
import {Link} from '@tanstack/react-router';
import {ArrowLeft,Share2,Settings,Heart,Wallet,Medal,Radio,MessageCircle,Plus,Check} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {streams} from './media';
import {cleanName,UserLink,UserAvatar} from './profile-links';
import {type State,type Post} from './store';
export function ProfilePage({user,state,coinBalance,diamondBalance,edit,follow,message,renderPost}:{user?:string|undefined;state:State;coinBalance:number;diamondBalance:number;edit:()=>void;follow:(name:string)=>void;message:(name:string)=>void;renderPost:(p:Post)=>ReactNode}){
 const localUser=findLocalUser(user);const own=!user||isMyPublicProfile(user);const creator=streams.find(s=>s.id===user);const name=own?state.profile.name:localUser?.username??creator?.creator??(user?.startsWith('name:')?user.slice(5):'Utilizador desconhecido');
 const online=useAccountOnline(own?`account:${readSession()?.id}`:localUser?.id);
 const [walletOpen,setWalletOpen]=useState(false);
 const [list,setList]=useState<'Seguidores'|'Seguindo'|null>(null);
 const [tab,setTab]=useState('Publicações');const [panel,setPanel]=useState('');
 const posts=!own&&localUser?localUser.posts:state.posts.filter(p=>own?p.own:!p.own&&cleanName(p.author)===name);
 const username=(own?state.profile.handle:localUser?.username??posts.find(p=>p.handle)?.handle??name.toLowerCase().replace(/\s+/g,'')).replace(/^@+/,'');
 const photo=own?state.profile.avatar:localUser?.avatar??creator?.avatar;const banner=own?state.profile.banner:localUser?.banner??creator?.image;
 const followerNames=own?state.followers:state.followed.includes(name)?[state.profile.name]:[];
 const followingNames=own?state.followed:state.followers.includes(name)?[state.profile.name]:[];
 const portrait=photo?<img className="profile-main-avatar" src={photo} alt={`Foto de ${name}`}/>:<span className="profile-main-avatar profile-initials">{name.slice(0,2).toUpperCase()}</span>;
 async function share(){try{if(navigator.share)await navigator.share({title:`Perfil de ${name}`,url:location.href});else await navigator.clipboard.writeText(location.href);setPanel(own?'Ligação copiada.':'Ligação do perfil partilhada.')}catch(e){if(!(e instanceof Error&&e.name==='AbortError'))setPanel('Não foi possível partilhar a ligação neste navegador.')}}
 return <section className="user-profile-page">
 <div className="profile-hero">{banner&&<><img className="profile-background-image" src={banner} alt="Fundo do perfil"/><div className="profile-background-shade" aria-hidden="true"/></>}
 <header className="profile-toolbar"><BackLink><ArrowLeft/></BackLink><strong>{username}</strong><Button size="icon" variant="ghost" aria-label="Partilhar perfil" onClick={share}><Share2/></Button>{own&&<Button size="icon" variant="ghost" aria-label="Editar perfil" onClick={edit}><Settings/></Button>}</header>
 <div className="profile-hero-identity">{own?<button type="button" className="profile-photo-edit" aria-label="Editar foto e perfil" onClick={edit}>{portrait}<span>Editar perfil</span></button>:<UserLink name={name} own={false} label={`Ver perfil de ${name}`}>{portrait}</UserLink>}<h1><UserLink name={name} own={own}>@{username}</UserLink></h1></div>
 <div className="profile-summary"><span className="profile-level"><Medal/>LV. 1</span><div className="profile-counts">{[[posts.length,'Postagens'],[own?state.followers.length:state.followed.includes(name)?1:0,'Seguidores'],[own?state.followed.length:state.followers.includes(name)?1:0,'Seguindo'],[0,'Pontos']].map(([value,label])=>label==='Seguidores'||label==='Seguindo'?<button key={label} className="profile-stat-button" aria-label={`${label}: ${value}`} aria-haspopup="dialog" onClick={()=>setList(label)}><strong title={Number(value).toLocaleString('pt-PT')}>{formatCount(Number(value))}</strong><span>{label}</span></button>:<div key={label} aria-label={`${label}: ${value}`} aria-live="polite"><strong title={Number(value).toLocaleString('pt-PT')}>{formatCount(Number(value))}</strong><span>{label}</span></div>)}</div><div className="profile-presence"><span role="status" className={online?'is-online':'is-offline'}><i aria-hidden="true"/>{online?'Online':'Offline'}</span>{creator&&<Link to="/ao-vivo" search={{live:creator.id}}><Radio/>Ver live</Link>}</div></div>
 <div className="profile-shortcuts"><Button variant="outline" onClick={()=>setPanel('Lista de Desejos: ainda não há itens disponíveis neste perfil.')}><Heart/>Lista de Desejos</Button>{own?<Button variant="outline" onClick={()=>setWalletOpen(true)}><Wallet/>Carteira</Button>:<Button aria-label={followAction(state,name)} title={state.followed.includes(name)?'Clica para deixar de seguir':followLabel(state,name)} aria-pressed={state.followed.includes(name)} onClick={()=>follow(name)}>{state.followed.includes(name)?<Check aria-hidden="true"/>:<Plus aria-hidden="true"/>}{followLabel(state,name)}</Button>}{!own&&<Button variant="secondary" onClick={()=>message(name)}><MessageCircle/>Mensagem</Button>}</div>
 </div>
 {panel&&<div className="profile-feedback" role="status"><p>{panel}</p><button aria-label="Fechar informação" onClick={()=>setPanel('')}>×</button></div>}
 <p className="profile-bio">{own?state.profile.bio:localUser?.bio??creator?.description??'Este perfil ainda não tem uma biografia.'}</p><p className="local-note">{own?state.profile.game:localUser?.game??creator?.game}</p>
 <div className="content-tabs">{(own?['Publicações','Guardados','Comunidades']:['Publicações']).map(t=><Button key={t} variant="ghost" className={tab===t?'selected':''} onClick={()=>setTab(t)}>{t}</Button>)}</div>
 {tab==='Comunidades'&&own?<>{state.communities.filter(c=>state.joined.includes(c.id)).map(c=><Link className="creator-row" key={c.id} to="/comunidades">{c.name}</Link>)}{!state.joined.length&&<p className="empty">Ainda não entraste em comunidades.</p>}</>:<>{(tab==='Guardados'&&own?state.posts.filter(p=>state.saved.includes(p.id)):posts).map(renderPost)}{!(tab==='Guardados'&&own?state.saved.length:posts.length)&&<p className="empty">Ainda não há publicações {tab==='Guardados'?'guardadas':'neste perfil'}.</p>}</>}
 {own&&<WalletPanel open={walletOpen} setOpen={setWalletOpen} coins={coinBalance} diamonds={diamondBalance}/>}
 <Dialog open={list!==null} onOpenChange={open=>{if(!open)setList(null)}}><DialogContent className="arcade-dialog"><DialogTitle>{list} · {name}</DialogTitle><DialogDescription>Pessoas ligadas a este perfil.</DialogDescription><div className="profile-people-list">{(list==='Seguidores'?followerNames:followingNames).map(person=><div key={person} className="profile-person" onClick={e=>{if((e.target as HTMLElement).closest('a'))setList(null)}}><UserAvatar name={person} own={!own}/><UserLink name={person} own={!own}/>{(own||person!==state.profile.name)&&<Button variant="secondary" aria-label={followAction(state,person)} aria-pressed={state.followed.includes(person)} onClick={()=>follow(person)}>{followLabel(state,person)}</Button>}</div>)}{!(list==='Seguidores'?followerNames:followingNames).length&&<p className="empty">{list==='Seguidores'?'Ainda não há seguidores.':'Ainda não segue ninguém.'}</p>}</div></DialogContent></Dialog>
 </section>
}

import {accountKey} from './account-storage';
import {SessionContext} from './session-context';
import {useEffect,useState,useContext,type Dispatch,type SetStateAction} from 'react';
import {Link} from '@tanstack/react-router';
import {Settings,ChevronDown,ChevronRight,ArrowLeft,Headphones,LogOut,Gamepad2,Trophy,Gift,Ticket,BarChart3,Gem,Flag,Shield,Trash2,HelpCircle,Coins,X} from 'lucide-react';
import {DialogClose} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {defaults,type State} from './store';
export function useMenuSettings(){
 const [paused,setPaused]=useState(()=>{try{return localStorage.getItem(accountKey('omlet-notifications-paused'))==='true'}catch{return false}});
 useEffect(()=>{try{localStorage.setItem(accountKey('omlet-notifications-paused'),String(paused))}catch{}},[paused]);
 return {paused,setPaused};
}
const unavailable:Record<string,string>={
 'Missões':'As missões e recompensas ainda não estão disponíveis.',
 'Moedas':'A carteira estará disponível em breve.',
 'Estatísticas da Livestream':'As estatísticas reais estarão disponíveis quando existirem transmissões ligadas ao servidor.',
 'Torneios':'Ainda não existem torneios disponíveis.',
 'Meus NFTs':'Ainda não existe uma carteira ligada nem NFTs disponíveis.',
 'Eventos':'Ainda não existem eventos disponíveis.',
 'Quadro de Líderes':'O ranking estará disponível em breve.',
 'Convide Amigos & Ganhe Prêmios':'O programa de convites e prémios ainda não está disponível.',
 'Meus Cupons':'Ainda não existem cupões disponíveis.',
 'Janela de jogo':'A janela sobreposta a outros jogos requer uma aplicação nativa. Não está disponível nesta versão web.',
 'Ícone da aplicação':'A personalização do ícone instalado ainda não está disponível.',
 'Modo PiP':'O modo picture-in-picture automático ainda não está disponível nesta versão.',
 'Modo Invisível':'O modo invisível ainda não está disponível.',
 'Idioma do Conteúdo':'O conteúdo atual está disponível em português. Outros idiomas ainda não estão disponíveis.',
 'Reproduzir automaticamente':'A reprodução é manual nesta versão. O modo “Somente WiFi” requer deteção de rede compatível.',
 'Nos siga no Facebook':'A página oficial deste projeto ainda não foi configurada.',
 'Nos siga no Instagram':'A página oficial deste projeto ainda não foi configurada.',
 'Privacidade':'A sincronização entre dispositivos e a entrega de mensagens a outras pessoas ainda não estão disponíveis. Podes gerir os teus conteúdos nas definições da conta.',
};
const entries=[[BarChart3,'Estatísticas da Livestream'],[Trophy,'Torneios'],[Gem,'Meus NFTs'],[Flag,'Eventos'],[BarChart3,'Quadro de Líderes'],[Gift,'Convide Amigos & Ganhe Prêmios'],[Ticket,'Meus Cupons']] as const;
export function SideMenu({coinBalance,state,setState,close,paused,setPaused,resetFilters}:{coinBalance:number;state:State;setState:Dispatch<SetStateAction<State>>;close:()=>void;paused:boolean;setPaused:Dispatch<SetStateAction<boolean>>;resetFilters:()=>void}){
 const {logout}=useContext(SessionContext);
 const [panel,setPanel]=useState<string|null>(null),[feedback,setFeedback]=useState(''),[confirmClear,setConfirmClear]=useState(false);
 const setting=(title:string,description:string,control?:React.ReactNode)=> <button className="drawer-setting" onClick={()=>setPanel(title)}><span><strong>{title}</strong><small>{description}</small></span>{control}</button>;
 const toolbar=<div className="menu-tools"><button onClick={()=>setPanel('Moedas')} aria-label={`Saldo: ${coinBalance} moedas`}><Coins aria-hidden="true"/><span>{coinBalance.toLocaleString('pt-PT')}</span></button><button onClick={()=>setPanel('Missões')}><Flag aria-hidden="true"/>Missões</button><DialogClose className="menu-close" aria-label="Fechar"><X aria-hidden="true"/></DialogClose></div>;
 if(panel)return <>{toolbar}<section className="drawer-detail menu-detail"><Button variant="ghost" onClick={()=>{setPanel(null);setFeedback('')}}><ArrowLeft/>Voltar ao menu</Button><h2>{panel}</h2><p>{panel==='Moedas'?'A carteira estará disponível em breve. Carregamentos e levantamentos ainda não estão disponíveis.':unavailable[panel]}</p>{panel==='Moedas'&&<Button asChild><Link to="/loja" onClick={close}>Abrir loja</Link></Button>}{feedback&&<p role="status">{feedback}</p>}</section></>;
 return <>{toolbar}<div className="menu-page">
 <section className="drawer-profile menu-profile">{state.profile.banner&&<><img className="profile-background-image" src={state.profile.banner} alt=""/><div className="profile-background-shade" aria-hidden="true"/></>}
 <Link to="/perfil" onClick={close} aria-label="O meu perfil" className="drawer-identity">{state.profile.avatar?<img src={state.profile.avatar} alt=""/>:<span className="drawer-avatar-placeholder"><Headphones/></span>}<div><strong>{state.profile.name}</strong><small>@{state.profile.handle}</small><span className="menu-profile-link">Ver o meu perfil <ChevronRight size={14}/></span></div><ChevronRight className="menu-profile-arrow"/></Link>
 </section>
 <div className="drawer-body menu-body">
 <section className="menu-section"><h2><Settings size={16}/> Preferências</h2>
 <label className="drawer-setting drawer-toggle"><span><strong>Pausar notificações</strong><small>Faz uma pausa nos alertas.</small></span><input type="checkbox" role="switch" checked={paused} onChange={e=>setPaused(e.target.checked)} aria-label="Pausar notificações"/></label>
 {setting('Idioma do Conteúdo','Idioma dos conteúdos que vês.',<span className="drawer-setting-value">Português <ChevronRight/></span>)}
 {setting('Reproduzir automaticamente','Escolhe como começas a ver vídeos.',<span className="drawer-setting-value">Manual <ChevronRight/></span>)}
 <div className="drawer-setting"><span><strong>Preferências do feed</strong><small>Repõe a pesquisa e os filtros.</small></span><Button variant="secondary" onClick={()=>{resetFilters();setFeedback('Preferências de conteúdo redefinidas.')}}>Repor</Button></div>
 </section>
 <details className="menu-section menu-coming"><summary><span><Trophy size={17}/> Mais no Egg Arcade</span><span>Em breve <ChevronDown size={16}/></span></summary><nav aria-label="Funcionalidades futuras" className="reference-menu">{entries.map(([Icon,label])=><button key={label} onClick={()=>setPanel(label)}><Icon size={19}/><span>{({'Meus NFTs':'Os meus NFTs','Convide Amigos & Ganhe Prêmios':'Convidar amigos','Meus Cupons':'Os meus cupões','Estatísticas da Livestream':'Estatísticas das lives','Quadro de Líderes':'Classificação'} as Record<string,string>)[label]||label}</span><ChevronRight size={16}/></button>)}</nav>
 {setting('Janela de jogo','Definições da janela durante o jogo.',<ChevronRight/>)}
 {setting('Ícone da aplicação','Personaliza o ícone da aplicação.',<ChevronRight/>)}
 {setting('Modo PiP','Vê a transmissão numa janela flutuante.',<ChevronRight/>)}
 {setting('Modo Invisível','Gere a tua presença na comunidade.',<ChevronRight/>)}
 </details>
 <section className="menu-section"><h2><Shield size={16}/> Conta e apoio</h2>
 <button className="menu-account-row" onClick={()=>setPanel('Privacidade')}><Shield size={19}/><span>Privacidade</span><ChevronRight size={16}/></button>
 <details className="drawer-help"><summary><span><HelpCircle size={19}/> Ajuda</span><ChevronDown size={16}/></summary><p>Usa o botão + para publicar ou gravar. No teu perfil, podes editar a foto, o fundo e os teus dados. Em Chat, cria uma conversa ou junta a tua equipa num grupo.</p></details>
 <details className="menu-data"><summary><span><Trash2 size={19}/> Gerir conteúdos</span><ChevronDown size={16}/></summary><p>Apaga as tuas publicações e conversas. O teu perfil é mantido.</p><Button variant="outline" onClick={()=>setConfirmClear(true)}>Apagar conteúdos</Button>
 {confirmClear&&<div className="drawer-confirm"><p>Apagar as publicações, conversas, comentários, gostos, guardados, seguimentos e comunidades? O perfil será mantido. Esta ação não pode ser desfeita.</p><Button onClick={()=>{setState(s=>({...structuredClone(defaults),profile:s.profile,messages:{},comments:{},conversations:[],blockedChatUsers:[]}));setConfirmClear(false);setFeedback('Conteúdo apagado.');}}>Confirmar eliminação</Button><Button variant="secondary" onClick={()=>setConfirmClear(false)}>Cancelar</Button></div>}
 </details></section>
 <button className="drawer-login" onClick={()=>{close();logout()}}><LogOut size={18} aria-hidden="true"/>Terminar sessão</button>
 {feedback&&<p className="drawer-feedback" role="status">{feedback}</p>}
 <footer className="menu-footer"><Gamepad2 size={16}/><span>Egg Arcade</span><small>O teu jogo. A tua comunidade.</small></footer>
 </div></div></>;
}

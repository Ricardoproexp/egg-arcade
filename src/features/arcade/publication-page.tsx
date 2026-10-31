import {publicPost} from './user-directory';
import {BackLink} from './back-link';
import {useEffect,useRef,useState,type Dispatch,type SetStateAction,type ReactNode} from 'react';
import {Link} from '@tanstack/react-router';
import {ArrowLeft,Send,Reply,X,Maximize} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {UserAvatar,UserLink,cleanName} from './profile-links';
import {images} from './media';
import {uid,type State,type Post,type Message} from './store';
export function CommentThread({postId,state,setState,inputLabel='Comentário na publicação'}:{postId:string;state:State;setState:Dispatch<SetStateAction<State>>;inputLabel?:string}){
 const [draft,setDraft]=useState(''),[reply,setReply]=useState<Message|null>(null);
 const input=useRef<HTMLInputElement>(null),log=useRef<HTMLDivElement>(null),sent=useRef<string|null>(null);
 const comments=state.comments[postId]??[];
 const roots=comments.filter(m=>!m.replyTo||!comments.some(parent=>parent.id===m.replyTo));
 useEffect(()=>{if(sent.current&&log.current){const item=log.current.querySelector<HTMLElement>(`[data-comment-id="${sent.current}"]`);if(item)log.current.scrollTop=Math.max(0,item.offsetTop-log.current.clientHeight+item.offsetHeight+12);sent.current=null}},[comments.length]);
 function respond(m:Message){setReply(m);input.current?.focus({preventScroll:true})}
 function send(){const text=draft.trim();if(!text)return;const messageId=uid();
  setState(s=>{if(!s.posts.some(p=>p.id===postId)&&!publicPost(postId))return s;const all=s.comments[postId]??[];const target=reply&&all.find(m=>m.id===reply.id);const m:Message={id:messageId,text:text.slice(0,1000),own:true,author:s.profile.name,...(target?{replyTo:target.replyTo??target.id,replyAuthor:cleanName(target.author)}:{})};return {...s,comments:{...s.comments,[postId]:[...all,m]}}});setDraft('');setReply(null);sent.current=messageId;
 }
 function comment(m:Message,nested=false){return <div className={`comment ${nested?'comment-reply':''}`} key={m.id} data-comment-id={m.id}><UserAvatar name={m.author} own={m.own} small/><div><strong><UserLink name={m.author} own={m.own}/></strong>{m.replyAuthor&&<small className="comment-reply-to">Em resposta a {m.replyAuthor}</small>}<p>{m.text}</p><button className="comment-reply-action" onClick={()=>respond(m)} aria-label={`Responder a ${cleanName(m.author)}: ${m.text.slice(0,45)}`}><Reply size={13}/>Responder</button></div></div>}
 return <section className="publication-comments" aria-label="Comentários da publicação"><header><h2>Comentários</h2><span>{comments.length}</span></header><div ref={log} className="publication-comment-log" tabIndex={0} aria-label="Lista de comentários">{roots.map(m=><div className="comment-thread" key={m.id}>{comment(m)}{comments.filter(c=>c.replyTo===m.id).map(c=>comment(c,true))}</div>)}{!comments.length&&<p className="local-note">Ainda não há comentários. Escreve o primeiro.</p>}</div><div className="publication-comment-compose">{reply&&<div className="comment-reply-banner"><span>A responder a <strong>{cleanName(reply.author)}</strong></span><button aria-label="Cancelar resposta" onClick={()=>setReply(null)}><X size={16}/></button></div>}<form className="message-form" onSubmit={e=>{e.preventDefault();send()}}><input ref={input} aria-label={inputLabel} maxLength={1000} required value={draft} onChange={e=>setDraft(e.target.value)} placeholder={reply?'Escreve uma resposta…':'Escreve um comentário…'}/><Button type="submit" aria-label={reply?'Enviar resposta':'Enviar comentário'} disabled={!draft.trim()}><Send/></Button></form></div></section>
}
export function PublicationPage({post,state,setState,renderPost}:{post:Post|undefined;state:State;setState:Dispatch<SetStateAction<State>>;renderPost:(post:Post,onImage:()=>void,onComment:()=>void,onText:()=>void)=>ReactNode}){
 const [photo,setPhoto]=useState(false),[textOpen,setTextOpen]=useState(false);
 const page=useRef<HTMLElement>(null);
 useEffect(()=>{
  const viewport=window.visualViewport;
  const shell=page.current?.closest<HTMLElement>('.arcade-app');
  function resize(){const height=viewport?.height??window.innerHeight;
   shell?.style.setProperty('--publication-height',`${height}px`);
   shell?.style.setProperty('--publication-top',`${viewport?.offsetTop??0}px`);
   shell?.classList.toggle('publication-compact',height<500);
  }
  resize();viewport?.addEventListener('resize',resize);viewport?.addEventListener('scroll',resize);window.addEventListener('resize',resize);
  return()=>{viewport?.removeEventListener('resize',resize);viewport?.removeEventListener('scroll',resize);window.removeEventListener('resize',resize);shell?.style.removeProperty('--publication-height');shell?.style.removeProperty('--publication-top');shell?.classList.remove('publication-compact')};
 },[]);
 return <section ref={page} className="publication-page"><div className="publication-toolbar"><BackLink className="publication-back"><ArrowLeft/>Voltar</BackLink><h1>Publicação</h1></div>{post?<div className="publication-body">{renderPost(post,()=>setPhoto(true),()=>page.current?.querySelector<HTMLInputElement>('.message-form input')?.focus({preventScroll:true}),()=>setTextOpen(true))}<CommentThread key={`comments:${post.id}`} postId={post.id} state={state} setState={setState}/></div>:<div className="empty"><h2>Publicação não encontrada</h2><p>Pode ter sido eliminada ou existir apenas noutro dispositivo.</p></div>}
 {post?.image&&<Dialog open={photo} onOpenChange={setPhoto}><DialogContent fullScreen className="publication-photo-viewer"><DialogTitle className="sr-only">Foto da publicação de {post.author}</DialogTitle><DialogDescription className="sr-only">Imagem completa. Usa Fechar ou Escape para voltar à publicação.</DialogDescription><img src={images[post.image]??post.image} alt={`Publicação de ${post.author} sobre ${post.game}`}/><span><Maximize size={14}/>Imagem completa</span></DialogContent></Dialog>}
 <Dialog open={textOpen} onOpenChange={setTextOpen}><DialogContent className="arcade-dialog"><DialogTitle>Publicação de {post?.author}</DialogTitle><DialogDescription>Texto completo da publicação</DialogDescription><p className="publication-full-text">{post?.text}</p></DialogContent></Dialog>
 </section>
}

import {useRef,useState,type FormEvent} from 'react';
import {Button} from '@/components/ui/button';
import {games,validImage,type State} from './store';
export function ProfileEditor({profile,save}:{profile:State['profile'];save:(profile:State['profile'])=>boolean|void}){
 const [draft,setDraft]=useState({...profile});const [error,setError]=useState('');const [pending,setPending]=useState(0);const versions=useRef({avatar:0,banner:0});
 function upload(file:File|undefined,field:'avatar'|'banner'){
  if(!file)return;if(!validImage(file)){setError('Escolhe uma imagem JPEG, PNG ou WebP até 2 MB.');return}setError('');const version=++versions.current[field];setPending(v=>v+1);const reader=new FileReader();
  reader.onload=()=>{if(version===versions.current[field]&&typeof reader.result==='string'){const value=reader.result;setDraft(d=>({...d,[field]:value}))}};
  reader.onerror=()=>setError('Não foi possível ler a imagem. Tenta novamente.');reader.onloadend=()=>setPending(v=>v-1);reader.readAsDataURL(file);
 }
 function remove(field:'avatar'|'banner'){versions.current[field]++;setDraft(d=>{const next={...d};delete next[field];return next})}
 function submit(e:FormEvent){e.preventDefault();if(pending||!draft.handle.trim())return;const result=save({...draft,name:draft.handle!==profile.handle?draft.handle.trim():draft.name,handle:draft.handle.trim(),bio:draft.bio.trim()});if(result===false)setError('Não foi possível guardar. Experimenta uma imagem mais pequena e tenta novamente.')}
 return <form className="arcade-form profile-edit-form" onSubmit={submit}>
 {(['avatar','banner'] as const).map(field=><div className="profile-media-field" key={field}><label>{field==='avatar'?'Foto de perfil':'Fundo do perfil'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>upload(e.target.files?.[0],field)}/></label>{draft[field]&&<><img className={field==='avatar'?'editor-photo':'editor-banner'} src={draft[field]} alt={field==='avatar'?'Pré-visualização da foto':'Pré-visualização do fundo'}/><Button type="button" variant="secondary" onClick={()=>remove(field)}>{field==='avatar'?'Remover foto':'Remover fundo'}</Button></>}</div>)}
 <small>JPEG, PNG ou WebP · até 2 MB por imagem.</small>
 <label>Nome de utilizador<input required pattern="[a-zA-Z0-9_]{3,24}" title="3 a 24 letras, números ou underscore" value={draft.handle} onChange={e=>setDraft(d=>({...d,handle:e.target.value}))}/></label>
 <label>Descrição<textarea maxLength={200} value={draft.bio} onChange={e=>setDraft(d=>({...d,bio:e.target.value}))}/></label>
 <label>Jogo preferido<select value={draft.game} onChange={e=>setDraft(d=>({...d,game:e.target.value}))}>{games.map(g=><option key={g}>{g}</option>)}</select></label>
 {error&&<p role="alert">{error}</p>}<Button type="submit" disabled={pending>0||!draft.handle.trim()}>{pending?'A carregar imagem…':'Guardar perfil'}</Button>
 </form>
}

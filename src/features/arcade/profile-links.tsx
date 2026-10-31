import {findLocalUser} from './user-directory';
import {createContext,useContext,type ReactNode} from 'react';
import {Link} from '@tanstack/react-router';
import {streams} from './media';
export const ProfileContext=createContext({name:'Player One',avatar:undefined as string|undefined,visit:()=>{}});
export const cleanName=(name:string)=>name.replace(/\s*·\s*exemplo$/i,'').trim();
export function UserLink({name,own,children,className='',label}:{name:string;own?:boolean|undefined;children?:ReactNode;className?:string;label?:string|undefined}){
 const current=useContext(ProfileContext);const display=own?current.name:cleanName(name);
 const user=own|| (own===undefined&&display===current.name)?undefined:findLocalUser(display)?.id??streams.find(s=>s.creator===display)?.id??`name:${display}`;
 return <Link to="/perfil" search={{user}} className={`user-link ${className}`} aria-label={label} onClick={current.visit}>{children??display}</Link>;
}
export function UserAvatar({name,own,small=false}:{name:string;own?:boolean|undefined;small?:boolean}){
 const current=useContext(ProfileContext);const display=own?current.name:cleanName(name);const photo=own?current.avatar:findLocalUser(display)?.avatar??streams.find(s=>s.creator===display)?.avatar;
 return <UserLink name={name} own={own} label={`Ver perfil de ${display}`} className="avatar-link">{photo?<img src={photo} alt="" className={`avatar ${small?'small':''}`}/>:<span className={`avatar avatar-2 ${small?'small':''}`} aria-hidden="true">{display.slice(0,2).toUpperCase()}</span>}</UserLink>;
}

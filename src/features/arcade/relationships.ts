import type {State} from './store';
export function followLabel(state:Pick<State,'followed'|'followers'>,name:string){
 const following=state.followed.includes(name),followsMe=state.followers.includes(name);
 return following?(followsMe?'Amigos':'A seguir'):(followsMe?'Seguir de volta':'Seguir');
}
export function followAction(state:Pick<State,'followed'|'followers'>,name:string){
 return `${state.followed.includes(name)?'Deixar de seguir':followLabel(state,name)} ${name}`;
}

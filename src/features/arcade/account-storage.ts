export const ACCOUNT_SESSION='arcade-account-session-v2';
export function accountKey(base:string){
 const raw=sessionStorage.getItem(ACCOUNT_SESSION);
 const session=raw?JSON.parse(raw):null;
 return session?.id?`${base}:account:${session.id}`:base;
}

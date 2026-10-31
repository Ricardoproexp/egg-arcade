const KEY='arcade-preview-registrations-v1';
export type Registration={username:string;email:string};
export const normalizeUsername=(value:string)=>value.trim().replace(/^@/,'').toLowerCase();
export const normalizeEmail=(value:string)=>value.trim().toLowerCase();
export const validUsername=(value:string)=>/^[a-z0-9_]{3,24}$/.test(normalizeUsername(value));
export const validEmail=(value:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
export function readRegistrations():Registration[]{
 const accounts=JSON.parse(localStorage.getItem('arcade-accounts-v2')??'[]');if(!Array.isArray(accounts))throw new Error('Invalid registry');
 const current=accounts.map((a:Registration)=>({username:a.username,email:a.email}));
 const raw=localStorage.getItem(KEY);if(!raw)return current;
 const entries:unknown=JSON.parse(raw);if(!Array.isArray(entries))throw new Error('Invalid registry');
 return [...current,...entries.filter((v):v is Registration=>!!v&&typeof v.username==='string'&&typeof v.email==='string')];
}
export function registrationIssue(username:string,email:string,entries:Registration[]){
 if(!validUsername(username))return 'Usa 3 a 24 letras, números ou underscores no username.';
 if(!validEmail(email))return 'Introduz um email válido.';
 if(entries.some(a=>a.username===normalizeUsername(username)))return 'Este username já está registado.';
 if(entries.some(a=>a.email===normalizeEmail(email)))return 'Este email já está registado.';
 return '';
}
export function reserveRegistration(username:string,email:string){
 const entries=readRegistrations();const issue=registrationIssue(username,email,entries);if(issue)throw new Error(issue);
 localStorage.setItem(KEY,JSON.stringify([...entries,{username:normalizeUsername(username),email:normalizeEmail(email)}]));
}

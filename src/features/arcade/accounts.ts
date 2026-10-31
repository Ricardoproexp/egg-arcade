import {ACCOUNT_SESSION} from './account-storage';
import {normalizeUsername,normalizeEmail,registrationIssue,readRegistrations} from './signup-availability';
export const ACCOUNTS_KEY='arcade-accounts-v2';
export type Account={id:string;username:string;email:string;salt:string;passwordHash:string;recoveryHash:string;revision:number};
export type AccountSession={id:string;name:string;email:string;revision:number};
const encode=(bytes:ArrayBuffer)=>Array.from(new Uint8Array(bytes),n=>n.toString(16).padStart(2,'0')).join('');
async function digest(value:string,salt:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(value),'PBKDF2',false,['deriveBits']);return encode(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:210000,hash:'SHA-256'},key,256))}
export function readAccounts():Account[]{const raw=localStorage.getItem(ACCOUNTS_KEY);if(!raw)return [];const value=JSON.parse(raw);if(!Array.isArray(value)||!value.every(a=>a&&typeof a.id==='string'&&typeof a.passwordHash==='string'&&typeof a.recoveryHash==='string'&&typeof a.salt==='string'&&typeof a.username==='string'&&typeof a.email==='string'&&Number.isInteger(a.revision)))throw new Error('Não foi possível ler as contas guardadas.');return value}
async function locked<T>(work:()=>Promise<T>){return navigator.locks?navigator.locks.request(ACCOUNTS_KEY,work):work()}
function checkPassword(password:string){if(password.length<8||password.length>128)throw new Error('A palavra-passe deve ter entre 8 e 128 caracteres.')}
export async function createAccount(username:string,email:string,password:string,legacy=false,initialize?:(account:Account)=>void){
 checkPassword(password);const salt=crypto.randomUUID(),recoveryCode=crypto.randomUUID();
 const account:Account={id:crypto.randomUUID(),username:normalizeUsername(username),email:normalizeEmail(email),salt,passwordHash:await digest(password,salt),recoveryHash:await digest(recoveryCode,salt),revision:1};
 await locked(async()=>{const accounts=readAccounts();const entries=legacy?accounts:[...readRegistrations(),...accounts];const issue=registrationIssue(username,email,entries);if(issue)throw new Error(issue);try{initialize?.(account);localStorage.setItem(ACCOUNTS_KEY,JSON.stringify([...accounts,account]))}catch(error){for(const key of Object.keys(localStorage))if(key.endsWith(`:account:${account.id}`))localStorage.removeItem(key);throw error}});return {account,recoveryCode};
}
export async function loginAccount(email:string,password:string){const account=readAccounts().find(a=>a.email===normalizeEmail(email));if(!account||await digest(password,account.salt)!==account.passwordHash)throw new Error('Email ou palavra-passe incorretos.');return account}
export async function recoverAccount(email:string,code:string,password:string){checkPassword(password);return locked(async()=>{const accounts=readAccounts(),account=accounts.find(a=>a.email===normalizeEmail(email));if(!account||await digest(code.trim(),account.salt)!==account.recoveryHash)throw new Error('Email ou código de recuperação incorretos.');const updated={...account,passwordHash:await digest(password,account.salt),revision:account.revision+1};localStorage.setItem(ACCOUNTS_KEY,JSON.stringify(accounts.map(a=>a.id===account.id?updated:a)));return updated})}
export function startSession(account:Account){const session:AccountSession={id:account.id,name:account.username,email:account.email,revision:account.revision};sessionStorage.setItem(ACCOUNT_SESSION,JSON.stringify(session));return session}
export function readSession():AccountSession|null{const raw=sessionStorage.getItem(ACCOUNT_SESSION);if(!raw)return null;const value=JSON.parse(raw);const account=readAccounts().find(a=>a.id===value.id&&a.revision===value.revision);return account?{id:account.id,name:account.username,email:account.email,revision:account.revision}:null}
export function endSession(){
 let session:AccountSession|null=null;try{session=readSession()}catch{}
 sessionStorage.removeItem(ACCOUNT_SESSION);
 try{localStorage.removeItem('arcade-preview-session-v1')}catch{}
 // Always close this tab, even if revocation in other tabs cannot be saved.
 try{if(session){const accounts=readAccounts();localStorage.setItem(ACCOUNTS_KEY,JSON.stringify(accounts.map(a=>a.id===session!.id?{...a,revision:a.revision+1}:a)))}}catch{}
}

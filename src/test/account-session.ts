import {startSession,ACCOUNTS_KEY} from '../features/arcade/accounts';
export function seedAccountSession(){
 sessionStorage.clear();
 const account={id:'test-account',username:'playerone',email:'demo@example.com',salt:'test',passwordHash:'test',recoveryHash:'test',revision:1};
 localStorage.setItem(ACCOUNTS_KEY,JSON.stringify([account]));startSession(account);
}

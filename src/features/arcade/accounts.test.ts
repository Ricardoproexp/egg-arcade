import {beforeEach,it,expect,vi} from 'vitest';
import {webcrypto} from 'node:crypto';
import {createAccount,loginAccount,recoverAccount,startSession,readSession,endSession,ACCOUNTS_KEY} from './accounts';
import {accountKey} from './account-storage';
import {defaults,writeState,parseState,STORAGE_KEY} from './store';
beforeEach(()=>{localStorage.clear();sessionStorage.clear();vi.stubGlobal('crypto',webcrypto)});
it('isolates profile photos, background, messages, wallet and preferences across accounts and restores them on login',async()=>{
 const a=await createAccount('alice','alice@example.com','passwordAlice');startSession(a.account);
 const profile=structuredClone(defaults);profile.profile.avatar='data:image/png;base64,YQ==';profile.profile.banner='data:image/png;base64,Yg==';profile.profile.name='Alice';profile.conversations.push({id:'alice-chat',name:'Bob',kind:'private',members:['bob'],followsMe:false,accepted:true,hasHistory:true,messages:[{id:'a',text:'Private Alice',author:'Alice',own:true}]});
 const keyA=accountKey(STORAGE_KEY);expect(writeState(profile)).toBe(true);
 localStorage.setItem(accountKey('omlet-gift-wallet-v1'),'alice-wallet');endSession();expect(readSession()).toBeNull();
 const b=await createAccount('bob','bob@example.com','passwordBob');startSession(b.account);
 expect(accountKey(STORAGE_KEY)).not.toBe(keyA);expect(parseState(localStorage.getItem(accountKey(STORAGE_KEY))).profile.avatar).toBeUndefined();expect(localStorage.getItem(accountKey('omlet-gift-wallet-v1'))).toBeNull();
 endSession();startSession(await loginAccount(' ALICE@EXAMPLE.COM ','passwordAlice'));
 expect(parseState(localStorage.getItem(accountKey(STORAGE_KEY)))).toEqual(profile);expect(localStorage.getItem(accountKey('omlet-gift-wallet-v1'))).toBe('alice-wallet');
 expect(JSON.stringify(localStorage)).not.toContain('passwordAlice');
});
it('rejects unknown credentials, wrong passwords, short passwords, and duplicate emails/usernames',async()=>{
 await createAccount('alice','alice@example.com','passwordAlice');
 await expect(loginAccount('alice@example.com','incorrect')).rejects.toThrow('incorretos');
 await expect(loginAccount('unknown@example.com','passwordAlice')).rejects.toThrow('incorretos');
 await expect(createAccount('bob','bob@example.com','short')).rejects.toThrow();
 await expect(createAccount('ALICE','other@example.com','passwordOther')).rejects.toThrow('username');
 await expect(createAccount('bob','ALICE@example.com','passwordOther')).rejects.toThrow('email');
});
it('requires the recovery code, changes the password, invalidates prior sessions and preserves data',async()=>{
 const result=await createAccount('alice','alice@example.com','passwordAlice');startSession(result.account);localStorage.setItem(accountKey('test-data'),'preserved');
 await expect(recoverAccount('alice@example.com','wrong','newPassword')).rejects.toThrow();
 await recoverAccount('alice@example.com',result.recoveryCode,'newPassword');expect(readSession()).toBeNull();
 await expect(loginAccount('alice@example.com','passwordAlice')).rejects.toThrow();
 startSession(await loginAccount('alice@example.com','newPassword'));expect(localStorage.getItem(accountKey('test-data'))).toBe('preserved');
});
it('does not leave an account behind when initial data cannot be stored',async()=>{
 await expect(createAccount('alice','alice@example.com','passwordAlice',false,()=>{throw new Error('quota')})).rejects.toThrow('quota');
 expect(localStorage.getItem(ACCOUNTS_KEY)).toBeNull();
});

it('still logs out when persistent storage is full',async()=>{
 const {account}=await createAccount('alice','alice@example.com','passwordAlice');startSession(account);
 const write=vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('quota')});
 endSession();expect(readSession()).toBeNull();write.mockRestore();
});

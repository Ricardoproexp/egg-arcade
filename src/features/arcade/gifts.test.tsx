import {seedAccountSession} from '../../test/account-session';
import {accountKey} from './account-storage';
import React from 'react';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,cleanup,waitFor,within} from '@testing-library/react';
import {RouterProvider,createMemoryHistory} from '@tanstack/react-router';
import {getRouter} from '../../router';
import {readWallet,spendGift,WALLET_KEY} from './gifts';
beforeEach(()=>{localStorage.clear();seedAccountSession();Element.prototype.scrollIntoView=vi.fn()});afterEach(cleanup);
async function open(){const router=getRouter();router.update({history:createMemoryHistory({initialEntries:['/ao-vivo?live=s0']})});await router.load();render(<RouterProvider router={router}/>);return router}
it('deducts gift costs and awards popularity without negative balances',()=>{
 let wallet=readWallet(null);expect(wallet.balance).toBe(10);
 wallet=spendGift(wallet,'s0','heart')!;expect(wallet).toEqual({balance:5,popularity:{s0:50},diamonds:{s0:5}});
 expect(spendGift(wallet,'s0','rose')).toBeNull();expect(spendGift(wallet,'s0','fake')).toBeNull();expect(spendGift(wallet,'missing','coin')).toBeNull();
 expect(()=>readWallet('{"balance":-1,"popularity":{}}')).toThrow();
});
it('opens the catalogue without sending and spends the selected gift once',async()=>{
 await open();fireEvent.click(await screen.findByRole('button',{name:'Abrir presentes'}));
 const dialog=within(screen.getByRole('dialog'));expect(localStorage.getItem(accountKey(WALLET_KEY))).toBeNull();
 fireEvent.click(dialog.getByRole('button',{name:'Foguetão, 100 moedas'}));expect(dialog.getByRole('button',{name:'Enviar · 100 moedas'})).toBeDisabled();
 fireEvent.click(dialog.getByRole('button',{name:'Rosa, 10 moedas'}));fireEvent.click(dialog.getByRole('button',{name:'Enviar · 10 moedas'}));
 await waitFor(()=>expect(JSON.parse(localStorage.getItem(accountKey(WALLET_KEY))??'{}')).toEqual({balance:0,popularity:{s0:100},diamonds:{s0:10}}));
 expect(screen.queryByRole('dialog')).not.toBeInTheDocument();expect(screen.getByText('enviou x1 Rosa!').closest('p')).toHaveTextContent('@playerone enviou x1 Rosa!');
 const coin=screen.getByRole('button',{name:'Moeda: saldo insuficiente'});expect(coin).toBeDisabled();expect(coin).not.toHaveTextContent('0');expect(coin).toHaveTextContent('🪙');
 cleanup();await open();expect(await screen.findByRole('button',{name:'Moeda: saldo insuficiente'})).toBeDisabled();
},30000);
it('shares the wallet across live pages and debits one coin per quick gift',async()=>{
 const router=await open();fireEvent.click(await screen.findByRole('button',{name:'Enviar 1 moeda. Saldo: 10 moedas'}));
 await screen.findByRole('button',{name:'Enviar 1 moeda. Saldo: 9 moedas'});
 await router.navigate({to:'/ao-vivo',search:{live:'s3'}});fireEvent.click(await screen.findByRole('button',{name:'Enviar 1 moeda. Saldo: 9 moedas'}));
 await waitFor(()=>expect(JSON.parse(localStorage.getItem(accountKey(WALLET_KEY))??'{}')).toEqual({balance:8,popularity:{s0:10,s3:10},diamonds:{s0:1,s3:1}}));
},30000);
it('does not award popularity or debit when persistence fails',async()=>{
 await open();const write=vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('quota')});
 fireEvent.click(await screen.findByRole('button',{name:'Enviar 1 moeda. Saldo: 10 moedas'}));await waitFor(()=>expect(screen.getByRole('status')).toHaveTextContent('saldo não foi debitado'));
 expect(screen.getByRole('button',{name:'Enviar 1 moeda. Saldo: 10 moedas'})).toBeEnabled();write.mockRestore();
},30000);
it('migrates previous gifts to streamer diamonds once and values them at one cent each',()=>{
 const legacy=readWallet(JSON.stringify({balance:0,popularity:{s0:50,s3:50}}));expect(legacy.diamonds).toEqual({s0:5,s3:5});expect(readWallet(JSON.stringify(legacy)).diamonds).toEqual(legacy.diamonds);
});
it('persists diamond credit to the recipient and never to the sender',()=>{
 const next=spendGift(readWallet(null),'s3','rose')!;expect(next.diamonds.s3).toBe(10);expect(next.diamonds.me??0).toBe(0);expect(readWallet(JSON.stringify(next)).diamonds.s3).toBe(10);
});

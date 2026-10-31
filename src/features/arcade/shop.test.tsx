import React from 'react';
import {it,expect,afterEach,vi} from 'vitest';
import {render,screen,fireEvent,cleanup,within,waitFor} from '@testing-library/react';
import {RouterProvider,createMemoryHistory} from '@tanstack/react-router';
import {getRouter} from '../../router';
import {COIN_PACKS,coinPriceCents,euroPrice} from './shop-page';
import {WALLET_KEY} from './gifts';
afterEach(()=>{cleanup();vi.restoreAllMocks()});
it('prices every requested pack at exactly two cents per coin',()=>{
 expect(COIN_PACKS.map(coinPriceCents)).toEqual([10,20,50,100,200,500,1000,2000,5000,10000,20000]);
 expect(euroPrice(5).replace(/\s/g,'')).toBe('0,10€');expect(euroPrice(10000).replace(/\s/g,'')).toBe('200,00€');
});
it('opens the shop from the header and buys a demo package and makes the balance available in lives',async()=>{
 localStorage.clear();Element.prototype.scrollIntoView=vi.fn();const router=getRouter();router.update({history:createMemoryHistory({initialEntries:['/']})});await router.load();render(<RouterProvider router={router}/>);
 fireEvent.click(await screen.findByRole('button',{name:'Loja'}));
 const packs=within(await screen.findByRole('group',{name:'Pacotes de moedas'}));expect(packs.getAllByRole('button')).toHaveLength(11);
 fireEvent.click(packs.getAllByRole('button')[10]!);expect(packs.getAllByRole('button')[10]).toHaveAttribute('aria-pressed','true');
 expect(screen.getByRole('region',{name:'Resumo do pacote selecionado'})).toHaveTextContent('200,00');
 expect(localStorage.getItem(WALLET_KEY)).toBeNull();
 expect(screen.queryByText('1 moeda = 0,02 €')).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Comprar moedas · demonstração'}));
 await waitFor(()=>expect(JSON.parse(localStorage.getItem(WALLET_KEY)??'{}').balance).toBe(10010));
 expect(screen.getByRole('status')).toHaveTextContent('Não foi efetuada nenhuma cobrança');
 await router.navigate({to:'/ao-vivo',search:{live:'s0'}});
 fireEvent.click(await screen.findByRole('button',{name:'Enviar 1 moeda. Saldo: 10010 moedas'}));
 await waitFor(()=>expect(JSON.parse(localStorage.getItem(WALLET_KEY)??'{}').balance).toBe(10009));
},30000);

it('does not increase the balance when saving a demo purchase fails',async()=>{
 localStorage.clear();const router=getRouter();router.update({history:createMemoryHistory({initialEntries:['/loja']})});await router.load();render(<RouterProvider router={router}/>);
 const button=await screen.findByRole('button',{name:'Comprar moedas · demonstração'});
 vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('quota')});
 fireEvent.click(button);
 await waitFor(()=>expect(screen.getByRole('alert')).toHaveTextContent('Nenhuma moeda foi adicionada'));
 expect(localStorage.getItem(WALLET_KEY)).toBeNull();expect(button).toBeEnabled();
},30000);

import {seedAccountSession} from '../../test/account-session';
import {accountKey,ACCOUNT_SESSION} from './account-storage';
import React from 'react';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,cleanup,waitFor,within} from '@testing-library/react';
import {RouterProvider,createMemoryHistory} from '@tanstack/react-router';
import {getRouter} from '../../router';
beforeEach(()=>{localStorage.clear();seedAccountSession();Element.prototype.scrollIntoView=vi.fn()});afterEach(cleanup);
async function open(path:string){const router=getRouter();router.update({history:createMemoryHistory({initialEntries:[path]})});await router.load();render(<RouterProvider router={router}/>);return router}
it('returns from a profile to the exact publication and then to its origin',async()=>{
 const router=await open('/');
 await router.navigate({to:'/publicacao',search:{post:'p1'}});
 await screen.findByRole('heading',{name:'Publicação'});
 await router.navigate({to:'/perfil',search:{user:'s0'}});
 fireEvent.click(await screen.findByRole('link',{name:'Voltar'}));
 await waitFor(()=>expect(router.state.location.href).toBe('/publicacao?post=p1'));
 fireEvent.click(screen.getByRole('link',{name:'Voltar'}));
 await waitFor(()=>expect(router.state.location.pathname).toBe('/'));
});
it.each(['/perfil?user=s0','/publicacao?post=p1','/loja','/ao-vivo?live=s0'])('uses a safe fallback for direct entry %s',async path=>{
 const router=await open(path);fireEvent.click(await screen.findByRole('link',{name:'Voltar'}));
 await waitFor(()=>expect(router.state.location.pathname).toBe(path.startsWith('/ao-vivo')?'/ao-vivo':'/'));
 expect(router.state.location.search).toEqual({});
});
it('restores the open conversation after visiting a profile',async()=>{
 const router=await open('/chat');fireEvent.click(await screen.findByRole('button',{name:'Abrir conversa: CraftPedro'}));
 const header=document.querySelector('.conversation-pane>header')!;
 fireEvent.click(within(header as HTMLElement).getByRole('link',{name:'CraftPedro'}));
 await waitFor(()=>expect(router.state.location.pathname).toBe('/perfil'));
 fireEvent.click(screen.getByRole('link',{name:'Voltar'}));
 await waitFor(()=>expect(router.state.location.pathname).toBe('/chat'));
 expect(document.querySelector('.chat-page')).toHaveClass('chat-fullscreen');
 expect(within(document.querySelector('.conversation-pane>header')! as HTMLElement).getByText('CraftPedro')).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Voltar à lista de conversas'}));
 expect(document.querySelector('.chat-page')).not.toHaveClass('chat-fullscreen');
});

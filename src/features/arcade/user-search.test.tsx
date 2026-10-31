import {legacyDefaults as defaults} from '../../test/arcade-fixtures';
import React from 'react';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,cleanup,waitFor} from '@testing-library/react';
import {RouterProvider,createMemoryHistory} from '@tanstack/react-router';
import {getRouter} from '../../router';
import {seedAccountSession} from '../../test/account-session';
import {ACCOUNTS_KEY} from './accounts';
import {STORAGE_KEY} from './store';
import {publicUsers,searchUsers,findLocalUser} from './user-directory';
beforeEach(()=>{localStorage.clear();sessionStorage.clear();seedAccountSession();Element.prototype.scrollIntoView=vi.fn();const accounts=JSON.parse(localStorage.getItem(ACCOUNTS_KEY)!);localStorage.setItem(ACCOUNTS_KEY,JSON.stringify([...accounts,{...accounts[0],id:'other',username:'ricardo_gamer',email:'private@example.com'}]));const state=structuredClone(defaults);state.profile={name:'Ricardo Gamer',handle:'ricardo_gamer',avatar:'data:image/png;base64,YQ==',banner:'data:image/png;base64,Yg==',bio:'A minha bio',game:'Minecraft'};state.conversations[0]!.messages.push({id:'secret',text:'private-message',author:'Ricardo'});localStorage.setItem(`${STORAGE_KEY}:account:other`,JSON.stringify(state))});afterEach(cleanup);
it('opens user search, finds another account, opens its profile and returns to the query',async()=>{
 const router=getRouter();router.update({context:router.options.context,history:createMemoryHistory({initialEntries:['/']})});await router.load();render(<RouterProvider router={router}/>);
 fireEvent.focus(await screen.findByRole('searchbox',{name:'Pesquisar utilizadores'}));
 await waitFor(()=>expect(router.state.location.pathname).toBe('/pesquisar'));
 expect(router.state.matches.some(match=>match.routeId==='/pesquisar')).toBe(true);
 expect(screen.queryByText('Page not found')).not.toBeInTheDocument();
 expect(screen.queryByRole('button',{name:'Loja'})).not.toBeInTheDocument();expect(screen.queryByRole('button',{name:'Notificações'})).not.toBeInTheDocument();expect(screen.queryByRole('button',{name:'Pessoas em live'})).not.toBeInTheDocument();
 fireEvent.change(screen.getByRole('searchbox'),{target:{value:'@RICARDO'}});
 fireEvent.click(await screen.findByRole('link',{name:'Ver perfil de @ricardo_gamer'}));
 expect(await screen.findByRole('heading',{name:'@ricardo_gamer'})).toBeInTheDocument();expect(screen.getByRole('img',{name:'Foto de ricardo_gamer'})).toHaveAttribute('src','data:image/png;base64,YQ==');expect(screen.getByText('A minha bio')).toBeInTheDocument();expect(screen.queryByText('private-message')).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole('link',{name:'Voltar'}));await waitFor(()=>expect(router.state.location.pathname).toBe('/pesquisar')); expect(screen.getByRole('searchbox')).toHaveValue('@RICARDO');
 fireEvent.click(screen.getByRole('link',{name:'Voltar'}));await waitFor(()=>expect(router.state.location.pathname).toBe('/'));
});
it('searches names and usernames without leaking credentials or private messages',()=>{
 const users=publicUsers();expect(searchUsers(users,'ricardo gamer')).toHaveLength(1);expect(searchUsers(users,'@ricardo_')).toHaveLength(1);expect(searchUsers(users,'zzzz')).toEqual([]);expect(JSON.stringify(users)).not.toContain('passwordHash');expect(JSON.stringify(users)).not.toContain('private@example.com');expect(JSON.stringify(users)).not.toContain('private-message');
});

it('does not read account timelines when rendering an unrelated user',()=>{
 const reads=vi.spyOn(Storage.prototype,'getItem');
 findLocalUser('CraftPedro');
 expect(reads.mock.calls.some(([key])=>key.startsWith(`${STORAGE_KEY}:account:`))).toBe(false);
 reads.mockRestore();
});
it('updates typing immediately without navigating for every letter',async()=>{
 const router=getRouter();router.update({context:router.options.context,history:createMemoryHistory({initialEntries:['/pesquisar']})});await router.load();render(<RouterProvider router={router}/>);
 const input=await screen.findByRole('searchbox');
 for(const value of ['r','ri','ric','rica','ricardo'])fireEvent.change(input,{target:{value}});
 expect(input).toHaveValue('ricardo');
 expect(router.state.location.search.q??'').toBe('');
 expect(screen.getByRole('link',{name:'Ver perfil de @ricardo_gamer'})).toBeInTheDocument();
 await waitFor(()=>expect(router.state.location.search.q).toBe('ricardo'));
});

it('opens a profile message directly in the full-screen chat and reuses its history',async()=>{
 const router=getRouter();router.update({context:router.options.context,history:createMemoryHistory({initialEntries:['/perfil?user=account%3Aother']})});await router.load();const {container}=render(<RouterProvider router={router}/>);
 fireEvent.click(await screen.findByRole('button',{name:'Mensagem',exact:true}));
 await waitFor(()=>expect(router.state.location.pathname).toBe('/chat'));
 expect(container.querySelector('.chat-fullscreen')).not.toBeNull();
 expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
 fireEvent.change(screen.getByRole('textbox',{name:'Mensagem'}),{target:{value:'Olá Ricardo!'}});
 fireEvent.click(screen.getByRole('button',{name:'Enviar mensagem'}));
 await waitFor(()=>expect(container.querySelector('.conversation-messages')).toHaveTextContent('Olá Ricardo!'));
 await router.navigate({to:'/perfil',search:{user:'account:other'}});
 fireEvent.click(await screen.findByRole('button',{name:'Mensagem',exact:true}));
 await waitFor(()=>expect(container.querySelector('.conversation-messages')).toHaveTextContent('Olá Ricardo!'));
 expect(screen.getAllByRole('button',{name:'Abrir conversa: ricardo_gamer'})).toHaveLength(1);
});

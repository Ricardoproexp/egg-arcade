import React from 'react';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,cleanup,waitFor} from '@testing-library/react';
import {RouterProvider,createMemoryHistory} from '@tanstack/react-router';
import {getRouter} from '../../router';
beforeEach(()=>{localStorage.clear();Element.prototype.scrollIntoView=vi.fn()});afterEach(cleanup);
it('opens the creator profile from a live avatar without exposing local wallet or editor',async()=>{
 const router=getRouter();router.update({history:createMemoryHistory({initialEntries:['/ao-vivo?live=s3']})});await router.load();const {container}=render(<RouterProvider router={router}/>);
 fireEvent.click(await screen.findByRole('link',{name:'Ver perfil de Luna Plays'}));
 await waitFor(()=>expect(router.state.location.search).toEqual({user:'s3'}));
 expect(await screen.findByRole('heading',{name:'@lunaplays',level:1})).toBeInTheDocument();
 expect(screen.queryByRole('button',{name:'Editar perfil'})).not.toBeInTheDocument();
 expect(screen.queryByRole('button',{name:'Carteira'})).not.toBeInTheDocument();
 expect(container.querySelector('button a, a a')).toBeNull();
 fireEvent.click(screen.getByRole('link',{name:'O meu perfil'}));
 expect(await screen.findByRole('heading',{name:'@playerone',level:1})).toBeInTheDocument();
 expect(screen.getByRole('button',{name:'Carteira'})).toBeInTheDocument();
},30000);
it('keeps card identity links separate from the watch action and resolves unknown contacts',async()=>{
 const router=getRouter();router.update({history:createMemoryHistory({initialEntries:['/ao-vivo']})});await router.load();const {container}=render(<RouterProvider router={router}/>);
 const card=(await screen.findByRole('button',{name:/Ver live de Luna Plays:/})).closest('article')!;
 expect(card.querySelector('a')).toHaveAttribute('href','/perfil?user=s3');
 expect(container.querySelector('button a, a a')).toBeNull();
 await router.navigate({to:'/perfil',search:{user:'name:Outro jogador'}});
 expect(await screen.findByRole('heading',{name:'@outrojogador',level:1})).toBeInTheDocument();
 expect(screen.queryByRole('button',{name:'Editar perfil'})).not.toBeInTheDocument();
},30000);

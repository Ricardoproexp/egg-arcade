import {seedAccountSession} from '../../test/account-session';
import {accountKey,ACCOUNT_SESSION} from './account-storage';
import React from 'react';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,cleanup,waitFor,within} from '@testing-library/react';
import {RouterProvider,createMemoryHistory} from '@tanstack/react-router';
import {getRouter} from '../../router';
import {defaults,STORAGE_KEY,deleteOwnPost} from './store';
beforeEach(()=>{localStorage.clear();seedAccountSession();Element.prototype.scrollIntoView=vi.fn()});afterEach(cleanup);
async function open(path:string){const router=getRouter();router.update({context:router.options.context,history:createMemoryHistory({initialEntries:[path]})});await router.load();render(<RouterProvider router={router}/>);return router}
async function menu(){const trigger=await screen.findByRole('button',{name:/Opções da publicação/});fireEvent.keyDown(trigger,{key:'Enter'});return screen.findByRole('menu')}
it('opens a post from its card, keeps likes independent and supports direct URLs with comments',async()=>{
 const router=await open('/');const card=(await screen.findByRole('link',{name:'Abrir publicação de CraftPedro'})).closest('article')!;
 fireEvent.click(within(card).getByRole('button',{name:'Gostar da publicação de CraftPedro'}));expect(router.state.location.pathname).toBe('/');
 fireEvent.click(within(card).getByText(/Depois de 3 dias/));
 await waitFor(()=>expect(router.state.location.pathname).toBe('/publicacao'));
 expect(router.state.location.search).toEqual({post:'p1'});
 fireEvent.change(await screen.findByRole('textbox',{name:'Comentário na publicação'}),{target:{value:'Comentário na página'}});fireEvent.click(screen.getByRole('button',{name:'Enviar comentário'}));expect(screen.getByText('Comentário na página')).toBeInTheDocument();
 cleanup();await open('/publicacao?post=p1');expect(await screen.findByText('Comentário na página')).toBeInTheDocument();
},30000);
it('only offers report on someone else’s post and stores its reason locally',async()=>{
 await open('/publicacao?post=p1');const items=within(await menu());expect(items.queryByRole('menuitem',{name:'Deletar'})).not.toBeInTheDocument();fireEvent.click(items.getByRole('menuitem',{name:'Denunciar'}));
 const dialog=within(await screen.findByRole('dialog'));fireEvent.change(dialog.getByLabelText('Motivo'),{target:{value:'Fraude'}});fireEvent.click(dialog.getByRole('button',{name:'Guardar denúncia local'}));
 await waitFor(()=>expect(JSON.parse(localStorage.getItem(accountKey(STORAGE_KEY))??'{}').reports).toEqual([expect.objectContaining({postId:'p1',reason:'Fraude'})]));
 expect(screen.getByRole('status')).toHaveTextContent('Não foi enviada');
},30000);
it('only deletes own posts after confirmation and removes related bookmarks and comments',async()=>{
 const state=structuredClone(defaults);state.posts.unshift({id:'own-test',author:'Player One',handle:'playerone',game:'Geral',text:'Postagem minha',likes:0,time:'agora',own:true});state.saved=['own-test'];state.liked=['own-test'];state.comments['own-test']=[{id:'c',text:'Olá',own:true,author:'Player One'}];localStorage.setItem(accountKey(STORAGE_KEY),JSON.stringify(state));
 await open('/publicacao?post=own-test');let items=within(await menu());expect(items.queryByRole('menuitem',{name:'Denunciar'})).not.toBeInTheDocument();fireEvent.click(items.getByRole('menuitem',{name:'Deletar'}));
 fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button',{name:'Cancelar'}));expect(screen.getByText('Postagem minha')).toBeInTheDocument();
 items=within(await menu());fireEvent.click(items.getByRole('menuitem',{name:'Deletar'}));fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button',{name:'Deletar'}));
 expect(await screen.findByRole('heading',{name:'Publicação não encontrada'})).toBeInTheDocument();
 await waitFor(()=>{const saved=JSON.parse(localStorage.getItem(accountKey(STORAGE_KEY))??'{}');expect(saved.posts.some((p:any)=>p.id==='own-test')).toBe(false);expect(saved.saved).toEqual([]);expect(saved.liked).toEqual([]);expect(saved.comments['own-test']).toBeUndefined()});
 expect(deleteOwnPost(defaults,'p1')).toBe(defaults);
},30000);
it('opens the image full screen, replies inline and restores the thread after reload',async()=>{
 await open('/publicacao?post=p1');
 fireEvent.click(await screen.findByRole('button',{name:'Abrir foto de CraftPedro em ecrã inteiro'}));
 const photo=await screen.findByRole('dialog',{name:'Foto da publicação de CraftPedro'});
 expect(within(photo).getByRole('img',{name:/Publicação de CraftPedro/})).toBeInTheDocument();
 fireEvent.click(within(photo).getByRole('button',{name:'Fechar'}));
 fireEvent.click(screen.getByRole('button',{name:/Responder a BiaCraft:/}));
 expect(screen.getByText('A responder a')).toBeInTheDocument();
 const input=screen.getByRole('textbox',{name:'Comentário na publicação'});
 expect(input).toHaveFocus();
 fireEvent.change(input,{target:{value:'Obrigado pela ideia!'}});
 fireEvent.click(screen.getByRole('button',{name:'Enviar resposta'}));
 expect(screen.getByText('Obrigado pela ideia!').closest('.comment')).toHaveClass('comment-reply');
 await waitFor(()=>expect(JSON.parse(localStorage.getItem(accountKey(STORAGE_KEY))!).comments.p1.at(-1)).toMatchObject({replyTo:'c1',replyAuthor:'BiaCraft',text:'Obrigado pela ideia!'}));
 cleanup();await open('/publicacao?post=p1');
 expect(await screen.findByText('Obrigado pela ideia!')).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:/Responder a Player One:/}));
 fireEvent.click(screen.getByRole('button',{name:'Cancelar resposta'}));
 expect(screen.getByRole('button',{name:'Enviar comentário'})).toBeInTheDocument();
});

import {seedAccountSession} from '../../test/account-session';
import {accountKey,ACCOUNT_SESSION} from './account-storage';
import React from 'react';
import {afterEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {RouterProvider,createMemoryHistory} from '@tanstack/react-router';
import {getRouter} from '../../router';
afterEach(()=>{cleanup();localStorage.clear()});
it('offers logout in the hamburger menu and returns to login',async()=>{
 localStorage.clear();seedAccountSession();Element.prototype.scrollIntoView=vi.fn();
 const router=getRouter();router.update({context:router.options.context,history:createMemoryHistory({initialEntries:['/']})});await router.load();
 const {container}=render(<RouterProvider router={router}/>);
 fireEvent.click(await screen.findByRole('button',{name:'Abrir menu'}));
 expect(container.querySelector('.session-logout')).toBeNull();
 expect(screen.queryByRole('button',{name:'Log in'})).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Terminar sessão'}));
 expect(await screen.findByRole('heading',{name:'Bom ver-te de volta.'})).toBeInTheDocument();
 expect(sessionStorage.getItem(ACCOUNT_SESSION)).toBeNull();
});

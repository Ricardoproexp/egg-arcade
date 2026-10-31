import React from 'react';
import {it,expect,beforeEach,afterEach,vi} from 'vitest';
import {render,screen,fireEvent,cleanup,waitFor} from '@testing-library/react';
import {RouterProvider,createMemoryHistory} from '@tanstack/react-router';
import {getRouter} from '../../router';
import {seedAccountSession} from '../../test/account-session';
import {legacyDefaults} from '../../test/arcade-fixtures';
import {STORAGE_KEY} from './store';
beforeEach(()=>{localStorage.clear();sessionStorage.clear();seedAccountSession();Element.prototype.scrollIntoView=vi.fn()});afterEach(cleanup);
it('opens the cleaned feed, empty chat and notifications without demo copy or fake activity',async()=>{
 localStorage.setItem(`${STORAGE_KEY}:account:test-account`,JSON.stringify(legacyDefaults));
 const router=getRouter();router.update({history:createMemoryHistory({initialEntries:['/']})});await router.load();const {container}=render(<RouterProvider router={router}/>);
 await screen.findByRole('button',{name:'Notificações'});
 await waitFor(()=>expect(container.textContent).not.toMatch(/demonstração|neste dispositivo|recriação|CraftPedro|BiaCraft/i));
 fireEvent.click(screen.getByRole('button',{name:'Notificações'}));expect(await screen.findByText('Estás em dia')).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Fechar'}));
 await router.navigate({to:'/chat'});expect(await screen.findByRole('button',{name:'Criar Chat'})).toBeInTheDocument();expect(screen.getByText('Ainda não tens conversas')).toBeInTheDocument();
 expect(container.textContent).not.toMatch(/demonstração|neste dispositivo|recriação|armazenamento local/i);
});

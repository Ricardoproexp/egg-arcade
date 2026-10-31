import React from 'react';
import {it,expect,vi,afterEach} from 'vitest';
import {render,screen,cleanup} from '@testing-library/react';
import {WalletPanel} from './wallet-panel';
import {diamondValue} from './gifts';
vi.mock('@tanstack/react-router',()=>({Link:({children,to,...props}:any)=><a href={to} {...props}>{children}</a>}));
afterEach(cleanup);
it('separates spending coins from earned diamonds and calculates euros accurately',()=>{
 render(<WalletPanel open setOpen={vi.fn()} coins={7} diamonds={250}/>);
 expect(screen.getByText('Moedas disponíveis')).toBeInTheDocument();expect(screen.getByText('Diamantes recebidos')).toBeInTheDocument();expect(screen.getByText('2,50 €')).toBeInTheDocument();
 expect(screen.getByRole('button',{name:'Levantamentos indisponíveis'})).toBeDisabled();
 expect(diamondValue(1).replace(/\s/g,'')).toBe('0,01€');expect(diamondValue(10000).replace(/\s/g,'')).toBe('100,00€');
});

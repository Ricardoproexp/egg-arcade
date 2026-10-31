import React from 'react';
import {it,expect,vi,afterEach} from 'vitest';
import {render,screen,cleanup,renderHook} from '@testing-library/react';
import {defaults,parseState} from './store';
import {legacyDefaults} from '../../test/arcade-fixtures';
import {streams} from './media';
import {useGiftWallet} from './gifts';
import {ShopPage} from './shop-page';
import {WalletPanel} from './wallet-panel';
vi.mock('./back-link',()=>({BackLink:({children}:any)=><a href="/">{children}</a>}));
afterEach(cleanup);
it('starts with no fabricated people, activity, posts, communities or streams',()=>{
 expect(streams).toEqual([]);expect(defaults.posts).toEqual([]);expect(defaults.conversations).toEqual([]);expect(defaults.followers).toEqual([]);expect(defaults.communities).toEqual([]);expect(defaults.messages).toEqual({});
});
it('cleans old fixtures without removing profiles, uploads, real posts or message history',()=>{
 const state=structuredClone(legacyDefaults);state.profile.avatar='data:image/png;base64,YQ==';state.profile.bio='A minha biografia';
 state.posts.push({id:'own-post',author:state.profile.name,handle:state.profile.handle,own:true,text:'A minha publicação',image:'data:image/png;base64,YQ==',game:'Minecraft',likes:0,time:'agora'});
 state.conversations[0]!.messages.push({id:'mine',author:state.profile.name,own:true,text:'A minha mensagem'});
 state.conversations.push({id:'my-group',name:'A equipa',kind:'group',members:['ana'],createdBy:'account:me',accepted:true,hasHistory:false,followsMe:false,messages:[]});
 state.followed.push('ana');state.followers.push('ana');state.communities.push({id:'own-community',name:'A minha comunidade',game:'Minecraft',description:'Descrição',members:'0'});
 const restored=parseState(JSON.stringify(state));
 expect(restored.profile).toEqual(state.profile);expect(restored.posts.map(p=>p.id)).toEqual(['own-post']);expect(restored.conversations.find(t=>t.id==='dm-demo-pedro')?.messages.map(m=>m.id)).toEqual(['mine']);expect(restored.conversations.some(t=>t.id==='my-group')).toBe(true);
 expect(restored.followers).toEqual(['ana']);expect(restored.followed).toEqual(['ana']);expect(restored.communities.map(c=>c.id)).toEqual(['own-community']);expect(restored.comments['p1']).toEqual([]);
 expect(parseState(JSON.stringify(restored))).toEqual(restored);
});
it('does not expose fictitious balances or allow purchases before payments are integrated',async()=>{
 const buy=vi.fn();render(<ShopPage balance={99999} onBuy={buy}/>);
 expect(screen.queryByText(/99999|demonstração|local/i)).not.toBeInTheDocument();expect(screen.getByRole('button',{name:'Disponível em breve'})).toBeDisabled();expect(buy).not.toHaveBeenCalled();
 const {result}=renderHook(()=>useGiftWallet());expect(result.current.balance).toBe(0);expect((await result.current.buyDemoCoins(100)).ok).toBe(false);
});
it('keeps the wallet unavailable instead of presenting play balances as real earnings',()=>{
 render(<WalletPanel open setOpen={vi.fn()} coins={100000} diamonds={999999}/>);
 expect(screen.getByRole('button',{name:'Disponível em breve'})).toBeDisabled();expect(screen.queryByText(/999.999|100.000|0,01|demonstração/i)).not.toBeInTheDocument();
});

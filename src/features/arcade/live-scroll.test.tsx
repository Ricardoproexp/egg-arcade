import React from 'react';
import {it,expect,vi,afterEach} from 'vitest';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {LivePage} from './live-page';
import {streams} from './media';
vi.mock('@tanstack/react-router',()=>({Link:({children,...props}:any)=><a>{children}</a>}));
afterEach(cleanup);
it('follows a new incoming message even after reading older comments',()=>{
 const props={stream:streams[0],following:false,popularity:0,onFollow:vi.fn(),onSend:vi.fn(),onGift:vi.fn(),coinBalance:10,onMinute:vi.fn(),storageError:false};
 const first={id:'one',author:'Viewer',own:false,text:'Primeira'};
 const {rerender}=render(<LivePage {...props} messages={[first]}/>);
 const log=screen.getByRole('log');Object.defineProperties(log,{scrollHeight:{configurable:true,value:900},clientHeight:{configurable:true,value:200}});
 log.scrollTop=30;fireEvent.scroll(log);expect(screen.getByText('Comentários recentes')).toBeInTheDocument();
 rerender(<LivePage {...props} messages={[first,{id:'two',author:'Viewer',own:false,text:'Nova mensagem'}]}/>);
 expect(log.scrollTop).toBe(900);expect(screen.queryByText('Comentários recentes')).not.toBeInTheDocument();
 log.scrollTop=40;fireEvent.scroll(log);expect(log.scrollTop).toBe(40);
});

import React,{useState} from 'react';
import {it,expect,vi,afterEach} from 'vitest';
import {render,screen,fireEvent,cleanup,waitFor,within} from '@testing-library/react';
import {ChatPage} from './chat-page';
import {defaults,type State} from './store';
import {saveChatAttachment,validChatAttachment} from './chat-attachments';
vi.mock('@tanstack/react-router',()=>({Link:({to,children,...p}:any)=><a href={to} {...p}>{children}</a>}));
vi.mock('./chat-attachments',async original=>({...await original<typeof import('./chat-attachments')>(),saveChatAttachment:vi.fn(),ChatMedia:({attachment,file}:any)=><span data-testid="media">{file?.name??attachment?.name}</span>}));
afterEach(()=>{cleanup();vi.clearAllMocks()});
function Wrapper(){const [state,setState]=useState<State>(structuredClone(defaults));return <ChatPage state={state} setState={setState} search=""/>}
function open(){render(<Wrapper/>);fireEvent.click(screen.getByRole('button',{name:'Abrir conversa: CraftPedro'}))}
it('places the profile photo between back and username',()=>{open();const back=screen.getByRole('button',{name:'Voltar à lista de conversas'});expect(back.nextElementSibling).toHaveClass('avatar-link');expect(back.nextElementSibling?.querySelector('img')).toBeTruthy()});
it('previews and sends an attachment without requiring text',async()=>{
 vi.mocked(saveChatAttachment).mockResolvedValue({id:'media1',name:'clip.mp4',kind:'video'});open();
 fireEvent.change(screen.getByLabelText('Selecionar imagem ou vídeo'),{target:{files:[new File(['video'],'clip.mp4',{type:'video/mp4'})]}});
 expect(screen.getByRole('button',{name:'Remover anexo'})).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Enviar mensagem'}));
 await waitFor(()=>expect(screen.queryByRole('button',{name:'Remover anexo'})).not.toBeInTheDocument());
 expect(screen.getByTestId('media')).toHaveTextContent('clip.mp4');
 expect(within(screen.getByRole('button',{name:'Abrir conversa: CraftPedro'})).getByText('Vídeo')).toBeInTheDocument();
});
it('retains attachment after a storage error and allows removal',async()=>{
 vi.mocked(saveChatAttachment).mockRejectedValue(new Error('quota'));open();
 fireEvent.change(screen.getByLabelText('Selecionar imagem ou vídeo'),{target:{files:[new File(['image'],'photo.png',{type:'image/png'})]}});
 fireEvent.click(screen.getByRole('button',{name:'Enviar mensagem'}));
 expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível guardar');
 fireEvent.click(screen.getByRole('button',{name:'Remover anexo'}));expect(screen.queryByTestId('media')).not.toBeInTheDocument();
});
it('rejects unsupported and oversized attachments',()=>{expect(validChatAttachment(new File(['html'],'page.html',{type:'text/html'}))).toBe(false);expect(validChatAttachment({type:'video/mp4',size:26*1024*1024} as File)).toBe(false);expect(validChatAttachment(new File(['png'],'photo.png',{type:'image/png'}))).toBe(true)});

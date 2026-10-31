import {seedConversations as initialConversations} from '../../test/arcade-fixtures';
import {legacyDefaults as defaults} from '../../test/arcade-fixtures';
import React,{useState} from 'react';
import {describe,it,expect,vi,beforeEach,afterEach} from 'vitest';
import {render,screen,fireEvent,cleanup,within} from '@testing-library/react';
import {ChatPage} from './chat-page';
import {parseState,type State} from './store';
import {isMessageRequest,receiveMessage} from './chat-model';
vi.mock('@tanstack/react-router',()=>({Link:({to,children,...p}:any)=><a href={to} {...p}>{children}</a>}));
beforeEach(()=>{Element.prototype.scrollIntoView=vi.fn()});afterEach(cleanup);
function Wrapper({joined=[],initial}:{joined?:string[];initial?:State}){const [state,setState]=useState<State>(initial??{...structuredClone(defaults),joined,followed:['RafaFPS','Luna Plays','CraftPedro'],followers:['RafaFPS','Luna Plays','CraftPedro']});return <ChatPage state={state} setState={setState} search=""/>}
describe('Chat routing',()=>{
 it('requires mutual following and previous conversation unless explicitly accepted',()=>{
  for(const mine of [false,true])for(const theirs of [false,true])for(const history of [false,true]){
   const t={...initialConversations[1],followsMe:theirs,hasHistory:history};
   expect(isMessageRequest(t,mine?['BiaCraft']:[])).toBe(!(mine&&theirs&&history));
   expect(isMessageRequest({...t,accepted:true},[])).toBe(false);
  }
 });
 it('blocks incoming messages from blocked users and keeps first messages in requests',()=>{
  expect(receiveMessage([],'BiaCraft','olá',[],['BiaCraft'],true)).toEqual([]);
  const received=receiveMessage([],'BiaCraft','olá',['BiaCraft'],[],true);
  expect(isMessageRequest(received[0],['BiaCraft'])).toBe(true);
 });
 it('migrates previous local room messages without losing profile data',()=>{
  const legacy:any=structuredClone(defaults);delete legacy.conversations;delete legacy.blockedChatUsers;
  legacy.messages.r0.push({id:'mine',author:'Eu',text:'Mensagem antiga',own:true});
  const restored=parseState(JSON.stringify(legacy));
  expect(restored.conversations.find(t=>t.id==='legacy:r0')?.messages.at(-1)?.text).toBe('Mensagem antiga');
  expect(restored.profile.name).toBe(defaults.profile.name);
 });
 it('allows replying only after accepting a request and moves it to Messages',()=>{
  render(<Wrapper/>);fireEvent.click(screen.getByRole('tab',{name:'Solicitações de mensagem'}));
  fireEvent.click(screen.getByRole('button',{name:/BiaCraft/}));
  expect(screen.queryByRole('textbox',{name:'Mensagem'})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Aceitar'}));
  expect(screen.getByRole('tab',{name:'Mensagens'})).toHaveAttribute('aria-selected','true');
  fireEvent.change(screen.getByRole('textbox',{name:'Mensagem'}),{target:{value:'Olá Bia'}});
  fireEvent.click(screen.getByRole('button',{name:'Enviar mensagem'}));
  expect(within(screen.getByRole('button',{name:'Abrir conversa: BiaCraft'})).getByText('Olá Bia')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab',{name:'Solicitações de mensagem'}));
  expect(screen.queryByRole('button',{name:/BiaCraft/})).not.toBeInTheDocument();
 });
 it('shows only joined community channels',()=>{
  render(<Wrapper joined={['g1']}/>);fireEvent.click(screen.getByRole('tab',{name:'Canais'}));
  expect(screen.getByRole('button',{name:/PUBG Mobile Portugal/})).toBeInTheDocument();
  expect(screen.queryByRole('button',{name:/Minecraft Portugal/})).not.toBeInTheDocument();
 });
 it('creates a group and opens its conversation',()=>{
  render(<Wrapper/>);fireEvent.click(screen.getByRole('button',{name:'Criar Chat'}));
  fireEvent.click(screen.getByRole('button',{name:'Criar grupo'}));
  fireEvent.change(screen.getByLabelText('Nome do grupo'),{target:{value:'A nossa equipa'}});
  fireEvent.click(screen.getByRole('checkbox',{name:'RafaFPS'}));
  expect(screen.getByRole('button',{name:'Criar grupo'})).toBeDisabled();
  fireEvent.click(screen.getByRole('checkbox',{name:'Luna Plays'}));
  fireEvent.click(screen.getByRole('button',{name:'Criar grupo'}));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('button',{name:/A nossa equipa/})).toHaveAttribute('aria-pressed','true');
  expect(screen.getByRole('textbox',{name:'Mensagem'})).toBeInTheDocument();
 });
});
it('rejects requests and blocks their senders without allowing replies',()=>{
 render(<Wrapper/>);fireEvent.click(screen.getByRole('tab',{name:'Solicitações de mensagem'}));fireEvent.click(screen.getByRole('button',{name:/BiaCraft/}));fireEvent.click(screen.getByRole('button',{name:'Bloquear'}));
 expect(screen.queryByRole('button',{name:/Abrir conversa: BiaCraft/})).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Criar Chat'}));
 expect(screen.queryByRole('button',{name:'Conversar com BiaCraft'})).not.toBeInTheDocument();
});

it.each([29,30,31])('previews the last message with a 30-character limit (%i)',length=>{
 const state=structuredClone(defaults);
 const text='á'.repeat(length);
 state.conversations=[{id:'preview',name:'CraftPedro',kind:'private',members:['CraftPedro'],accepted:true,hasHistory:true,followsMe:true,messages:[{id:'old',author:'Eu',own:true,text:'Anterior'},{id:'last',author:'CraftPedro',own:false,text}]}];
 render(<ChatPage state={state} setState={vi.fn()} search=""/>);
 const card=screen.getByRole('button',{name:'Abrir conversa: CraftPedro'});
 expect(card).toHaveTextContent('á'.repeat(Math.min(length,30))+(length>30?'...':''));
 expect(card).not.toHaveTextContent('Mensagem privada');
 expect(card).not.toHaveTextContent('Abrir conversa →');
});

it('opens a full-screen conversation and returns to the list',()=>{
 render(<Wrapper/>);
 fireEvent.click(screen.getByRole('button',{name:/Abrir conversa:/}));
 expect(document.querySelector('.chat-page')).toHaveClass('chat-fullscreen');
 expect(document.body.style.overflow).toBe('hidden');
 fireEvent.click(screen.getByRole('button',{name:'Voltar à lista de conversas'}));
 expect(document.querySelector('.chat-page')).not.toHaveClass('chat-fullscreen');
 expect(document.body.style.overflow).not.toBe('hidden');
});

it('lists only mutual friends without an existing private chat and searches immediately',()=>{
 render(<Wrapper/>);fireEvent.click(screen.getByRole('button',{name:'Criar Chat'}));
 expect(screen.queryByRole('button',{name:'Conversar com CraftPedro'})).not.toBeInTheDocument();
 expect(screen.queryByRole('button',{name:'Conversar com BiaCraft'})).not.toBeInTheDocument();
 fireEvent.change(screen.getByRole('searchbox',{name:'Pesquisar amigos'}),{target:{value:'@RAFA'}});
 expect(screen.queryByRole('button',{name:'Conversar com Luna Plays'})).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Conversar com RafaFPS'}));
 expect(screen.getByRole('textbox',{name:'Mensagem'})).toBeInTheDocument();
 expect(document.querySelector('.chat-page')).toHaveClass('chat-fullscreen');
});
it('lets the group creator edit the name, remove a member with confirmation and add friends',()=>{
 const state=structuredClone(defaults);state.followed=['RafaFPS','Luna Plays','BiaCraft'];state.followers=[...state.followed];
 state.conversations=[{id:'group',kind:'group',name:'Equipa',members:['RafaFPS','Luna Plays'],createdBy:'local:playerone',createdByName:'Player One',accepted:true,followsMe:false,hasHistory:false,messages:[]}];
 render(<Wrapper initial={state}/>);fireEvent.click(screen.getByRole('button',{name:'Abrir conversa: Equipa'}));fireEvent.click(screen.getByRole('button',{name:'Detalhes do grupo'}));
 fireEvent.change(screen.getByRole('textbox',{name:'Nome do grupo'}),{target:{value:'Equipa PT'}});fireEvent.click(screen.getByRole('button',{name:'Guardar alterações'}));
 expect(screen.getByText('Grupo atualizado.')).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Remover RafaFPS do grupo'}));fireEvent.click(screen.getByRole('button',{name:'Cancelar'}));expect(screen.getByText('RafaFPS')).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Remover RafaFPS do grupo'}));fireEvent.click(screen.getByRole('button',{name:'Remover membro'}));expect(screen.queryByRole('button',{name:'Remover RafaFPS do grupo'})).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Adicionar',exact:true}));fireEvent.click(screen.getByRole('checkbox',{name:'BiaCraft'}));fireEvent.click(screen.getByRole('button',{name:'Adicionar (1)'}));
 expect(screen.getByRole('button',{name:'Remover BiaCraft do grupo'})).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Voltar à conversa'}));expect(screen.getByRole('button',{name:'Abrir conversa: Equipa PT'})).toBeInTheDocument();
});
it('gives ordinary members report and leave actions without admin controls',()=>{
 const state=structuredClone(defaults);state.conversations=[{id:'group',kind:'group',name:'Equipa',members:['RafaFPS','Luna Plays'],createdBy:'another-account',createdByName:'RafaFPS',accepted:true,followsMe:false,hasHistory:false,messages:[]}];
 render(<Wrapper initial={state}/>);fireEvent.click(screen.getByRole('button',{name:'Abrir conversa: Equipa'}));fireEvent.click(screen.getByRole('button',{name:'Detalhes do grupo'}));
 expect(screen.queryByRole('textbox',{name:'Nome do grupo'})).not.toBeInTheDocument();expect(screen.queryByRole('button',{name:'Adicionar'})).not.toBeInTheDocument();expect(screen.queryByRole('button',{name:/Remover .* do grupo/})).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Denunciar grupo'}));fireEvent.change(screen.getByLabelText('Motivo'),{target:{value:'Assédio ou intimidação'}});fireEvent.click(screen.getByRole('button',{name:'Guardar registo'}));
 expect(screen.getByText('Registo guardado. O serviço de moderação está indisponível.')).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Sair do grupo'}));fireEvent.click(within(screen.getByRole('dialog')).getByRole('button',{name:'Sair do grupo'}));
 expect(screen.queryByRole('button',{name:'Abrir conversa: Equipa'})).not.toBeInTheDocument();expect(screen.getByText('Saíste do grupo.')).toBeInTheDocument();
});

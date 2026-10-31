import React from 'react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { Arcade } from './arcade';
const navigateMock=vi.hoisted(()=>vi.fn());
vi.mock('@tanstack/react-router',()=>({useNavigate:()=>navigateMock,useRouterState:({select}:any)=>select({location:{pathname:'/',search:{}}}),Link:({to,children,...props}:any)=><a href={to} {...props}>{children}</a>}));
beforeEach(()=>{navigateMock.mockClear();localStorage.clear();Element.prototype.scrollIntoView=vi.fn();});
afterEach(cleanup);
describe('Header navigation',()=>{
 it('opens the menu and retains access to the profile',()=>{
  render(<Arcade/>);fireEvent.click(screen.getByRole('button',{name:'Abrir menu'}));
  expect(within(screen.getByRole('dialog')).getByRole('link',{name:'O meu perfil'})).toHaveAttribute('href','/perfil');
 });
 it('lists the reference menu in order and saves the notification preference',()=>{
  render(<Arcade/>);fireEvent.click(screen.getByRole('button',{name:'Abrir menu'}));
  const dialog=screen.getByRole('dialog');
  const nav=within(dialog).getByRole('navigation',{name:'Menu principal'});
  expect([...nav.children].map(n=>n.textContent?.replace(/^[^A-Za-zÀ-ÿ]+/,''))).toEqual(['Estatísticas da Livestream','Torneios','Meus NFTs','Eventos','Quadro de Líderes','Meus Jogos','Comunidades','Convide Amigos & Ganhe Prêmios','Meus Cupons']);
  fireEvent.click(within(dialog).getByRole('switch',{name:'Pausar Notificações'}));
  expect(localStorage.getItem('omlet-notifications-paused')).toBe('true');
  expect(screen.queryByLabelText('3 notificações por ler')).not.toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('button',{name:'Apagar'}));
  expect(within(dialog).getByRole('button',{name:'Confirmar eliminação'})).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('button',{name:'Cancelar'}));
  expect(within(dialog).queryByRole('button',{name:'Confirmar eliminação'})).not.toBeInTheDocument();
 });
 it('removes the Avatar option and keeps missions, balance and close accessible',()=>{
  render(<Arcade/>);fireEvent.click(screen.getByRole('button',{name:'Abrir menu'}));
  const dialog=within(screen.getByRole('dialog'));
  expect(dialog.queryByRole('button',{name:/Avatar/})).not.toBeInTheDocument();
  expect(dialog.getByRole('button',{name:/Missões/})).toBeInTheDocument();
  expect(dialog.getByRole('button',{name:'Moedas e saldo'})).toBeInTheDocument();
  expect(dialog.getByRole('button',{name:'Fechar'})).toBeInTheDocument();
 });
 it('closes the full-screen menu and restores the page controls',()=>{
  render(<Arcade/>);fireEvent.click(screen.getByRole('button',{name:'Abrir menu'}));
  const dialog=screen.getByRole('dialog');
  expect(dialog.className).not.toContain('translate-x-');
  expect(dialog.className).not.toContain('translate-y-');
  fireEvent.click(within(dialog).getByRole('button',{name:'Fechar'}));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Abrir menu'})).toBeInTheDocument();
 });
 it('opens the shop and clears the unread badge when notifications are read',()=>{
  render(<Arcade/>);fireEvent.click(screen.getByRole('button',{name:'Loja'}));
  expect(navigateMock).toHaveBeenCalledWith({to:'/loja'});
  fireEvent.click(screen.getByRole('button',{name:/^Notificações/}));
  fireEvent.click(screen.getByRole('button',{name:'Marcar todas como lidas'}));
  expect(screen.queryByLabelText('3 notificações por ler')).not.toBeInTheDocument();
 });
 it('suggests streams then restricts the list to followed creators',()=>{
  render(<Arcade/>);fireEvent.click(screen.getByRole('button',{name:'Pessoas em live'}));
  const dialog=screen.getByRole('dialog');
  expect(within(dialog).getByRole('heading',{name:'Lives sugeridas'})).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('button',{name:'Seguir de volta CraftPedro'}));
  expect(within(dialog).getByRole('heading',{name:'Quem segues em live'})).toBeInTheDocument();
  expect(within(dialog).queryByRole('button',{name:'Ver live de RafaFPS'})).not.toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('button',{name:'Ver live de CraftPedro'}));
  expect(navigateMock).toHaveBeenCalledWith({to:'/ao-vivo',search:{live:'s0'}});
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
 });
});
it('shows a clear explanation for every unavailable main menu action',()=>{
 render(<Arcade/>);fireEvent.click(screen.getByRole('button',{name:'Abrir menu'}));
 for(const label of ['Estatísticas da Livestream','Torneios','Meus NFTs','Eventos','Quadro de Líderes','Convide Amigos & Ganhe Prêmios','Meus Cupons','Missões','Moedas e saldo']){
  const dialog=within(screen.getByRole('dialog'));
  fireEvent.click(dialog.getByRole('button',{name:new RegExp(label.replace('&','&'))}));
  expect(document.querySelector('.drawer-detail p')?.textContent?.length).toBeGreaterThan(15);
  fireEvent.click(dialog.getByRole('button',{name:'Voltar ao menu'}));
 }
});

import React,{useContext} from 'react';
import {SessionContext} from './session-context';
function TestLogout(){const {logout}=useContext(SessionContext);return <button onClick={logout}>Terminar sessão</button>}
import {it,expect,afterEach,beforeEach,vi} from 'vitest';
import {webcrypto} from 'node:crypto';
import {createAccount} from './accounts';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {WelcomeGate} from './welcome';
beforeEach(()=>{localStorage.clear();sessionStorage.clear();vi.stubGlobal('crypto',webcrypto)});afterEach(cleanup);
it('shows onboarding, validates signup, persists preview session, logs out without a recovery step',async()=>{
 const view=render(<WelcomeGate><h1>Feed privado</h1><TestLogout/></WelcomeGate>);
 expect(await screen.findByRole('heading',{name:/O teu jogo/})).toBeInTheDocument();
 expect(screen.queryByText('Feed privado')).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Criar conta grátis'}));
 fireEvent.change(screen.getByLabelText('Nome de jogador'),{target:{value:'Ricardo'}});
 fireEvent.change(screen.getByLabelText('Email'),{target:{value:'demo@example.com'}});
 expect(screen.getByRole('img',{name:'Username disponível'})).toBeInTheDocument();
 expect(screen.getByRole('img',{name:'Email disponível'})).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Continuar'}));
 fireEvent.change(screen.getByLabelText('Palavra-passe'),{target:{value:'password1'}});
 fireEvent.change(screen.getByLabelText('Confirmar palavra-passe'),{target:{value:'different'}});
 fireEvent.click(screen.getByRole('button',{name:'Criar conta'}));
 expect(screen.getByRole('button',{name:'Criar conta'})).toBeDisabled();
 expect(screen.getByText('As palavras-passe ainda não coincidem.')).toBeInTheDocument();
 expect(screen.queryByRole('img',{name:'Palavras-passe coincidem'})).not.toBeInTheDocument();
 fireEvent.change(screen.getByLabelText('Confirmar palavra-passe'),{target:{value:'password1'}});
 expect(screen.getByRole('img',{name:'Palavras-passe coincidem'})).toBeInTheDocument();
 expect(screen.getByRole('img',{name:'Confirmação da palavra-passe correta'})).toBeInTheDocument();
 expect(screen.getByRole('button',{name:'Criar conta'})).toBeEnabled();
 fireEvent.click(screen.getByRole('button',{name:'Criar conta'}));
 await screen.findByText('Feed privado');
 expect(screen.queryByText('Guarda o teu código de recuperação')).not.toBeInTheDocument();
 expect(screen.getByText('Feed privado')).toBeInTheDocument();
 expect(JSON.stringify(localStorage)).not.toContain('password1');
 view.unmount();render(<WelcomeGate><h1>Feed privado</h1><TestLogout/></WelcomeGate>);
 expect(await screen.findByText('Feed privado')).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Terminar sessão'}));
 expect(screen.queryByText('Feed privado')).not.toBeInTheDocument();
 expect(screen.queryByRole('button',{name:'Esqueceu-se da senha?'})).not.toBeInTheDocument();
});

it('validates local login and restores the session without storing a plaintext password',async()=>{
 await createAccount('demo','demo@example.com','example123');
 render(<WelcomeGate><h1>Feed privado</h1><TestLogout/></WelcomeGate>);
 fireEvent.click(await screen.findByRole('button',{name:'Fazer login'}));
 fireEvent.change(screen.getByLabelText('Email'),{target:{value:'demo@example.com'}});
 fireEvent.change(screen.getByLabelText('Palavra-passe'),{target:{value:'example123'}});
 fireEvent.click(screen.getByRole('button',{name:'Mostrar palavra-passe'}));
 expect(screen.getByLabelText('Palavra-passe')).toHaveAttribute('type','text');
 fireEvent.submit(screen.getByLabelText('Email').closest('form')!);
 expect(await screen.findByText('Feed privado')).toBeInTheDocument();
 expect(JSON.stringify(sessionStorage)).not.toContain('example123');
});
it('checks normalized usernames and emails while typing and prevents duplicate registration',async()=>{
 localStorage.setItem('arcade-preview-registrations-v1',JSON.stringify([{username:'ricardo',email:'demo@example.com'}]));
 render(<WelcomeGate><h1>Feed privado</h1><TestLogout/></WelcomeGate>);
 fireEvent.click(await screen.findByRole('button',{name:'Criar conta grátis'}));
 expect(screen.getByPlaceholderText('Escolhe o teu @username')).toBeInTheDocument();
 expect(screen.getByPlaceholderText('youremail@exemple.com')).toBeInTheDocument();
 fireEvent.change(screen.getByLabelText('Nome de jogador'),{target:{value:'@RICARDO'}});
 fireEvent.change(screen.getByLabelText('Email'),{target:{value:'DEMO@example.com'}});
 expect(screen.getByText('Username já registado.')).toBeInTheDocument();
 expect(screen.getByText('Email já registado.')).toBeInTheDocument();
 expect(screen.getByRole('button',{name:'Continuar'})).toBeDisabled();
 fireEvent.change(screen.getByLabelText('Nome de jogador'),{target:{value:'new_player'}});
 fireEvent.change(screen.getByLabelText('Email'),{target:{value:'new@example.com'}});
 expect(screen.getByText('Username disponível.')).toBeInTheDocument();
 expect(screen.getByRole('button',{name:'Continuar'})).toBeEnabled();
 // Recheck storage at submission, including registrations from another tab.
 localStorage.setItem('arcade-preview-registrations-v1',JSON.stringify([{username:'new_player',email:'other@example.com'}]));
 fireEvent.click(screen.getByRole('button',{name:'Continuar'}));
 expect(screen.getByRole('alert')).toHaveTextContent('username já está registado');
});
it('keeps the same page height and content when the keyboard reduces the visual viewport',async()=>{
 const original=Object.getOwnPropertyDescriptor(window,'visualViewport');
 const viewport=new EventTarget() as EventTarget&{height:number};viewport.height=720;
 Object.defineProperty(window,'visualViewport',{configurable:true,value:viewport});
 try{
  const view=render(<WelcomeGate><h1>Feed privado</h1><TestLogout/></WelcomeGate>);
  fireEvent.click(await screen.findByRole('button',{name:'Criar conta grátis'}));
  screen.getByLabelText('Nome de jogador').focus();viewport.height=320;viewport.dispatchEvent(new Event('resize'));
  expect(document.documentElement.style.getPropertyValue('--entry-height')).toBe('720px');
  expect(screen.getByRole('heading',{name:'Entra para a equipa.'})).toBeInTheDocument();
  expect(screen.getByText('O próximo grande momento começa contigo.')).toBeInTheDocument();
  expect(screen.getByText('Já tens conta?')).toBeInTheDocument();
  expect(document.documentElement).not.toHaveClass('entry-short','entry-typing');
  view.unmount();
 }finally{if(original)Object.defineProperty(window,'visualViewport',original);else Reflect.deleteProperty(window,'visualViewport')}
});

it('returns from signup to login when opened from login',async()=>{
 render(<WelcomeGate><h1>Feed</h1></WelcomeGate>);
 fireEvent.click(await screen.findByRole('button',{name:'Já tenho conta. Fazer login'}));
 fireEvent.click(screen.getByRole('button',{name:'Criar conta'}));
 fireEvent.click(screen.getByRole('button',{name:'Voltar'}));
 expect(screen.getByRole('heading',{name:'Bom ver-te de volta.'})).toBeInTheDocument();
});

it('upgrades an existing preview session without losing its photos and isolates a subsequent signup',async()=>{
 localStorage.setItem('arcade-preview-session-v1',JSON.stringify({name:'Old',email:'old@example.com'}));
 const {defaults,STORAGE_KEY}=await import('./store');
 const old=structuredClone(defaults);old.profile={...old.profile,name:'Old',handle:'old',avatar:'data:image/png;base64,YQ==',banner:'data:image/png;base64,Yg=='};
 localStorage.setItem(STORAGE_KEY,JSON.stringify(old));
 render(<WelcomeGate><h1>Feed privado</h1><TestLogout/></WelcomeGate>);
 await screen.findByRole('heading',{name:'Protege a tua conta'});
 fireEvent.change(screen.getByLabelText('Nova palavra-passe'),{target:{value:'passwordOld'}});fireEvent.change(screen.getByLabelText('Confirmar palavra-passe'),{target:{value:'passwordOld'}});
 fireEvent.click(screen.getByRole('button',{name:'Guardar e continuar'}));
 await screen.findByText('Feed privado');
 const {accountKey}=await import('./account-storage');
 expect(JSON.parse(localStorage.getItem(accountKey(STORAGE_KEY))!).profile.avatar).toBe(old.profile.avatar);
 fireEvent.click(screen.getByRole('button',{name:'Terminar sessão'}));fireEvent.click(screen.getByRole('button',{name:'Criar conta'}));
 fireEvent.change(screen.getByLabelText('Nome de jogador'),{target:{value:'fresh'}});fireEvent.change(screen.getByLabelText('Email'),{target:{value:'fresh@example.com'}});fireEvent.click(screen.getByRole('button',{name:'Continuar'}));
 fireEvent.change(screen.getByLabelText('Palavra-passe'),{target:{value:'passwordFresh'}});fireEvent.change(screen.getByLabelText('Confirmar palavra-passe'),{target:{value:'passwordFresh'}});fireEvent.click(screen.getByRole('button',{name:'Criar conta'}));
 await screen.findByText('Feed privado');
 const fresh=JSON.parse(localStorage.getItem(accountKey(STORAGE_KEY))!);expect(fresh.profile.avatar).toBeUndefined();expect(fresh.profile.banner).toBeUndefined();expect(fresh.profile.name).toBe('fresh');expect(fresh.conversations).toEqual([]);
});

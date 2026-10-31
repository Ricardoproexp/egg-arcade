import { describe, expect, it } from 'vitest';
import { defaults, parseState, toggle, validImage, writeState, STORAGE_KEY } from './store';
describe('Persistência local Omlet', () => {
 it('recupera defaults de JSON inválido', () => expect(parseState('{').profile.name).toBe('Player One'));
 it('gostar e guardar podem ser revertidos', () => { expect(toggle([], 'p1')).toEqual(['p1']); expect(toggle(['p1'], 'p1')).toEqual([]); });
 it('persiste publicações e perfil após leitura', () => { const s = structuredClone(defaults); s.profile.name='Ricardo'; s.posts.unshift({id:'novo',author:'Ricardo',handle:'ricardo',game:'Minecraft',text:'A minha publicação',likes:0,time:'agora',own:true}); expect(writeState(s)).toBe(true); expect(parseState(localStorage.getItem(STORAGE_KEY)).posts[0].text).toBe('A minha publicação'); expect(parseState(localStorage.getItem(STORAGE_KEY)).profile.name).toBe('Ricardo'); });
 it('aceita imagens até 2 MB e rejeita ficheiros não suportados', () => { expect(validImage({type:'image/png',size:2097152})).toBe(true); expect(validImage({type:'image/png',size:2097153})).toBe(false); expect(validImage({type:'text/html',size:10})).toBe(false); });
 it('persistem adesões, comentários e mensagens locais', () => { const s=structuredClone(defaults); s.joined=['g0']; s.comments.p1=[{id:'c',text:'Olá',own:true,author:'Eu'}]; s.messages.r0=[{id:'m',text:'Local',own:true,author:'Eu'}]; const restored=parseState(JSON.stringify(s)); expect(restored.joined).toEqual(['g0']); expect(restored.comments.p1[0].text).toBe('Olá'); expect(restored.messages.r0[0].text).toBe('Local'); });
});

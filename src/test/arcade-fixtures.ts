import {games,type State} from '../features/arcade/store';
import type {Conversation} from '../features/arcade/chat-model';
export const seedConversations:Conversation[]=[
 {id:'dm-demo-pedro',name:'CraftPedro',kind:'private',members:['CraftPedro'],followsMe:true,hasHistory:true,accepted:true,messages:[{id:'hello-demo',text:'Esta é uma conversa privada de demonstração. As mensagens que escreveres ficam neste dispositivo.',author:'CraftPedro'}]},
 {id:'request-demo-bia',name:'BiaCraft',kind:'private',members:['BiaCraft'],followsMe:false,hasHistory:false,accepted:false,messages:[{id:'request-demo',text:'Olá! Queres explorar um novo mundo em Roblox? Esta solicitação é apenas um exemplo.',author:'BiaCraft'}]},
];
export const legacyDefaults: State = {
 groupReports: [], reports: [],
 conversations: structuredClone(seedConversations), blockedChatUsers: [],
 profile: { name: 'Player One', handle: 'playerone', bio: 'Sempre pronto para mais uma partida 🎮', game: 'Minecraft' },
 posts: [
 { id: 'p1', author: 'CraftPedro', handle: 'craftpedro', game: 'Minecraft', text: 'Depois de 3 dias, a nossa base está finalmente pronta! 🏡 Quem vinha viver aqui? Ainda falta a sala dos encantamentos…', image: 'minecraft', likes: 128, time: 'há 15 min' },
 { id: 'p2', author: 'Luna Plays', handle: 'lunaplays', game: 'Mobile Legends', text: 'É hoje que chegamos a Mythic! ✨ Qual é o vosso herói favorito nesta temporada?', image: 'legends', likes: 86, time: 'há 42 min' },
 { id: 'p3', author: 'RafaFPS', handle: 'rafafps', game: 'PUBG Mobile', text: 'Winner winner chicken dinner! 🍗 Uma última partida com a equipa. Quem alinha amanhã?', image: 'pubg', likes: 204, time: 'há 1 h' },
 { id: 'p4', author: 'BiaCraft', handle: 'biacraft', game: 'Roblox', text: 'Encontrei um obby incrível! Já conseguiram chegar ao último nível? 👀', likes: 43, time: 'há 2 h' },
 { id: 'p5', author: 'NinjaPT', handle: 'ninjapt', game: 'Free Fire', text: 'Booyah! 🔥 A equipa está em grande hoje.', image: 'freefire', likes: 75, time: 'há 3 h' }],
 liked: [], saved: [], followed: [], followers: ['CraftPedro'], joined: [], comments: { p1: [{ id: 'c1', text: 'Essa casa ficou incrível! 🔥', own: false, author: 'BiaCraft · exemplo' }] },
 communities: games.map((game, i) => ({ id: `g${i}`, name: `${game} Portugal`, game, description: `Um espaço local para partilhar as tuas aventuras de ${game}. As publicações e adesões ficam apenas neste dispositivo.`, members: ['12,4 mil', '8,2 mil', '6,8 mil', '4,1 mil', '9,3 mil'][i] ?? '0' })),
 rooms: games.map((game, i) => ({ id: `r${i}`, name: `${game} · Geral`, game })),
 messages: { r0: [{ id: 'm0', text: 'Bem-vindo à sala de Minecraft! Esta conversa é um exemplo. As mensagens que escreveres ficam apenas no teu dispositivo.', own: false, author: 'Mensagem de demonstração' }] }, readNotifications: false,
};

import type {State} from './store';
const sampleNames=new Set(['CraftPedro','RafaFPS','NinjaPT','Luna Plays','BiaCraft']);
const samplePostIds=new Set(['p1','p2','p3','p4','p5']);
const sampleMessageIds=new Set(['hello-demo','request-demo','m0','c1']);
// Remove only known seed records. Keep account profiles, uploads, user posts and messages.
export function cleanReleaseState(state:State):State{
 const removed=state.posts.filter(p=>!p.own&&samplePostIds.has(p.id)&&sampleNames.has(p.author)).map(p=>p.id);
 const cleanMessages=(messages:State['messages'])=>Object.fromEntries(Object.entries(messages).map(([id,list])=>[id,list.filter(m=>m?.own||!sampleMessageIds.has(m?.id))]));
 return {...state,posts:state.posts.filter(p=>!removed.includes(p.id)),liked:state.liked.filter(id=>!removed.includes(id)),saved:state.saved.filter(id=>!removed.includes(id)),
  conversations:state.conversations.map(t=>({...t,messages:t.messages.filter(m=>m.own||!sampleMessageIds.has(m.id))})).filter(t=>!['dm-demo-pedro','request-demo-bia'].includes(t.id)||t.messages.length>0),
  followed:state.followed.filter(n=>!sampleNames.has(n)),followers:state.followers.filter(n=>!sampleNames.has(n)),
  communities:state.communities.filter(c=>!/^g[0-4]$/.test(c.id)),joined:state.joined.filter(id=>!/^g[0-4]$/.test(id)),rooms:state.rooms.filter(r=>!/^r[0-4]$/.test(r.id)),
  messages:cleanMessages(state.messages),comments:cleanMessages(state.comments),readNotifications:true,
 };
}

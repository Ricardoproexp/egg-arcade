import {legacyDefaults as defaults} from '../../test/arcade-fixtures';
import {describe,it,expect} from 'vitest';
import {parseState} from './store';
import {createGroup,editGroup,addGroupMembers,removeGroupMember,leaveGroup,reportGroup,isGroupAdmin,mutualFriends,newChatFriends} from './chat-groups';
import {readGroupPhoto} from './group-photo';
const owner={id:'account:owner',name:'Player One'},member={id:'account:member',name:'Player One'};
function initial(){const state=structuredClone(defaults);state.followed=['RafaFPS','Luna Plays','BiaCraft','CraftPedro','Blocked','OnlyFollowing'];state.followers=['RafaFPS','Luna Plays','BiaCraft','CraftPedro','Blocked','OnlyFollower'];state.blockedChatUsers=['Blocked'];return state}
function groupState(){return createGroup(initial(),owner,'g','Squad',['RafaFPS','Luna Plays'],'data:image/webp;base64,YQ==')}
describe('group permissions and persistence',()=>{
 it('uses mutual following, excludes blocked users and existing chats including requests',()=>{
  expect(mutualFriends(initial())).toEqual(['BiaCraft','CraftPedro','Luna Plays','RafaFPS']);
  expect(newChatFriends(initial())).toEqual(['Luna Plays','RafaFPS']);
 });
 it('preserves creator identity, photo, members and message history after reload',()=>{
  const state=groupState();const group=state.conversations.find(t=>t.id==='g')!;
  group.messages=[{id:'m',author:owner.name,own:true,text:'Vamos jogar!'}];
  const restored=parseState(JSON.stringify(state)).conversations.find(t=>t.id==='g')!;
  expect(restored).toEqual(group);expect(isGroupAdmin(restored,owner)).toBe(true);expect(isGroupAdmin(restored,member)).toBe(false);
 });
 it('rejects duplicate, non-friend or insufficient selections',()=>{
  const state=initial();
  expect(createGroup(state,owner,'g','Squad',['RafaFPS','RafaFPS'])).toBe(state);
  expect(createGroup(state,owner,'g','Squad',['RafaFPS','Blocked'])).toBe(state);
  expect(createGroup(state,owner,'g','Squad',['RafaFPS','OnlyFollowing'])).toBe(state);
  expect(createGroup(state,owner,'g',' ',['RafaFPS','Luna Plays'])).toBe(state);
 });
 it('guards mutations by stable account identity, including users with identical display names',()=>{
  const state=groupState();
  expect(editGroup(state,member,'g',{name:'Hijacked',avatar:''})).toBe(state);
  expect(addGroupMembers(state,member,'g',['BiaCraft'])).toBe(state);
  expect(removeGroupMember(state,member,'g','RafaFPS')).toBe(state);
  expect(leaveGroup(state,owner,'g')).toBe(state);
 });
 it('retains an empty group and its admin when the last other member is removed',()=>{
  let state=removeGroupMember(groupState(),owner,'g','RafaFPS');state=removeGroupMember(state,owner,'g','Luna Plays');
  const restored=parseState(JSON.stringify(state));expect(restored.conversations.find(t=>t.id==='g')?.members).toEqual([]);
  expect(addGroupMembers({...restored,followed:['BiaCraft'],followers:['BiaCraft']},owner,'g',['BiaCraft']).conversations.find(t=>t.id==='g')?.members).toEqual(['BiaCraft']);
 });
 it('persists reports separately after leaving and rejects invalid report reasons',()=>{
  const state=groupState();expect(reportGroup(state,member,'g','invalid','')).toBe(state);
  const reported=reportGroup(state,member,'g','Spam ou publicidade','Teste');const left=leaveGroup(reported,member,'g');
  expect(left.conversations.some(t=>t.id==='g')).toBe(false);expect(parseState(JSON.stringify(left)).groupReports[0]).toMatchObject({groupId:'g',reason:'Spam ou publicidade',details:'Teste'});
 });
 it('sanitizes invalid stored photos and never grants admin to old groups without a creator',()=>{
  const state=groupState();const group=state.conversations.find(t=>t.id==='g')!;delete group.createdBy;group.avatar='javascript:invalid';
  const restored=parseState(JSON.stringify(state)).conversations.find(t=>t.id==='g')!;expect(restored.avatar).toBeUndefined();expect(isGroupAdmin(restored,owner)).toBe(false);
 });
 it('rejects invalid photo formats and oversized images before decoding',async()=>{
  await expect(readGroupPhoto(new File(['test'],'test.svg',{type:'image/svg+xml'}))).rejects.toThrow('JPEG');
  await expect(readGroupPhoto(new File([new Uint8Array(2*1024*1024+1)],'large.png',{type:'image/png'}))).rejects.toThrow('2 MB');
 });
});

it('resolves mutual following from another local account and honours an unfollow',()=>{
 const account={id:'local-friend',username:'gamer_local',email:'local@example.invalid',salt:'test',passwordHash:'test',recoveryHash:'test',revision:1};
 localStorage.setItem('arcade-accounts-v2',JSON.stringify([account]));
 const state=initial();state.followed.push('gamer_local');
 localStorage.setItem('omlet-recreation-v1:account:local-friend',JSON.stringify({followed:[state.profile.handle]}));
 expect(newChatFriends(state)).toContain('gamer_local');
 localStorage.setItem('omlet-recreation-v1:account:local-friend',JSON.stringify({followed:[]}));
 expect(newChatFriends(state)).not.toContain('gamer_local');
 localStorage.clear();
});

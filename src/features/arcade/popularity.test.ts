import { describe,it,expect } from 'vitest';
import { parsePopularity,rankLives } from './popularity';
describe('Live popularity',()=>{
 it('ignores corrupt and unsafe persisted scores',()=>{
 expect(parsePopularity('{')).toEqual({});
 expect(parsePopularity('{"s0":12,"s1":-1,"s2":"20","s3":1.2,"unknown":8}')).toEqual({s0:12});
 });
 it('can feature a popular stream above one with more viewers without mutating the list',()=>{
 const list=[{id:'s0',audience:1200,popularity:0},{id:'s1',audience:400,popularity:1000}];
 expect(rankLives(list,{}).map(s=>s.id)).toEqual(['s1','s0']);
 expect(rankLives(list,{s0:300}).map(s=>s.id)).toEqual(['s0','s1']);
 expect(list[0].id).toBe('s0');
 });
});

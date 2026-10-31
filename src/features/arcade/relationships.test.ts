import {it,expect} from 'vitest';
import {followLabel} from './relationships';
import {parseState,defaults} from './store';
it('covers all four follow states',()=>{
 expect(followLabel({followed:[],followers:[]},'Luna')).toBe('Seguir');
 expect(followLabel({followed:[],followers:['Luna']},'Luna')).toBe('Seguir de volta');
 expect(followLabel({followed:['Luna'],followers:[]},'Luna')).toBe('A seguir');
 expect(followLabel({followed:['Luna'],followers:['Luna']},'Luna')).toBe('Amigos');
});
it('migrates existing follower information and keeps it independent of chat deletion',()=>{
 const old:any=structuredClone(defaults);delete old.followers;
 const migrated=parseState(JSON.stringify(old));expect(migrated.followers).toEqual(['CraftPedro']);
 migrated.conversations=[];expect(parseState(JSON.stringify(migrated)).followers).toEqual(['CraftPedro']);
});

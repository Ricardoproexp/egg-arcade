import {it,expect} from 'vitest';
import {formatCount} from './format-count';
it.each([[0,'0'],[999,'999'],[1000,'1K'],[1500,'1,5K'],[10000,'10K'],[100000,'100K'],[999949,'999,9K'],[999950,'1M'],[1000000,'1M'],[1500000,'1,5M']])('formats %i as %s',(value,expected)=>{expect(formatCount(value as number)).toBe(expected)});

import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {renderHook,act,cleanup} from '@testing-library/react';
import {seedAccountSession} from '../../test/account-session';
import {endSession} from './accounts';
import {isAccountOnline,usePublishPresence,useAccountOnline} from './presence';
beforeEach(()=>{localStorage.clear();seedAccountSession();vi.useFakeTimers()});
afterEach(()=>{cleanup();vi.useRealTimers()});
it('publishes an active session and clears presence when the app closes',()=>{
 const publisher=renderHook(()=>usePublishPresence());
 expect(isAccountOnline('account:test-account')).toBe(true);
 expect(isAccountOnline('account:other')).toBe(false);
 publisher.unmount();expect(isAccountOnline('account:test-account')).toBe(false);
});
it('updates online and offline listeners and expires abandoned sessions',()=>{
 renderHook(()=>usePublishPresence());
 const viewer=renderHook(()=>useAccountOnline('account:test-account'));
 expect(viewer.result.current).toBe(true);
 act(()=>window.dispatchEvent(new Event('offline')));expect(viewer.result.current).toBe(false);
 act(()=>window.dispatchEvent(new Event('online')));expect(viewer.result.current).toBe(true);
 expect(isAccountOnline('account:test-account',Date.now()+91_000)).toBe(false);
});
it('does not show a revoked session as online after logout',()=>{
 renderHook(()=>usePublishPresence());
 endSession();expect(isAccountOnline('account:test-account')).toBe(false);
});
